import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { aptosClient, getAptosFullFunctionId } from '@/lib/aptos/client';
import { APTOS_CONTRACT_ADDRESSES, CONTRACT_ADDRESS } from '@/lib/config/aptos';
import { HexString } from 'aptos';

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
        // Get collateral vault state
        const collateralVaultResource = await aptosClient.getAccountResource(
          HexString.fromUint8Array(HexString.ensure(CONTRACT_ADDRESS).toUint8Array()),
          `${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT}::VaultState`
        );

        // Get loan manager state
        const loanManagerResource = await aptosClient.getAccountResource(
          HexString.fromUint8Array(HexString.ensure(CONTRACT_ADDRESS).toUint8Array()),
          `${APTOS_CONTRACT_ADDRESSES.LOAN_MANAGER}::LoanManagerState`
        );

        // Get user's collateral balance
        const userCollateral = await aptosClient.getAccountResource(
          walletAddress,
          `${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT}::UserCollateral`
        ).catch(() => ({ data: { amount: '0' } }));

        // Get user's loans
        const userLoans = await aptosClient.getAccountResource(
          walletAddress,
          `${APTOS_CONTRACT_ADDRESSES.LOAN_MANAGER}::UserLoans`
        ).catch(() => ({ data: { loans: [] } }));

        const collateralAmount = (userCollateral.data as any)?.amount || '0';
        const loans = (userLoans.data as any)?.loans || [];

        // Calculate total borrowed
        const totalBorrowed = loans.reduce((sum: number, loan: any) => sum + parseInt(loan.amount || '0'), 0).toString();

        // Calculate available to borrow (simplified)
        const collateralValue = parseInt(collateralAmount);
        const borrowedValue = parseInt(totalBorrowed);
        const maxBorrowable = Math.floor(collateralValue * 0.6); // 60% max LTV
        const availableToBorrow = Math.max(0, maxBorrowable - borrowedValue).toString();

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
        // Get user's collateral data
        const userCollateral = await aptosClient.getAccountResource(
          walletAddress,
          `${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT}::UserCollateral`
        ).catch(() => ({ data: { amount: '0', locked: '0' } }));

        const data = userCollateral.data as any;
        const totalDeposited = data?.amount || '0';
        const lockedInLoans = data?.locked || '0';
        const availableToWithdraw = (parseInt(totalDeposited) - parseInt(lockedInLoans)).toString();

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

// Hook to deposit collateral
export function useAptosDepositCollateral() {
  const { signAndSubmitTransaction, isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!isConnected || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        function: getAptosFullFunctionId('collateral_vault', 'deposit'),
        arguments: [amount],
        type_arguments: ['0x1::aptos_coin::AptosCoin'], // Using APT as collateral
        options: {
          max_gas_amount: "200000",
          gas_unit_price: "100",
        },
      };

      console.log('Depositing collateral:', { amount, transaction });
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to withdraw collateral
export function useAptosWithdrawCollateral() {
  const { signAndSubmitTransaction, isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount }: { amount: string }) => {
      if (!isConnected || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        function: getAptosFullFunctionId('collateral_vault', 'withdraw'),
        arguments: [amount],
        type_arguments: ['0x1::aptos_coin::AptosCoin'],
        options: {
          max_gas_amount: "200000",
          gas_unit_price: "100",
        },
      };

      console.log('Withdrawing collateral:', { amount, transaction });
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to create a loan
export function useAptosCreateLoan() {
  const { signAndSubmitTransaction, isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, ltv }: { amount: string; ltv: number }) => {
      if (!isConnected || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        function: getAptosFullFunctionId('loan_manager', 'create_loan'),
        arguments: [amount, ltv.toString()],
        type_arguments: [
          '0x1::aptos_coin::AptosCoin', // Collateral type
          `${APTOS_CONTRACT_ADDRESSES.LN_BTC_TOKEN}::LnBTCToken` // Borrowed token type
        ],
        options: {
          max_gas_amount: "300000",
          gas_unit_price: "100",
        },
      };

      console.log('Creating loan:', { amount, ltv, transaction });
      const response = await signAndSubmitTransaction(transaction);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aptosLendingDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['aptosCollateralInfo'] });
    },
  });
}

// Hook to repay loan
export function useAptosRepayLoan() {
  const { signAndSubmitTransaction, isConnected } = usePetraWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loanId, amount }: { loanId: string; amount: string }) => {
      if (!isConnected || !signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        function: getAptosFullFunctionId('loan_manager', 'repay_loan'),
        arguments: [loanId, amount],
        type_arguments: [`${APTOS_CONTRACT_ADDRESSES.LN_BTC_TOKEN}::LnBTCToken`],
        options: {
          max_gas_amount: "200000",
          gas_unit_price: "100",
        },
      };

      console.log('Repaying loan:', { loanId, amount, transaction });
      const response = await signAndSubmitTransaction(transaction);
      return response;
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
        const aptBalance = await aptosClient.getAccountResource(
          walletAddress,
          `0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`
        ).then(res => (res.data as any)?.coin?.value || '0').catch(() => '0');

        // Get ctrlBTC balance
        const ctrlBTCBalance = await aptosClient.getAccountResource(
          walletAddress,
          `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.CTRL_BTC_TOKEN}::CtrlBTCToken>`
        ).then(res => (res.data as any)?.coin?.value || '0').catch(() => '0');

        // Get lnBTC balance
        const lnBTCBalance = await aptosClient.getAccountResource(
          walletAddress,
          `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.LN_BTC_TOKEN}::LnBTCToken>`
        ).then(res => (res.data as any)?.coin?.value || '0').catch(() => '0');

        // Get xBTC balance
        const xBTCBalance = await aptosClient.getAccountResource(
          walletAddress,
          `0x1::coin::CoinStore<${APTOS_CONTRACT_ADDRESSES.XBTC_TOKEN}::XBTCToken>`
        ).then(res => (res.data as any)?.coin?.value || '0').catch(() => '0');

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