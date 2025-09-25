import React, { useState } from 'react';
import { 
  Shield, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Lock, 
  Unlock, 
  Calculator,
  History,
  Settings,
  Info,
  Percent
} from 'lucide-react';
import { ContractInitializer } from '@/components/dashboard/ContractInitializer';
import { usePetraWallet } from '@/contexts/PetraWalletContext';
import { 
  useAptosLendingDashboard,
  useAptosDepositCollateral,
  useAptosCreateLoan,
  useAptosRepayLoan
} from '@/hooks/contracts/useAptosLending';

// Design System Colors
const colors = {
  primary: '#00E6FF',   // Neon Cyan
  secondary: '#2D5BFF', // Royal Blue
  success: '#10B981',   // Green
  warning: '#F59E0B',   // Yellow
  danger: '#EF4444',    // Red
  dark: '#04060F',      // Rich Black
  light: '#E6EDF7',     // Soft White-Blue
  muted: '#9BB0CE',     // Muted Blue-Gray
  border: '#1E2742',    // Subtle Navy Border
};

const Lending: React.FC = () => {
  const { isConnected } = usePetraWallet();
  const [activeTab, setActiveTab] = useState<'lend' | 'borrow' | 'positions'>('lend');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [selectedLTV, setSelectedLTV] = useState(30);
  const [contractsInitialized, setContractsInitialized] = useState(false);

  // Real contract data
  const lendingDashboard = useAptosLendingDashboard();
  // const collateralInfo = useAptosCollateralInfo();
  // const tokenBalances = useAptosLendingTokenBalances();
  
  // Contract interactions
  const depositCollateral = useAptosDepositCollateral();
  // const withdrawCollateral = useAptosWithdrawCollateral();
  const createLoan = useAptosCreateLoan();
  const repayLoan = useAptosRepayLoan();

  // Use real data or fallback to defaults
  const lendingData = lendingDashboard.data || {
    totalCollateral: '0.00',
    totalBorrowed: '0.00',
    availableToBorrow: '0.00',
    healthFactor: '∞',
    interestRates: {
      30: 5,   // 5% for 30% LTV
      45: 8,   // 8% for 45% LTV
      60: 10,  // 10% for 60% LTV
    },
    activeLoans: [],
    userCollateral: '0.00',
  };

  const ltvOptions = [
    { value: 30, label: '30%', rate: 5, risk: 'Low', color: colors.success },
    { value: 45, label: '45%', rate: 8, risk: 'Medium', color: colors.warning },
    { value: 60, label: '60%', rate: 10, risk: 'High', color: colors.danger },
  ];

  const formatCurrency = (amount: string | number) => {
    const numAmount = parseFloat(amount?.toString() || '0');
    if (isNaN(numAmount) || numAmount === 0) return '$0.00';
    
    // Handle very large numbers
    if (numAmount >= 1e9) {
      return `$${(numAmount / 1e9).toFixed(1)}B`;
    } else if (numAmount >= 1e6) {
      return `$${(numAmount / 1e6).toFixed(1)}M`;
    } else if (numAmount >= 1e3) {
      return `$${(numAmount / 1e3).toFixed(1)}K`;
    }
    
    return `$${numAmount.toFixed(2)}`;
  };

  const calculateMaxLoan = (collateral: number, ltv: number) => {
    return (collateral * ltv) / 100;
  };

  const getHealthFactorColor = (healthFactor: string) => {
    if (healthFactor === '∞') return colors.success;
    const hf = parseFloat(healthFactor);
    if (isNaN(hf)) return colors.success; // Default to success for invalid values
    if (hf > 2) return colors.success;
    if (hf > 1.5) return colors.warning;
    return colors.danger;
  };

  // Handler functions for contract interactions
  const handleDepositCollateral = async () => {
    if (!collateralAmount || !isConnected) return;
    
    try {
      const amountInOctas = (parseFloat(collateralAmount) * 100000000).toString(); // Convert to octas
      await depositCollateral.mutateAsync({ amount: amountInOctas });
      setCollateralAmount('');
      console.log('Collateral deposited successfully');
    } catch (error) {
      console.error('Failed to deposit collateral:', error);
    }
  };

  // const handleWithdrawCollateral = async () => {
  //   if (!collateralAmount || !isConnected) return;
  //   
  //   try {
  //     const amountInOctas = (parseFloat(collateralAmount) * 100000000).toString();
  //     await withdrawCollateral.mutateAsync({ amount: amountInOctas });
  //     setCollateralAmount('');
  //     console.log('Collateral withdrawn successfully');
  //   } catch (error) {
  //     console.error('Failed to withdraw collateral:', error);
  //   }
  // };

  const handleCreateLoan = async () => {
    if (!loanAmount || !isConnected) return;
    
    try {
      const amountInOctas = (parseFloat(loanAmount) * 100000000).toString();
      await createLoan.mutateAsync({ amount: amountInOctas, ltv: selectedLTV });
      setLoanAmount('');
      console.log('Loan created successfully');
    } catch (error) {
      console.error('Failed to create loan:', error);
    }
  };

  const handleRepayLoan = async (loanId: string, amount: string) => {
    if (!isConnected) return;
    
    try {
      const amountInOctas = (parseFloat(amount) * 100000000).toString();
      await repayLoan.mutateAsync({ loanId, amount: amountInOctas });
      console.log('Loan repaid successfully');
    } catch (error) {
      console.error('Failed to repay loan:', error);
    }
  };

  // Format token amounts for display
  const formatTokenAmount = (amount: string, decimals: number = 8) => {
    const numAmount = parseFloat(amount || '0');
    if (isNaN(numAmount) || numAmount === 0) return '0.0000';
    return (numAmount / Math.pow(10, decimals)).toFixed(4);
  };

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Lending & Borrowing</h1>
        </div>
        
        <div className="glass rounded-xl p-12 border border-white/10 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: colors.primary }} />
          <h3 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-white/60 mb-6">
            Connect your Petra wallet to access lending and borrowing features
          </p>
          <button className="px-6 py-3 rounded-lg font-medium transition-all duration-200"
                  style={{ backgroundColor: colors.primary, color: colors.dark }}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  // Check if contracts are initialized (simple check - if lending dashboard has errors, contracts likely need init)
  const needsInitialization = lendingDashboard.error?.message?.includes('RESOURCE_DOES_NOT_EXIST') || 
                              lendingDashboard.error?.message?.includes('not found') ||
                              (!contractsInitialized && !lendingDashboard.data);

  if (needsInitialization) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Lending & Borrowing</h1>
        </div>
        
        <ContractInitializer onInitialized={() => setContractsInitialized(true)} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="p-3 rounded-2xl border"
            style={{
              backgroundColor: `${colors.primary}20`,
              borderColor: `${colors.primary}50`
            }}
          >
            <Shield className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.light }}>Lending & Borrowing</h1>
            <p className="text-sm text-white/70">
              Manage your collateral and loans on Aptos
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Collateral */}
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${colors.success}20`, borderColor: `${colors.success}40` }}>
              <Shield className="w-6 h-6" style={{ color: colors.success }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Total Collateral</p>
              <p className="text-2xl font-bold text-white">
                {lendingDashboard.isLoading ? '...' : `${formatTokenAmount(lendingData.totalCollateral, 8)} APT`}
              </p>
            </div>
          </div>
        </div>

        {/* Total Borrowed */}
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${colors.danger}20`, borderColor: `${colors.danger}40` }}>
              <CreditCard className="w-6 h-6" style={{ color: colors.danger }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Total Borrowed</p>
              <p className="text-2xl font-bold text-white">
                {lendingDashboard.isLoading ? '...' : `${formatTokenAmount(lendingData.totalBorrowed)} lnBTC`}
              </p>
            </div>
          </div>
        </div>

        {/* Available to Borrow */}
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }}>
              <TrendingUp className="w-6 h-6" style={{ color: colors.primary }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Available to Borrow</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(lendingData.availableToBorrow)}</p>
            </div>
          </div>
        </div>

        {/* Health Factor */}
        <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
          <div className="flex items-center">
            <div className="p-3 rounded-xl border" style={{ backgroundColor: `${getHealthFactorColor(lendingData.healthFactor)}20`, borderColor: `${getHealthFactorColor(lendingData.healthFactor)}40` }}>
              <AlertTriangle className="w-6 h-6" style={{ color: getHealthFactorColor(lendingData.healthFactor) }} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white/70">Health Factor</p>
              <p className="text-2xl font-bold text-white">{lendingData.healthFactor}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="glass p-1 rounded-xl border border-white/10">
            <div className="flex space-x-1">
              {[
                { id: 'lend', label: 'Lend', icon: Lock },
                { id: 'borrow', label: 'Borrow', icon: Unlock },
                { id: 'positions', label: 'My Positions', icon: History },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? colors.primary : 'transparent',
                    color: activeTab === tab.id ? colors.dark : undefined
                  }}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lend Tab */}
          {activeTab === 'lend' && (
            <div className="glass p-6 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.success}20`, borderColor: `${colors.success}50` }}>
                  <Lock className="w-5 h-5" style={{ color: colors.success }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Deposit Collateral</h3>
                  <p className="text-sm text-white/60">Add BTC collateral to earn ctrlBTC tokens</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Amount to Deposit</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                      BTC
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {[25, 50, 75, 100].map((percentage) => (
                    <button
                      key={percentage}
                      onClick={() => setCollateralAmount((parseFloat(lendingData.totalCollateral) / 100000000 * percentage / 100).toString())}
                      className="flex-1 py-2 px-3 text-sm font-medium rounded-lg border border-white/20 text-white/70 hover:text-white hover:border-cyan-400/50 transition-colors"
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>

                <div className="p-4 rounded-lg border" style={{ backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4" style={{ color: colors.success }} />
                    <span className="text-sm font-medium" style={{ color: colors.success }}>You'll receive</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {collateralAmount && !isNaN(parseFloat(collateralAmount)) 
                      ? `${parseFloat(collateralAmount).toFixed(4)} ctrlBTC tokens`
                      : '0.0000 ctrlBTC tokens'
                    }
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    1 BTC = 1 ctrlBTC (1:1 ratio)
                  </div>
                </div>

                <button
                  disabled={!collateralAmount || parseFloat(collateralAmount) <= 0 || depositCollateral.isPending}
                  onClick={handleDepositCollateral}
                  className="w-full py-3 font-medium rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: collateralAmount && parseFloat(collateralAmount) > 0 ? colors.success : '#4B5563',
                    color: collateralAmount && parseFloat(collateralAmount) > 0 ? 'white' : '#9CA3AF'
                  }}
                >
                  <Lock className="w-5 h-5" />
                  <span>{depositCollateral.isPending ? 'Depositing...' : 'Deposit Collateral'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Borrow Tab */}
          {activeTab === 'borrow' && (
            <div className="glass p-6 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.danger}20`, borderColor: `${colors.danger}50` }}>
                  <Unlock className="w-5 h-5" style={{ color: colors.danger }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Create Loan</h3>
                  <p className="text-sm text-white/60">Borrow against your collateral</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Loan Amount</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 glass border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-white/50"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 text-sm">
                      lnBTC
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">LTV Ratio</label>
                  <div className="space-y-3">
                    {ltvOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedLTV(option.value)}
                        className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                          selectedLTV === option.value
                            ? 'border-cyan-400/50 bg-cyan-400/10'
                            : 'border-white/20 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full border-2"
                              style={{
                                backgroundColor: selectedLTV === option.value ? option.color : 'transparent',
                                borderColor: option.color
                              }}
                            />
                            <div>
                              <div className="font-medium text-white">{option.label} LTV</div>
                              <div className="text-sm text-white/60">{option.risk} Risk</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-white">{option.rate}% APR</div>
                            <div className="text-sm text-white/60">Interest Rate</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg border" style={{ backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }}>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: colors.warning }} />
                    <span className="text-sm font-medium" style={{ color: colors.warning }}>Loan Details</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Max Loan Amount:</span>
                      <span className="text-white">{formatCurrency(calculateMaxLoan(parseFloat(lendingData.totalCollateral) / 100000000, selectedLTV))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Interest Rate:</span>
                      <span className="text-white">{lendingData.interestRates[selectedLTV as keyof typeof lendingData.interestRates]}% APR</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Required Collateral:</span>
                      <span className="text-white">{formatCurrency(parseFloat(loanAmount || '0') * 100 / selectedLTV)}</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={!loanAmount || parseFloat(loanAmount) <= 0 || parseFloat(loanAmount) > calculateMaxLoan(parseFloat(lendingData.totalCollateral), selectedLTV) || createLoan.isPending}
                  onClick={handleCreateLoan}
                  className="w-full py-3 font-medium rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: loanAmount && parseFloat(loanAmount) > 0 && parseFloat(loanAmount) <= calculateMaxLoan(parseFloat(lendingData.totalCollateral), selectedLTV) ? colors.danger : '#4B5563',
                    color: loanAmount && parseFloat(loanAmount) > 0 && parseFloat(loanAmount) <= calculateMaxLoan(parseFloat(lendingData.totalCollateral), selectedLTV) ? 'white' : '#9CA3AF'
                  }}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{createLoan.isPending ? 'Creating...' : 'Create Loan'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Positions Tab */}
          {activeTab === 'positions' && (
            <div className="glass p-6 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}50` }}>
                  <History className="w-5 h-5" style={{ color: colors.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">My Positions</h3>
                  <p className="text-sm text-white/60">Manage your active loans and collateral</p>
                </div>
              </div>

              {(lendingData.activeLoans || []).length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-white/30" />
                  <p className="text-white/60 mb-2">No active loans</p>
                  <p className="text-sm text-white/40">Create your first loan to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(lendingData.activeLoans || []).map((loan: any) => (
                    <div key={loan.id} className="border border-white/10 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-white">Loan #{loan.id}</h4>
                          <p className="text-sm text-white/60">
                            {formatTokenAmount(loan.collateralAmount)} APT → {formatTokenAmount(loan.borrowedAmount)} lnBTC
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium" style={{ color: getHealthFactorColor(loan.healthFactor.toString()) }}>
                            Health: {loan.healthFactor.toFixed(2)}
                          </div>
                          <div className="text-xs text-white/60">{loan.ltv}% LTV</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-white/60">Collateral</p>
                          <p className="font-medium text-white">{formatTokenAmount(loan.collateralAmount)} APT</p>
                        </div>
                        <div>
                          <p className="text-xs text-white/60">Borrowed</p>
                          <p className="font-medium text-white">{formatTokenAmount(loan.borrowedAmount)} lnBTC</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRepayLoan(loan.id, loan.borrowedAmount)}
                          disabled={repayLoan.isPending}
                          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: colors.success,
                            color: 'white'
                          }}
                        >
                          {repayLoan.isPending ? 'Repaying...' : 'Repay Loan'}
                        </button>
                        <button
                          className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            backgroundColor: colors.warning,
                            color: 'white'
                          }}
                        >
                          Add Collateral
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Market Info */}
        <div className="space-y-6">
          {/* Interest Rates */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}50` }}>
                <Percent className="w-5 h-5" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-lg font-semibold text-white">Interest Rates</h3>
            </div>
            
            <div className="space-y-3">
              {ltvOptions.map((option) => (
                <div key={option.value} className="flex items-center justify-between p-3 rounded-lg border border-white/10">
                  <div>
                    <div className="font-medium text-white">{option.label} LTV</div>
                    <div className="text-sm text-white/60">{option.risk} Risk</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">{option.rate}%</div>
                    <div className="text-xs text-white/60">APR</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Stats */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg border" style={{ backgroundColor: `${colors.secondary}20`, borderColor: `${colors.secondary}50` }}>
                <TrendingUp className="w-5 h-5" style={{ color: colors.secondary }} />
              </div>
              <h3 className="text-lg font-semibold text-white">Market Stats</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-white/60">Total TVL</span>
                <span className="text-white font-medium">$2.4M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Borrowed</span>
                <span className="text-white font-medium">$1.2M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Utilization</span>
                <span className="text-white font-medium">50%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Active Loans</span>
                <span className="text-white font-medium">127</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 rounded-lg border border-white/20 text-left hover:border-cyan-400/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Calculator className="w-5 h-5 text-white/60" />
                  <div>
                    <div className="font-medium text-white">Loan Calculator</div>
                    <div className="text-sm text-white/60">Calculate loan terms</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full p-3 rounded-lg border border-white/20 text-left hover:border-cyan-400/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-white/60" />
                  <div>
                    <div className="font-medium text-white">Manage Settings</div>
                    <div className="text-sm text-white/60">Configure preferences</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lending;