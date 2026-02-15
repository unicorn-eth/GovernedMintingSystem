import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

export default function WalletGate() {
  const { t } = useTranslation();
  const [autoconnectTimeout, setAutoconnectTimeout] = useState(false);

  const isAutoconnecting = () => {
    const params = new URLSearchParams(window.location.search);
    return params.has('walletId') || params.has('autoconnect');
  };

  useEffect(() => {
    if (isAutoconnecting()) {
      const timer = setTimeout(() => setAutoconnectTimeout(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isAutoconnecting() && !autoconnectTimeout) {
    return (
      <div className="text-center py-6 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600">{t('wallet.connecting')}</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6 sm:py-12 space-y-4 sm:space-y-6">
      <Wallet size={40} className="mx-auto text-indigo-400" />
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t('wallet.connect')}</h2>
        <p className="text-gray-500 text-sm">{t('wallet.connectDesc')}</p>
      </div>
      {autoconnectTimeout && (
        <p className="text-sm text-amber-600">{t('wallet.timeout')}</p>
      )}
      <div className="flex justify-center">
        <ConnectButton />
      </div>
    </div>
  );
}
