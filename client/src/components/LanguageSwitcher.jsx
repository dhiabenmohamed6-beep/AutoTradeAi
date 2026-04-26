import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-accent cursor-pointer"
    >
      <option value="en">EN</option>
      <option value="fr">FR</option>
      <option value="ar">AR</option>
    </select>
  );
};

export default LanguageSwitcher;
