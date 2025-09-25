import React, { useEffect, useState } from 'react';

const WalletDebug: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<any>({});

  useEffect(() => {
    const checkWallet = () => {
      const info = {
        petra: !!(window as any).petra,
        petraVersion: (window as any).petra?.version || 'Not available',
        userAgent: navigator.userAgent,
        isSecureContext: window.isSecureContext,
        location: window.location.href,
      };
      setWalletInfo(info);
    };

    checkWallet();
    
    // Check again after a delay in case wallet loads later
    const timer = setTimeout(checkWallet, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">Wallet Debug Info</h3>
      <div className="space-y-1">
        <div>Petra Available: {walletInfo.petra ? '✅' : '❌'}</div>
        <div>Petra Version: {walletInfo.petraVersion}</div>
        <div>Secure Context: {walletInfo.isSecureContext ? '✅' : '❌'}</div>
        <div>HTTPS: {walletInfo.location?.startsWith('https') ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default WalletDebug;