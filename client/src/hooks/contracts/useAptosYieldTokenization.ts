// Aptos Yield Tokenization Hook
// This hook connects to the deployed Aptos yield tokenization contracts

import { useState, useEffect } from 'react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { aptosClient, getAccountResource, getTokenBalance } from '@/lib/aptos/client';
import { APTOS_CONTRACT_ADDRESSES, APTOS_FUNCTIONS } from '@/lib/config/aptos';

// Get all maturities from the yield tokenization contract
export function useAptosMaturities() {
  const [data, setData] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaturities = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const resource = await getAccountResource(
          APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION.split('::')[0],
          `${APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION.split('::')[0]}::yield_tokenization::ProtocolState`
        );
        
        if (resource?.data?.maturities) {
          setData(resource.data.maturities);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching maturities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch maturities');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaturities();
  }, []);

  return { data, isLoading, error, refetch: () => fetchMaturities() };
}

// Get PT and YT token addresses for a maturity
export function useAptosMaturityTokens(maturity: number) {
  const [data, setData] = useState<{ ptToken: string; ytToken: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!maturity) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For Aptos, PT and YT tokens are created dynamically
        // The addresses follow a pattern based on the maturity
        const contractAddress = APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION.split('::')[0];
        const ptToken = `${contractAddress}::pt_token::PTToken`;
        const ytToken = `${contractAddress}::yt_token::YTToken`;
        
        setData({ ptToken, ytToken });
      } catch (err) {
        console.error('Error fetching maturity tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch maturity tokens');
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, [maturity]);

  return { data, isLoading, error, refetch: () => fetchTokens() };
}

// Get token balances for a user
export function useAptosTokenBalances() {
  const { walletAddress } = usePetraWallet();
  const [data, setData] = useState<{
    syBalance: string;
    ptBalance: string;
    ytBalance: string;
  }>({ syBalance: '0', ptBalance: '0', ytBalance: '0' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setData({ syBalance: '0', ptBalance: '0', ytBalance: '0' });
      setIsLoading(false);
      return;
    }

    const fetchBalances = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const contractAddress = APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION.split('::')[0];
        
        const [syBalance, ptBalance, ytBalance] = await Promise.all([
          getTokenBalance(walletAddress, `${contractAddress}::standardized_wrapper::SYToken`),
          getTokenBalance(walletAddress, `${contractAddress}::pt_token::PTToken`),
          getTokenBalance(walletAddress, `${contractAddress}::yt_token::YTToken`),
        ]);
        
        setData({ syBalance, ptBalance, ytBalance });
      } catch (err) {
        console.error('Error fetching token balances:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch token balances');
        setData({ syBalance: '0', ptBalance: '0', ytBalance: '0' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [walletAddress]);

  return { data, isLoading, error, refetch: () => fetchBalances() };
}

// Split SY tokens into PT + YT
export function useAptosSplitTokens() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const splitTokens = async ({ syAmount, maturity }: { syAmount: string; maturity: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION}::${APTOS_FUNCTIONS.YIELD_TOKENIZATION.CREATE_PT_YT}`,
        arguments: [syAmount, maturity.toString()],
        type_arguments: [],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error splitting tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to split tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { splitTokens, isLoading, error };
}

// Combine PT + YT tokens back to SY
export function useAptosCombineTokens() {
  const { signAndSubmitTransaction } = usePetraWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const combineTokens = async ({ amount, maturity }: { amount: string; maturity: number }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!signAndSubmitTransaction) {
        throw new Error('Wallet not connected');
      }

      const transaction = {
        type: "entry_function_payload",
        function: `${APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION}::${APTOS_FUNCTIONS.YIELD_TOKENIZATION.BURN_PT}`,
        arguments: [amount, maturity.toString()],
        type_arguments: [],
      };

      const result = await signAndSubmitTransaction(transaction);
      return result;
    } catch (err) {
      console.error('Error combining tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to combine tokens');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { combineTokens, isLoading, error };
}

// Get formatted maturity data for UI
export function useAptosFormattedMaturities() {
  const maturitiesQuery = useAptosMaturities();

  const formattedData = maturitiesQuery.data.map((maturity: number) => ({
    timestamp: maturity,
    date: new Date(maturity * 1000),
    timeToMaturity: formatTimeToMaturity(maturity),
    isActive: maturity > Math.floor(Date.now() / 1000),
    label: maturity > Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) ? '6-month' : '3-month',
  }));

  return {
    ...maturitiesQuery,
    data: formattedData,
  };
}

// Combined yield tokenization dashboard data
export function useAptosYieldTokenizationDashboard() {
  const { walletAddress } = usePetraWallet();
  const maturities = useAptosMaturities();
  const balances = useAptosTokenBalances();

  const isLoading = maturities.isLoading || balances.isLoading;
  const error = maturities.error || balances.error;

  return {
    data: {
      availableSY: balances.data.syBalance,
      maturities: maturities.data || [],
      activeMaturities: (maturities.data || []).filter((m: number) => m > Math.floor(Date.now() / 1000)),
      ptBalance: balances.data.ptBalance,
      ytBalance: balances.data.ytBalance,
    },
    isLoading,
    error: error || null,
    refetch: () => {
      maturities.refetch();
      balances.refetch();
    },
  };
}

// Check yield tokenization contract status
export function useAptosYieldTokenizationStatus() {
  const [data, setData] = useState<{
    syTokenAddress: string;
    maturities: number[];
    maturityCount: number;
  }>({ syTokenAddress: '', maturities: [], maturityCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const contractAddress = APTOS_CONTRACT_ADDRESSES.YIELD_TOKENIZATION.split('::')[0];
        const resource = await getAccountResource(
          contractAddress,
          `${contractAddress}::yield_tokenization::ProtocolState`
        );
        
        if (resource?.data) {
          setData({
            syTokenAddress: `${contractAddress}::standardized_wrapper::SYToken`,
            maturities: resource.data.maturities || [],
            maturityCount: resource.data.maturities?.length || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching yield tokenization status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
        setData({ syTokenAddress: '', maturities: [], maturityCount: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { data, isLoading, error, refetch: () => fetchStatus() };
}

// Helper function to format time to maturity
function formatTimeToMaturity(maturity: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = maturity - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (24 * 60 * 60));
  const hours = Math.floor((diff % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((diff % (60 * 60)) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}