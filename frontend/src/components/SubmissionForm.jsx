import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, AtSign } from 'lucide-react';
import PhotoCapture from './PhotoCapture';
import { submitEntry } from '../lib/api';

export default function SubmissionForm({ walletAddress, onSuccess }) {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [xHandle, setXHandle] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [blueskyHandle, setBlueskyHandle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;
    if (!clientId) return;
    (async () => {
      try {
        const { createThirdwebClient } = await import('thirdweb');
        const { getUserEmail } = await import('thirdweb/wallets');
        const client = createThirdwebClient({ clientId });
        const walletEmail = await getUserEmail({ client });
        if (walletEmail) setEmail(walletEmail);
      } catch {}
    })();
  }, []);

  const canSubmit = photo && comment.trim() && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError('');

    try {
      const result = await submitEntry({
        photo,
        comment: comment.trim(),
        xHandle: xHandle.trim().replace(/^@/, '') || undefined,
        instagramHandle: instagramHandle.trim().replace(/^@/, '') || undefined,
        blueskyHandle: blueskyHandle.trim().replace(/^@/, '') || undefined,
        email: email.trim() || undefined,
        walletAddress,
      });
      onSuccess(result.submission);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PhotoCapture photo={photo} setPhoto={setPhoto} photoPreview={photoPreview} setPhotoPreview={setPhotoPreview} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.comment')} *</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('form.commentPlaceholder')}
          rows={3}
          maxLength={500}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.email')}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('form.emailPlaceholder')}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <AtSign size={14} /> {t('form.socialHandles')} <span className="text-gray-400 font-normal">{t('form.optional')}</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={xHandle}
            onChange={(e) => setXHandle(e.target.value)}
            placeholder={t('form.xPlaceholder')}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            value={instagramHandle}
            onChange={(e) => setInstagramHandle(e.target.value)}
            placeholder={t('form.instagramPlaceholder')}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <input
            value={blueskyHandle}
            onChange={(e) => setBlueskyHandle(e.target.value)}
            placeholder={t('form.blueskyPlaceholder')}
            className="border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full bg-gradient-brand text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <span className="animate-pulse">{t('form.submitting')}</span>
        ) : (
          <>
            <Send size={20} /> {t('form.submit')}
          </>
        )}
      </button>
    </form>
  );
}
