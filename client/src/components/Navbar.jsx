import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-black font-bold text-lg">A</span>
            </div>
            <span className="font-outfit font-bold text-xl text-white">AutoTradeAi</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/markets" className="text-gray-300 hover:text-accent transition-colors">
              {t('nav.markets')}
            </Link>
            <Link to="/analyze" className="text-gray-300 hover:text-accent transition-colors">
              {t('nav.analyze')}
            </Link>
            {user && (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-accent transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link to="/support" className="text-gray-300 hover:text-accent transition-colors">
                  Support
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-accent transition-colors">
                {t('admin.title')}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-300 text-sm hidden sm:block">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-accent transition-colors text-sm"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-accent transition-colors text-sm"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm py-2 px-4"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
