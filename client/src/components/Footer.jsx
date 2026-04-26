import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-secondary border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-black font-bold text-lg">A</span>
              </div>
              <span className="font-outfit font-bold text-xl text-white">AutoTradeAi</span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm">
              {t('landing.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="font-outfit font-semibold text-white mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/markets" className="text-gray-400 hover:text-accent transition-colors text-sm">
                {t('nav.markets')}
              </Link>
              <Link to="/analyze" className="text-gray-400 hover:text-accent transition-colors text-sm">
                {t('nav.analyze')}
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-accent transition-colors text-sm">
                {t('contact.title')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-outfit font-semibold text-white mb-4">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link to="#" className="text-gray-400 hover:text-accent transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-accent transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-accent transition-colors text-sm">
                Disclaimer
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-outfit font-semibold text-white mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">
              Email: support@autotradeai.com
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {t('landing.disclaimer')}
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 AutoTradeAi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
