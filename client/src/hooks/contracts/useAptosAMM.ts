// Aptos AMM Hook
// This hook connects to the deployed Aptos Simple AMM contract

import { useState, useEffect } from 'react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { aptosClient, getAccountResource } from '@/lib/aptos/client';
import { APTOS_CONTRACT_ADDRESSES, APTOS_FUNCTIONS } from '@/lib/config/aptos';

// Get AMM state for PT/YT pair
export function useAptosAMMState() {
  const [data, setData] = useState<{
    reserveA: string;
    reserveB: string;
    fee: string;
    isPaused: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAMMState = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const resource = await getAccountResource(
          APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM.split('::')[0],
          `${APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM}::AMMState<${APTOS_CONTRACT_ADDRESSES.PT_TOKEN},${APTOS_CONTRACT_ADDRESSES.YT_TOKEN}>`
        );
        
        if (resource?.data) {
          setData({
            reserveA: resource.data.reserve_a || '0',
            reserveB: resource.data.reserve_b || '0',
            fee: resource.data.fee || '0',
            isPaused: resource.data.is_paused || false,
          });
        } else {
          setData({
            reserveA: '0',
            reserveB: '0',
            fee: '0',
            isPaused: false,
          });
        }
      } catch (err) {
        console.error('Error fetching AMM state:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch AMM state');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAMMState();
  }, []);

  return { data, isLoading, error, refetch: () => fetchAMMState() };
}

// Add liquidity to AMM
export function useAptosAddLiquidity() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLiquidity = async ({ 
    amountA, 
    amountB, 
    minAmountA, 
    minAmountB 
  }: { 
    amountA: string; 
    amountB: string; 
    minAmountA: string; 
    minAmountB: string; 
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM}::${APTOS_FUNCTIONS.SIMPLE_AMM.ADD_LIQUIDITY}`,
        arguments: [amountA, amountB, minAmountA, minAmountB],
        type_arguments: [APTOS_CONTRACT_ADDRESSES.PT_TOKEN, APTOS_CONTRACT_ADDRESSES.YT_TOKEN],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error adding liquidity:', err);
      setError(err instanceof Error ? err.message : 'Failed to add liquidity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { addLiquidity, isLoading, error };
}

// Remove liquidity from AMM
export function useAptosRemoveLiquidity() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeLiquidity = async ({ 
    liquidityAmount, 
    minAmountA, 
    minAmountB 
  }: { 
    liquidityAmount: string; 
    minAmountA: string; 
    minAmountB: string; 
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM}::${APTOS_FUNCTIONS.SIMPLE_AMM.REMOVE_LIQUIDITY}`,
        arguments: [liquidityAmount, minAmountA, minAmountB],
        type_arguments: [APTOS_CONTRACT_ADDRESSES.PT_TOKEN, APTOS_CONTRACT_ADDRESSES.YT_TOKEN],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error removing liquidity:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove liquidity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { removeLiquidity, isLoading, error };
}

// Swap PT for YT
export function useAptosSwapPTForYT() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swapPTForYT = async ({ 
    amountIn, 
    minAmountOut 
  }: { 
    amountIn: string; 
    minAmountOut: string; 
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM}::${APTOS_FUNCTIONS.SIMPLE_AMM.SWAP_A_FOR_B}`,
        arguments: [amountIn, minAmountOut],
        type_arguments: [APTOS_CONTRACT_ADDRESSES.PT_TOKEN, APTOS_CONTRACT_ADDRESSES.YT_TOKEN],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error swapping PT for YT:', err);
      setError(err instanceof Error ? err.message : 'Failed to swap PT for YT');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { swapPTForYT, isLoading, error };
}

// Swap YT for PT
export function useAptosSwapYTForPT() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swapYTForPT = async ({ 
    amountIn, 
    minAmountOut 
  }: { 
    amountIn: string; 
    minAmountOut: string; 
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.SIMPLE_AMM}::${APTOS_FUNCTIONS.SIMPLE_AMM.SWAP_B_FOR_A}`,
        arguments: [amountIn, minAmountOut],
        type_arguments: [APTOS_CONTRACT_ADDRESSES.PT_TOKEN, APTOS_CONTRACT_ADDRESSES.YT_TOKEN],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error swapping YT for PT:', err);
      setError(err instanceof Error ? err.message : 'Failed to swap YT for PT');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { swapYTForPT, isLoading, error };
}

// Calculate swap output amount
export function useAptosSwapCalculation() {
  const ammState = useAptosAMMState();
  const [data, setData] = useState<{
    ptToYtRate: number;
    ytToPtRate: number;
    ptToYtOutput: string;
    ytToPtOutput: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ammState.data) {
      setData(null);
      setIsLoading(ammState.isLoading);
      setError(ammState.error);
      return;
    }

    try {
      setIsLoading(false);
      setError(null);
      
      const reserveA = parseFloat(ammState.data.reserveA);
      const reserveB = parseFloat(ammState.data.reserveB);
      const fee = parseFloat(ammState.data.fee) / 10000; // Convert basis points to decimal
      
      if (reserveA === 0 || reserveB === 0) {
        setData({
          ptToYtRate: 0,
          ytToPtRate: 0,
          ptToYtOutput: '0',
          ytToPtOutput: '0',
        });
        return;
      }
      
      // Calculate rates (simplified constant product formula)
      const ptToYtRate = reserveB / reserveA;
      const ytToPtRate = reserveA / reserveB;
      
      // Calculate outputs for 1 unit (simplified)
      const ptToYtOutput = (reserveB * (1 - fee)).toString();
      const ytToPtOutput = (reserveA * (1 - fee)).toString();
      
      setData({
        ptToYtRate,
        ytToPtRate,
        ptToYtOutput,
        ytToPtOutput,
      });
    } catch (err) {
      console.error('Error calculating swap rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate swap rates');
      setData(null);
    }
  }, [ammState.data, ammState.isLoading, ammState.error]);

  return { data, isLoading, error, refetch: () => ammState.refetch() };
}

// Combined AMM dashboard data
export function useAptosAMMDashboard() {
  const ammState = useAptosAMMState();
  const swapCalculation = useAptosSwapCalculation();

  const isLoading = ammState.isLoading || swapCalculation.isLoading;
  const error = ammState.error || swapCalculation.error;

  return {
    data: {
      reserves: {
        pt: ammState.data?.reserveA || '0',
        yt: ammState.data?.reserveB || '0',
      },
      fee: ammState.data?.fee || '0',
      isPaused: ammState.data?.isPaused || false,
      rates: {
        ptToYt: swapCalculation.data?.ptToYtRate || 0,
        ytToPt: swapCalculation.data?.ytToPtRate || 0,
      },
      liquidity: {
        total: (parseFloat(ammState.data?.reserveA || '0') + parseFloat(ammState.data?.reserveB || '0')).toString(),
      },
    },
    isLoading,
    error: error || null,
    refetch: () => {
      ammState.refetch();
      swapCalculation.refetch();
    },
  };
}