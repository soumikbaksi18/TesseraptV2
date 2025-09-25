import React, { useState } from 'react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { APTOS_CONTRACT_ADDRESSES } from '@/lib/config/aptos';

interface ContractInitializerProps {
  onInitialized: () => void;
}

export const ContractInitializer: React.FC<ContractInitializerProps> = ({ onInitialized }) => {
  const { isConnected, walletAddress, signAndSubmitTransaction } = usePetraWallet();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<string>('');

  const initializeContracts = async () => {
    if (!isConnected || !walletAddress || !signAndSubmitTransaction) {
      setInitStatus('❌ Wallet not connected');
      return;
    }

    setIsInitializing(true);
    setInitStatus('🚀 Initializing contracts...');

    try {
      // Since the contracts use `public fun` not `entry fun`, 
      // we need to call them through a transaction script
      const transaction = {
        type: "script",
        code: `
          script {
            use ${APTOS_CONTRACT_ADDRESSES.INTEREST_RATE_MODEL.split('::')[0]}::interest_rate_model;
            use ${APTOS_CONTRACT_ADDRESSES.COLLATERAL_VAULT.split('::')[0]}::collateral_vault;
            use ${APTOS_CONTRACT_ADDRESSES.LOAN_MANAGER.split('::')[0]}::loan_manager;
            use ${APTOS_CONTRACT_ADDRESSES.CTRL_BTC_TOKEN.split('::')[0]}::ctrl_btc_token;
            use ${APTOS_CONTRACT_ADDRESSES.LN_BTC_TOKEN.split('::')[0]}::ln_btc_token;

            fun init_contracts(admin: &signer) {
              let admin_address = std::signer::address_of(admin);

              // Initialize Interest Rate Model
              let _irm_addr = interest_rate_model::initialize(admin);

              // Initialize Collateral Vault
              let _cv_addr = collateral_vault::initialize(admin, admin_address);

              // Initialize Loan Manager  
              let _lm_addr = loan_manager::initialize(admin, admin_address, admin_address);

              // Initialize tokens
              let _ctrl_metadata = ctrl_btc_token::initialize(admin, admin_address);
              let _ln_metadata = ln_btc_token::initialize(admin, admin_address);
            }
          }
        `,
        arguments: [],
        type_arguments: [],
      };

      const result = await signAndSubmitTransaction(transaction);
      
      setInitStatus('✅ Contracts initialized successfully!');
      console.log('Contract initialization successful:', result.hash);
      
      setTimeout(() => {
        onInitialized();
      }, 2000);

    } catch (error: any) {
      console.error('Contract initialization failed:', error);
      
      if (error.message?.includes('ALREADY_EXISTS')) {
        setInitStatus('✅ Contracts are already initialized!');
        setTimeout(() => {
          onInitialized();
        }, 2000);
      } else {
        setInitStatus(`❌ Failed to initialize: ${error.message}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-4">
          🚀 Initialize Lending Contracts
        </h3>
        
        <p className="text-gray-300 mb-6">
          Your contracts are deployed but need to be initialized before you can use lending features.
        </p>

        <div className="space-y-4">
          {initStatus && (
            <div className="p-4 bg-gray-700/50 rounded-lg">
              <p className="text-white">{initStatus}</p>
            </div>
          )}

          <button
            onClick={initializeContracts}
            disabled={!isConnected || isInitializing}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
              isConnected && !isInitializing
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isInitializing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Initializing...
              </span>
            ) : (
              'Initialize Contracts'
            )}
          </button>

          {!isConnected && (
            <p className="text-red-400 text-sm">
              Please connect your Petra wallet first
            </p>
          )}
        </div>

        <div className="mt-6 text-left">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">What will be initialized:</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>✓ Interest Rate Model (30%→5%, 45%→8%, 60%→10%)</li>
            <li>✓ Collateral Vault (for ctrlBTC deposits)</li>
            <li>✓ Loan Manager (for lnBTC loans)</li>
            <li>✓ ctrlBTC Token (collateral token)</li>
            <li>✓ lnBTC Token (loan token)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};