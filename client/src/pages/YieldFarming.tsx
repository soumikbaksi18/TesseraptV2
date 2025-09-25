import React, { useState } from 'react';
import { Sprout, TrendingUp, Clock, Zap, Coins, ArrowUpDown, Plus, Minus } from 'lucide-react';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { 
  useAptosYieldTokenizationDashboard, 
  useAptosFormattedMaturities,
  useAptosSplitTokens,
  useAptosCombineTokens 
} from '@/hooks/contracts/useAptosYieldTokenization';
import { 
  useAptosAMMDashboard,
  useAptosAddLiquidity,
  useAptosSwapPTForYT,
  useAptosSwapYTForPT 
} from '@/hooks/contracts/useAptosAMM';

const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const YieldFarming: React.FC = () => {
  const { isConnected, walletAddress } = usePetraWallet();
  const [activeTab, setActiveTab] = useState<'split' | 'amm' | 'positions'>('split');
  const [splitAmount, setSplitAmount] = useState('');
  const [selectedMaturity, setSelectedMaturity] = useState<number | null>(null);
  
  // Real contract data
  const yieldDashboard = useAptosYieldTokenizationDashboard();
  const maturities = useAptosFormattedMaturities();
  const ammDashboard = useAptosAMMDashboard();
  
  // Contract interactions
  const { splitTokens, isLoading: isSplitting } = useAptosSplitTokens();
  const { combineTokens, isLoading: isCombining } = useAptosCombineTokens();
  const { addLiquidity, isLoading: isAddingLiquidity } = useAptosAddLiquidity();
  const { swapPTForYT, isLoading: isSwappingPT } = useAptosSwapPTForYT();
  const { swapYTForPT, isLoading: isSwappingYT } = useAptosSwapYTForPT();

  const handleSplitTokens = async () => {
    if (!selectedMaturity || !splitAmount) return;
    
    try {
      await splitTokens({
        syAmount: splitAmount,
        maturity: selectedMaturity,
      });
      // Refresh data after successful split
      yieldDashboard.refetch();
      ammDashboard.refetch();
    } catch (error) {
      console.error('Error splitting tokens:', error);
    }
  };

  const handleAddLiquidity = async () => {
    // This would need amount inputs from the UI
    try {
      await addLiquidity({
        amountA: '1000000', // 1 PT token (8 decimals)
        amountB: '1000000', // 1 YT token (8 decimals)
        minAmountA: '900000', // 10% slippage
        minAmountB: '900000', // 10% slippage
      });
      ammDashboard.refetch();
    } catch (error) {
      console.error('Error adding liquidity:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Yield Farming</h1>
        <div className="flex gap-2">
          {!isConnected ? (
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)]"
              style={{
                backgroundColor: colors.primary,
                color: '#04060F',
                border: `1px solid ${colors.primary}60`,
              }}
            >
              Connect Wallet
            </button>
          ) : (
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)]"
              style={{
                backgroundColor: colors.primary,
                color: '#04060F',
                border: `1px solid ${colors.primary}60`,
              }}
              onClick={handleAddLiquidity}
              disabled={isAddingLiquidity}
            >
              {isAddingLiquidity ? 'Adding...' : 'Add Liquidity'}
            </button>
          )}
        </div>
      </div>

      {/* Yield Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TVL */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}
            >
              <Sprout className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Total Value Locked</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>
                {ammDashboard.isLoading ? '...' : `$${(parseFloat(ammDashboard.data?.liquidity?.total || '0') / 100000000).toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>

        {/* Available SY */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.secondary}20`, borderColor: `${colors.secondary}40` }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: colors.secondary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Available SY</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>
                {yieldDashboard.isLoading ? '...' : `${(parseFloat(yieldDashboard.data?.availableSY || '0') / 100000000).toFixed(2)} SY`}
              </p>
            </div>
          </div>
        </div>

        {/* Active Maturities */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `#19F0A820`, borderColor: `#19F0A840` }}
            >
              <Zap className="w-6 h-6" style={{ color: '#19F0A8' }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>Active Maturities</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>
                {yieldDashboard.isLoading ? '...' : yieldDashboard.data?.activeMaturities?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* PT/YT Balance */}
        <div className="glass p-6 rounded-xl border transition-all duration-200 hover:bg-white/10"
             style={{ borderColor: colors.border }}>
          <div className="flex items-center">
            <div
              className="p-3 rounded-xl border"
              style={{ backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}35` }}
            >
              <Clock className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium" style={{ color: colors.muted }}>PT/YT Balance</p>
              <p className="text-2xl font-bold" style={{ color: colors.light }}>
                {yieldDashboard.isLoading ? '...' : 
                  `${(parseFloat(yieldDashboard.data?.ptBalance || '0') / 100000000).toFixed(1)}/${(parseFloat(yieldDashboard.data?.ytBalance || '0') / 100000000).toFixed(1)}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="glass rounded-xl border" style={{ borderColor: colors.border }}>
        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: colors.border }}>
          <button
            className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'split' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'split' ? colors.primary : colors.muted,
              borderBottomColor: activeTab === 'split' ? colors.primary : 'transparent',
            }}
            onClick={() => setActiveTab('split')}
          >
            Split SY Tokens
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'amm' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'amm' ? colors.primary : colors.muted,
              borderBottomColor: activeTab === 'amm' ? colors.primary : 'transparent',
            }}
            onClick={() => setActiveTab('amm')}
          >
            AMM Trading
          </button>
          <button
            className={`px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'positions' ? 'border-b-2' : ''
            }`}
            style={{
              color: activeTab === 'positions' ? colors.primary : colors.muted,
              borderBottomColor: activeTab === 'positions' ? colors.primary : 'transparent',
            }}
            onClick={() => setActiveTab('positions')}
          >
            My Positions
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'split' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.light }}>Split SY Tokens into PT + YT</h3>
              
              {/* Maturity Selection */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  Select Maturity
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {maturities.data?.map((maturity) => (
                    <button
                      key={maturity.timestamp}
                      className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                        selectedMaturity === maturity.timestamp ? 'ring-2' : ''
                      }`}
                      style={{
                        borderColor: selectedMaturity === maturity.timestamp ? colors.primary : colors.border,
                        backgroundColor: selectedMaturity === maturity.timestamp ? `${colors.primary}10` : 'transparent',
                        ringColor: colors.primary,
                      }}
                      onClick={() => setSelectedMaturity(maturity.timestamp)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium" style={{ color: colors.light }}>
                            {maturity.label}
                          </p>
                          <p className="text-sm" style={{ color: colors.muted }}>
                            {maturity.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: colors.primary }}>
                            {maturity.timeToMaturity}
                          </p>
                          <p className="text-xs" style={{ color: colors.muted }}>
                            {maturity.isActive ? 'Active' : 'Expired'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Amount */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.muted }}>
                  SY Amount to Split
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={splitAmount}
                    onChange={(e) => setSplitAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 rounded-lg border bg-transparent"
                    style={{ borderColor: colors.border, color: colors.light }}
                  />
                  <button
                    className="px-4 py-3 rounded-lg border transition-all duration-200 hover:bg-white/10"
                    style={{ borderColor: colors.border, color: colors.muted }}
                    onClick={() => setSplitAmount(yieldDashboard.data?.availableSY || '0')}
                  >
                    Max
                  </button>
                </div>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Available: {(parseFloat(yieldDashboard.data?.availableSY || '0') / 100000000).toFixed(2)} SY
                </p>
              </div>

              {/* Split Button */}
              <button
                className="w-full px-6 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-[rgba(0,230,255,0.35)] disabled:opacity-50"
                style={{
                  backgroundColor: colors.primary,
                  color: '#04060F',
                  border: `1px solid ${colors.primary}60`,
                }}
                onClick={handleSplitTokens}
                disabled={!selectedMaturity || !splitAmount || isSplitting || !isConnected}
              >
                {isSplitting ? 'Splitting...' : 'Split Tokens'}
              </button>
            </div>
          )}

          {activeTab === 'amm' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.light }}>AMM Trading</h3>
              
              {/* AMM Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.muted }}>PT Reserve</p>
                  <p className="text-lg font-semibold" style={{ color: colors.light }}>
                    {(parseFloat(ammDashboard.data?.reserves?.pt || '0') / 100000000).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.muted }}>YT Reserve</p>
                  <p className="text-lg font-semibold" style={{ color: colors.light }}>
                    {(parseFloat(ammDashboard.data?.reserves?.yt || '0') / 100000000).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.muted }}>Exchange Rate</p>
                  <p className="text-lg font-semibold" style={{ color: colors.light }}>
                    1 PT = {ammDashboard.data?.rates?.ptToYt?.toFixed(4) || '0.0000'} YT
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  className="p-4 rounded-lg border transition-all duration-200 hover:bg-white/10"
                  style={{ borderColor: colors.border }}
                  onClick={() => {
                    // This would open a swap modal
                    console.log('Swap PT for YT');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="w-5 h-5" style={{ color: colors.primary }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.light }}>Swap PT → YT</p>
                      <p className="text-sm" style={{ color: colors.muted }}>Trade Principal for Yield</p>
                    </div>
                  </div>
                </button>
                
                <button
                  className="p-4 rounded-lg border transition-all duration-200 hover:bg-white/10"
                  style={{ borderColor: colors.border }}
                  onClick={() => {
                    // This would open a swap modal
                    console.log('Swap YT for PT');
                  }}
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpDown className="w-5 h-5" style={{ color: colors.secondary }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.light }}>Swap YT → PT</p>
                      <p className="text-sm" style={{ color: colors.muted }}>Trade Yield for Principal</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: colors.light }}>My Positions</h3>
              
              {/* Position Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.muted }}>PT Balance</p>
                  <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                    {(parseFloat(yieldDashboard.data?.ptBalance || '0') / 100000000).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                  <p className="text-sm" style={{ color: colors.muted }}>YT Balance</p>
                  <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                    {(parseFloat(yieldDashboard.data?.ytBalance || '0') / 100000000).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Active Maturities */}
              <div>
                <h4 className="text-md font-medium mb-3" style={{ color: colors.light }}>Active Maturities</h4>
                <div className="space-y-2">
                  {maturities.data?.filter(m => m.isActive).map((maturity) => (
                    <div
                      key={maturity.timestamp}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: colors.border }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium" style={{ color: colors.light }}>
                            {maturity.label} Maturity
                          </p>
                          <p className="text-sm" style={{ color: colors.muted }}>
                            {maturity.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium" style={{ color: colors.primary }}>
                            {maturity.timeToMaturity}
                          </p>
                          <p className="text-xs" style={{ color: colors.muted }}>
                            remaining
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YieldFarming;
