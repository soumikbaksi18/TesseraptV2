import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { aptosClient } from '@/lib/aptos/client';
import { APTOS_CONTRACT_ADDRESSES, CONTRACT_ADDRESS } from '@/lib/config/aptos';

// Types for lending data
export interface LendingDashboard {
  totalCollateral: string;
  totalBorrowed: string;
  availableToBorrow: string;
  healthFactor: string;
  interestRates: {
    [key: number]: number; // LTV -> Interest Rate
  };
  activeLoans: LoanPosition[];
}

export interface LoanPosition {
  id: string;
  collateralAmount: string;
  borrowedAmount: string;
  ltv: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
}

export interface CollateralInfo {
  totalDeposited: string;
  availableToWithdraw: string;
  lockedInLoans: string;
}

// Hook to get lending dashboard data
export function useAptosLendingDashboard() {
  const { walletAddress, isConnected } = usePetraWallet();

  return useQuery({
    queryKey: ['aptosLendingDashboard', walletAddress],
    queryFn: async (): Promise<LendingDashboard> => {
      if (!walletAddress) {
        return {
          totalCollateral: '0',
          totalBorrowed: '0',
          availableToBorrow: '0',
          healthFactor: '∞',
          interestRates: { 30: 5, 45: 8, 60: 10 },
          activeLoans: []
        };
      }

      try {
        // Get user's collateral balance using view function
        const userCollateralResult = await aptosClient.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::collateral_vault::get_user_collateral`,
            functionArguments: [walletAddress]
          }
        }).catch(() => ['0']);

        const collateralAmount = userCollateralResult[0] as string || '0';

        // For now, assume no active loans (you can add loan manager view functions later)
        const loans: any[] = [];

        // Calculate total borrowed
        const totalBorrowed = loans.reduce((sum: number, loan: any) => sum + parseInt(loan.amount || '0'), 0).toString();

        // Calculate available to borrow (simplified)
        const collateralValue = parseInt(collateralAmount);
        const borrowedValue = parseInt(totalBorrowed);
        const maxBorrowable = Math.floor(collateralValue * 0.6); // 60% max LTV
        const availableToBorrowRaw = Math.max(0, maxBorrowable - borrowedValue);
        
        // Convert to proper decimal format for display (assuming 8 decimals for calculation)
        const availableToBorrow = (availableToBorrowRaw / Math.pow(10, 8)).toString();

        // Calculate health factor
        const healthFactor = borrowedValue > 0 
          ? (collateralValue * 0.75 / borrowedValue).toFixed(2) // 75% liquidation threshold
          : '∞';

        // Convert loans to LoanPosition format
        const activeLoans: LoanPosition[] = loans.map((loan: any, index: number) => ({
          id: `loan_${index}`,
          collateralAmount: loan.collateral_amount || '0',
          borrowedAmount: loan.amount || '0',
          ltv: parseInt(loan.ltv || '0'),
          interestRate: parseInt(loan.interest_rate || '5'),
          healthFactor: parseFloat(healthFactor),
          liquidationThreshold: 75
        }));

        return {
          totalCollateral: collateralAmount,
          totalBorrowed,
          availableToBorrow,
          healthFactor,
          interestRates: { 30: 5, 45: 8, 60: 10 }, // From interest rate model
          activeLoans
        };

      } catch (error) {
        console.warn('Error fetching lending dashboard, using mock data:', error);
        // Return mock data if contracts aren't initialized
        return {
          totalCollateral: '0',
          totalBorrowed: '0',
          availableToBorrow: '0',
          healthFactor: '∞',
          interestRates: { 30: 5, 45: 8, 60: 10 },
          activeLoans: []
        };
      }
    },
    enabled: isConnected,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Hook to get collateral information
export function useAptosCollateralInfo() {
  const { walletAddress, isConnected } = usePetraWallet();

  return useQuery({
    queryKey: ['aptosCollateralInfo', walletAddress],
    queryFn: async (): Promise<CollateralInfo> => {
      if (!walletAddress) {
        return {
          totalDeposited: '0',
          availableToWithdraw: '0',
          lockedInLoans: '0'
        };
      }

      try {
        // Get user's collateral data using view functions
        const totalDepositedResult = await aptosClient.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::collateral_vault::get_user_collateral`,
            functionArguments: [walletAddress]
          }
        }).catch(() => ['0']);

        const lockedInLoansResult = await aptosClient.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::collateral_vault::get_user_locked_collateral`,
            functionArguments: [walletAddress]
          }
        }).catch(() => ['0']);

        const availableToWithdrawResult = await aptosClient.view({
          payload: {
            function: `${CONTRACT_ADDRESS}::collateral_vault::get_user_available_collateral`,
            functionArguments: [walletAddress]
          }
        }).catch(() => ['0']);

        const totalDeposited = totalDepositedResult[0] as string || '0';
        const lockedInLoans = lockedInLoansResult[0] as string || '0';
        const availableToWithdraw = availableToWithdrawResult[0] as string || '0';

        return {
          totalDeposited,
          availableToWithdraw: Math.max(0, parseInt(availableToWithdraw)).toString(),
          lockedInLoans
        };

      } catch (error) {
        console.warn('Error fetching collateral info:', error);
        return {
          totalDeposited: '0',
          availableToWithdraw: '0',
          lockedInLoans: '0'
        };
      }
    },
    enabled: isConnected,
    staleTime: 1000 * 30,
  });
}

// Hook to deposit collateral (real contract interaction)
export function useAptosDepositCollateral() {
  const { isConnected, walletAddress, signAndSubmitTransaction } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!isConnected || !walletAddress || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log('Depositing collateral:', { amount, address: walletAddress });

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT}::deposit_collateral_entry`,
        arguments: [amount],
        type_arguments: [],
      };

      try {
        const result = await signAndSubmitTransaction(transaction);
        console.log('Collateral deposit successful:', {
          amount: (parseInt(amount) / 100000000).toFixed(8) + ' APT',
          hash: result.hash,
          address: walletAddress
        });
        return { hash: result.hash, success: true };
      } catch (error: any) {
        console.error('Collateral deposit failed:', error);
        // If contracts aren't initialized, provide helpful message
        if (error.message?.includes('RESOURCE_DOES_NOT_EXIST') || error.message?.includes('not found')) {
          throw new Error('Lending contracts need to be initialized. Please initialize contracts first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to withdraw collateral (real contract interaction)
export function useAptosWithdrawCollateral() {
  const { isConnected, walletAddress, signAndSubmitTransaction } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!isConnected || !walletAddress || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log('Withdrawing collateral:', { amount, address: walletAddress });

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT}::withdraw_collateral_entry`,
        arguments: [amount],
        type_arguments: [],
      };

      try {
        const result = await signAndSubmitTransaction(transaction);
        console.log('Collateral withdrawal successful:', {
          amount: (parseInt(amount) / 100000000).toFixed(8) + ' APT',
          hash: result.hash,
          address: walletAddress
        });
        return { hash: result.hash, success: true };
      } catch (error: any) {
        console.error('Collateral withdrawal failed:', error);
        if (error.message?.includes('RESOURCE_DOES_NOT_EXIST') || error.message?.includes('not found')) {
          throw new Error('Lending contracts need to be initialized. Please initialize contracts first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to create a loan (real contract interaction)
export function useAptosCreateLoan() {
  const { isConnected, walletAddress, signAndSubmitTransaction } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, ltv }: { amount: string; ltv: number }) => {
      if (!isConnected || !walletAddress || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log('Creating loan:', { amount, ltv, address: walletAddress });

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.LOAN_MANAGER}::create_loan_entry`,
        arguments: [amount, ltv.toString()], // collateral_amount, ltv_ratio
        type_arguments: [],
      };

      try {
        const result = await signAndSubmitTransaction(transaction);
        console.log('Loan creation successful:', {
          borrowed: (parseInt(amount) / 100000000).toFixed(8) + ' lnBTC',
          ltv: ltv + '%',
          hash: result.hash,
          address: walletAddress
        });
        return { hash: result.hash, success: true };
      } catch (error: any) {
        console.error('Loan creation failed:', error);
        if (error.message?.includes('RESOURCE_DOES_NOT_EXIST') || error.message?.includes('not found')) {
          throw new Error('Lending contracts need to be initialized. Please initialize contracts first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to repay loan (real contract interaction)
export function useAptosRepayLoan() {
  const { isConnected, walletAddress, signAndSubmitTransaction } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, amount }: { loanId: string; amount: string }) => {
      if (!isConnected || !walletAddress || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      console.log('Repaying loan:', { loanId, amount, address: walletAddress });

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.LOAN_MANAGER}::repay_loan_entry`,
        arguments: [loanId, amount],
        type_arguments: [],
      };

      try {
        const result = await signAndSubmitTransaction(transaction);
        console.log('Loan repayment successful:', {
          loanId,
          repaid: (parseInt(amount) / 100000000).toFixed(8) + ' lnBTC',
          hash: result.hash,
          address: walletAddress
        });
        return { hash: result.hash, success: true };
      } catch (error: any) {
        console.error('Loan repayment failed:', error);
        if (error.message?.includes('RESOURCE_DOES_NOT_EXIST') || error.message?.includes('not found')) {
          throw new Error('Lending contracts need to be initialized. Please initialize contracts first.');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
    },
  });
}

// Hook to get token balances for lending
export function useAptosLendingTokenBalances() {
  const { walletAddress, isConnected } = usePetraWallet();

  return useQuery({
    queryKey: ['aptosLendingTokenBalances', walletAddress],
    queryFn: async () => {
      if (!walletAddress) {
        return {
          apt: '0',
          ctrlBTC: '0',
          lnBTC: '0',
          xBTC: '0'
        };
      }

      try {
        // Get APT balance
        const aptBalance = await aptosClient.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`
        }).then(res => (res as any)?.coin?.value || '0').catch(() => '0');

        // Get ctrlBTC balance
        const ctrlBTCBalance = await aptosClient.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.CTRL_BTC_TOKEN}::CtrlBTCToken>`
        }).then(res => (res as any)?.coin?.value || '0').catch(() => '0');

        // Get lnBTC balance
        const lnBTCBalance = await aptosClient.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.LN_BTC_TOKEN}::LnBTCToken>`
        }).then(res => (res as any)?.coin?.value || '0').catch(() => '0');

        // Get xBTC balance
        const xBTCBalance = await aptosClient.getAccountResource({
          accountAddress: walletAddress,
          resourceType: `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.XBTC_TOKEN}::XBTCToken>`
        }).then(res => (res as any)?.coin?.value || '0').catch(() => '0');

        return {
          apt: aptBalance,
          ctrlBTC: ctrlBTCBalance,
          lnBTC: lnBTCBalance,
          xBTC: xBTCBalance
        };

      } catch (error) {
        console.warn('Error fetching lending token balances:', error);
        return {
          apt: '0',
          ctrlBTC: '0',
          lnBTC: '0',
          xBTC: '0'
        };
      }
    },
    enabled: isConnected,
    staleTime: 1000 * 30,
  });
}