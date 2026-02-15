import { useState } from 'react';
import { WagmiProvider, useAccount, useDisconnect } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { UnicornAutoConnect } from '@unicorn.eth/autoconnect';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import '@rainbow-me/rainbowkit/styles.css';
import './i18n';

import { config } from './config/wagmi';
import WalletGate from './components/WalletGate';
import SubmissionForm from './components/SubmissionForm';
import ConfirmationScreen from './components/ConfirmationScreen';
import LanguageSelector from './components/LanguageSelector';

const queryClient = new QueryClient();

const hasAutoconnectParams = () => {
  const params = new URLSearchParams(window.location.search);
  return params.has('walletId') || params.has('autoconnect');
};

const RTL_LANGS = ['ar', 'he'];

function GovernedMintApp() {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { t, i18n } = useTranslation();
  const [submittedEntry, setSubmittedEntry] = useState(null);

  const isUnicorn = connector?.id === 'unicorn';
  const isRtl = RTL_LANGS.includes(i18n.language?.split('-')[0]);

  if (!isConnected) {
    return (
      <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-page flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-5 sm:p-8 w-full max-w-md">
          <div className="flex justify-end mb-3">
            <LanguageSelector />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-2">{t('app.title')}</h1>
          <p className="text-center text-gray-500 text-sm mb-6">{t('app.subtitle')}</p>
          <WalletGate />
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-page p-2 sm:p-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 bg-white/30 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <span className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            {isUnicorn && <span title="Unicorn Wallet">🦄</span>}
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button onClick={() => disconnect()} className="text-gray-400 hover:text-gray-600 transition">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-4 sm:p-6">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{t('app.submitTitle')}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">{t('app.submitSubtitle')}</p>

          {submittedEntry ? (
            <ConfirmationScreen submission={submittedEntry} onReset={() => setSubmittedEntry(null)} />
          ) : (
            <SubmissionForm walletAddress={address} onSuccess={setSubmittedEntry} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {hasAutoconnectParams() && (
            <UnicornAutoConnect
              debug={import.meta.env.DEV}
              onConnect={(wallet) => console.log('Unicorn connected:', wallet)}
              onError={(error) => {
                window.dispatchEvent(new CustomEvent('unicorn-connect-error', { detail: error }));
              }}
            />
          )}
          <GovernedMintApp />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
