import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'ar', label: 'العربية' },
  { code: 'he', label: 'עברית' },
];

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language?.split('-')[0] || 'en'}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className="bg-white/60 border border-gray-200 rounded-lg px-2 py-1 text-xs sm:text-sm text-gray-600 cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>{lang.label}</option>
      ))}
    </select>
  );
}
