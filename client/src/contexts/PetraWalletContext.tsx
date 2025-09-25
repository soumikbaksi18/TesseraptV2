"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

interface PetraWalletContextType {
  isConnected: boolean;
  walletAddress: string;
  isLoading: boolean;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string>;
  signTransaction: (transaction: any) => Promise<any>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
  account: any;
}

const PetraWalletContext = createContext<PetraWalletContextType | undefined>(undefined);

export const usePetraWallet = () => {
  const context = useContext(PetraWalletContext);
  if (context === undefined) {
    throw new Error('usePetraWallet must be used within a PetraWalletProvider');
  }
  return context;
};

interface PetraWalletProviderProps {
  children: ReactNode;
}

export const PetraWalletProvider: React.FC<PetraWalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Use the Aptos wallet hook
  const aptosWallet = useAptosWallet();
  const { connect, account, disconnect, signMessage: aptosSignMessage, signAndSubmitTransaction } = aptosWallet;
  
  // Debug wallet state
  useEffect(() => {
    console.log('PetraWallet: Wallet state changed:', {
      connected: aptosWallet.connected,
      connecting: aptosWallet.connecting,
      account: aptosWallet.account,
      wallet: aptosWallet.wallet,
      network: aptosWallet.network
    });
  }, [aptosWallet]);
  
  // Monitor account changes
  useEffect(() => {
    if (account) {
      console.log('PetraWallet: Account connected:', account.address);
    }
  }, [account]);

  // Update connection state when account changes
  useEffect(() => {
    if (account && aptosWallet.connected) {
      setIsConnected(true);
      setWalletAddress(account.address);
    } else {
      setIsConnected(false);
      setWalletAddress('');
    }
  }, [account, aptosWallet.connected]);

  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if Petra wallet is available in the browser
      if (typeof window !== 'undefined' && !(window as any).petra) {
        throw new Error('Petra wallet is not installed. Please install Petra wallet extension.');
      }
      
      console.log('PetraWallet: Attempting to connect...');
      
      // Try direct Petra wallet connection first (more reliable)
      if (typeof window !== 'undefined' && (window as any).petra) {
        const petra = (window as any).petra;
        
        try {
          console.log('PetraWallet: Using direct Petra API...');
          const response = await petra.connect();
          console.log('PetraWallet: Direct connection response:', response);
          
          if (response && response.address) {
            setIsConnected(true);
            setWalletAddress(response.address);
            console.log('PetraWallet: Successfully connected via direct API!');
            return;
          }
        } catch (directError) {
          console.warn('PetraWallet: Direct connection failed, trying adapter:', directError);
        }
      }
      
      // Fallback to wallet adapter
      if (connect) {
        console.log('PetraWallet: Trying wallet adapter...');
        await connect();
        
        console.log('PetraWallet: Connect call completed, waiting for account...');
        
        // Wait a bit for the account to be updated
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('PetraWallet: Account after connection:', account);
        
        if (account) {
          console.log('PetraWallet: Successfully connected via adapter!');
          return;
        }
      }
      
      throw new Error('Connection failed. Please check if you approved the connection in Petra wallet.');
      
    } catch (err: any) {
      console.error('PetraWallet: Connection failed:', err);
      setError(err.message || 'Failed to connect Petra wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Try direct Petra wallet disconnection first
      if (typeof window !== 'undefined' && (window as any).petra) {
        const petra = (window as any).petra;
        if (petra.disconnect) {
          await petra.disconnect();
        }
      }
      
      // Also try adapter disconnection
      if (typeof disconnect === 'function') {
        await disconnect();
      }
      
      // Reset local state
      setIsConnected(false);
      setWalletAddress('');
      setError('');
    } catch (err: any) {
      console.error('Error disconnecting Petra wallet:', err);
      // Even if there's an error, reset the local state
      setIsConnected(false);
      setWalletAddress('');
      setError('');
    }
  };

  const signMessage = async (message: string): Promise<string> => {
    if (!account) {
      throw new Error('No wallet connected');
    }

    try {
      const result = await aptosSignMessage({
        message: message,
        nonce: Date.now().toString(),
      });
      return result.signature;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign message');
    }
  };

  const signTransaction = async (transaction: any): Promise<any> => {
    if (!isConnected) {
      throw new Error('No wallet connected');
    }

    try {
      // If we have account from adapter, use it
      if (account && signAndSubmitTransaction) {
        const result = await signAndSubmitTransaction(transaction);
        return result;
      }
      
      // Otherwise use direct Petra API
      if (typeof window !== 'undefined' && (window as any).petra) {
        const petra = (window as any).petra;
        const result = await petra.signAndSubmitTransaction(transaction);
        return result;
      }
      
      throw new Error('No signing method available');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to sign transaction');
    }
  };

  // Custom signAndSubmitTransaction that works with both direct API and adapter
  const customSignAndSubmitTransaction = async (transaction: any): Promise<any> => {
    if (!isConnected) {
      throw new Error('No wallet connected');
    }

    try {
      // If we have account from adapter, use it
      if (account && signAndSubmitTransaction) {
        console.log('PetraWallet: Using adapter signAndSubmitTransaction');
        const result = await signAndSubmitTransaction(transaction);
        return result;
      }
      
      // Otherwise use direct Petra API
      if (typeof window !== 'undefined' && (window as any).petra) {
        console.log('PetraWallet: Using direct Petra signAndSubmitTransaction');
        const petra = (window as any).petra;
        const result = await petra.signAndSubmitTransaction(transaction);
        return result;
      }
      
      throw new Error('No signing method available');
    } catch (err: any) {
      console.error('PetraWallet: Transaction signing failed:', err);
      throw new Error(err.message || 'Failed to sign and submit transaction');
    }
  };

  const value: PetraWalletContextType = {
    isConnected,
    walletAddress,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    signMessage,
    signTransaction,
    signAndSubmitTransaction: customSignAndSubmitTransaction,
    account,
  };

  return (
    <PetraWalletContext.Provider value={value}>
      {children}
    </PetraWalletContext.Provider>
  );
};

// Main provider that wraps the Aptos wallet adapter
export const PetraWalletAdapterWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wallets = [new PetraWallet()];

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={false}>
      <PetraWalletProvider>
        {children}
      </PetraWalletProvider>
    </AptosWalletAdapterProvider>
  );
};

