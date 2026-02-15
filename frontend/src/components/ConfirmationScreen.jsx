import { useTranslation } from 'react-i18next';
import { CheckCircle } from 'lucide-react';

export default function ConfirmationScreen({ submission, onReset }) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-4 sm:py-8 space-y-4 sm:space-y-6 animate-bounce-in">
      <CheckCircle size={48} className="sm:hidden mx-auto text-green-500" />
      <CheckCircle size={64} className="hidden sm:block mx-auto text-green-500" />
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{t('confirmation.title')}</h2>
        <p className="text-gray-500">{t('confirmation.description')}</p>
      </div>
      {submission?.id && (
        <p className="text-xs text-gray-400">{t('confirmation.reference')}: {submission.id}</p>
      )}
      <button
        onClick={onReset}
        className="bg-gradient-brand text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold hover:shadow-lg transition"
      >
        {t('confirmation.submitAnother')}
      </button>
    </div>
  );
}
