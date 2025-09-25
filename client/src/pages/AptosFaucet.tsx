// Aptos Faucet Page
// This page provides faucet functionality for Aptos testnet tokens

import React, { useState } from 'react';
import { Coins, Zap, RefreshCw, CheckCircle, AlertCircle, Wallet, ExternalLink } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { useAptosFaucet, useAptosTestTokens } from '@/hooks/contracts/useAptosFaucet';
import { useAptosTokenBalances } from '@/hooks/contracts/useAptosYieldTokenization';
import { APTOS_EXPLORER_URL } from '@/lib/config/aptos';

// Design System Colors
const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const AptosFaucet: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState('SY');
  const [amount, setAmount] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [lastMint, setLastMint] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Wallet and contract hooks
  const { isConnected, walletAddress } = usePetraWallet();
  const { data: tokenBalances, isLoading: balancesLoading } = useAptosTokenBalances();
  const { testTokens } = useAptosTestTokens();
  const { mintSYTokens, mintTestAPT, isLoading: faucetLoading, error, lastMint: faucetLastMint } = useAptosFaucet();

  const handleMint = async () => {
    try {
      setIsLoading(true);
      setTxHash(null);
      
      let result;
      if (selectedToken === 'APT') {
        result = await mintTestAPT();
      } else {
        // Convert amount to smallest unit (8 decimals)
        const amountInSmallestUnit = (parseFloat(amount) * 100000000).toString();
        result = await mintSYTokens(amountInSmallestUnit);
      }
      
      setTxHash(result.hash);
      setLastMint(selectedToken);
    } catch (err) {
      console.error('Mint error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    return (parseFloat(balance) / 100000000).toFixed(4);
  };

  const getTokenBalance = (symbol: string) => {
    switch (symbol) {
      case 'SY':
        return formatBalance(tokenBalances?.syBalance || '0');
      case 'PT':
        return formatBalance(tokenBalances?.ptBalance || '0');
      case 'YT':
        return formatBalance(tokenBalances?.ytBalance || '0');
      default:
        return '0.0000';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Aptos Testnet Faucet</h1>
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5" style={{ color: colors.muted }} />
          <span className="text-sm" style={{ color: colors.muted }}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </span>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4" style={{ color: `${colors.primary}4D` }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.light }}>
              Wallet Not Connected
            </h3>
            <p style={{ color: colors.muted }}>
              Please connect your Petra wallet to use the faucet
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Wallet Info */}
          <div className="glass p-4 rounded-xl border" style={{ borderColor: colors.border }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: colors.muted }}>Wallet Address</p>
                <p className="font-mono text-sm" style={{ color: colors.light }}>
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
                </p>
              </div>
              <a
                href={`${APTOS_EXPLORER_URL}/account/${walletAddress}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm transition-colors duration-200 hover:opacity-80"
                style={{ color: colors.primary }}
              >
                View on Explorer
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Token Balances */}
          <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Current Balances</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {testTokens.map((token) => (
                  <div
                    key={token.symbol}
                    className="p-4 rounded-lg border"
                    style={{ borderColor: colors.border }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{token.icon}</span>
                      <div>
                        <p className="font-medium" style={{ color: colors.light }}>
                          {token.symbol}
                        </p>
                        <p className="text-sm" style={{ color: colors.muted }}>
                          {token.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {balancesLoading ? '...' : getTokenBalance(token.symbol)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Faucet Interface */}
          <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
            <div className="px-6 py-4 border-b" style={{ borderColor: colors.border }}>
              <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Mint Test Tokens</h3>
            </div>
            <div className="p-6 space-y-6">
              {/* Token Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  Select Token
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testTokens.map((token) => (
                    <button
                      key={token.symbol}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                        selectedToken === token.symbol ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: selectedToken === token.symbol ? colors.primary : colors.border,
                        backgroundColor: selectedToken === token.symbol ? `${colors.primary}10` : 'transparent',
                        ringColor: colors.primary,
                      }}
                      onClick={() => setSelectedToken(token.symbol)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{token.icon}</span>
                        <div>
                          <p className="font-medium" style={{ color: colors.light }}>
                            {token.symbol}
                          </p>
                          <p className="text-sm" style={{ color: colors.muted }}>
                            {token.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  Amount to Mint
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10"
                    className="flex-1 px-4 py-3 rounded-lg border bg-transparent"
                    style={{ borderColor: colors.border, color: colors.light }}
                  />
                  <button
                    className="px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-white/10"
                    style={{ borderColor: colors.border, color: colors.muted }}
                    onClick={() => setAmount('10')}
                  >
                    Default
                  </button>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Max: {testTokens.find(t => t.symbol === selectedToken)?.maxMint ? 
                    (parseInt(testTokens.find(t => t.symbol === selectedToken)?.maxMint || '0') / 100000000).toString() : '100'} {selectedToken}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 rounded-lg border" style={{ borderColor: '#ef4444', backgroundColor: '#ef444410' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" style={{ color: '#ef4444' }} />
                    <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
                  </div>
                </div>
              )}

              {/* Success Display */}
              {lastMint && txHash && (
                <div className="p-4 rounded-lg border" style={{ borderColor: '#10b981', backgroundColor: '#10b98110' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                    <p className="text-sm font-medium" style={{ color: '#10b981' }}>
                      Successfully minted {amount} {lastMint} tokens!
                    </p>
                  </div>
                  <a
                    href={`${APTOS_EXPLORER_URL}/txn/${txHash}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm transition-colors duration-200 hover:opacity-80"
                    style={{ color: colors.primary }}
                  >
                    View Transaction
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Mint Button */}
              <button
                className="w-full px-6 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)] disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: '#04060F',
                  border: `1px solid ${colors.primary}60`,
                }}
                onClick={handleMint}
                disabled={!amount || isLoading || faucetLoading}
              >
                {isLoading || faucetLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Minting...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Coins className="w-5 h-5" />
                    Mint {amount} {selectedToken}
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass p-6 rounded-xl border" style={{ borderColor: colors.border }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.light }}>How to Use</h3>
            <div className="space-y-3 text-sm" style={{ color: colors.muted }}>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
                <p>Connect your Petra wallet to the Aptos testnet</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">2</span>
                <p>Mint SY tokens to use as base tokens for yield farming</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">3</span>
                <p>Go to Yield Farming page to split SY tokens into PT + YT</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">4</span>
                <p>Use AMM to trade PT and YT tokens</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AptosFaucet;