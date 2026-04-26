import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { analysisAPI } from '../services/api';

const Dashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await analysisAPI.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;
    try {
      await analysisAPI.deleteAnalysis(id);
      setHistory(history.filter(item => item._id !== id));
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  const trialDaysLeft = () => {
    if (!user?.trialExpiresAt) return 0;
    const diff = new Date(user.trialExpiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isTrialActive = () => {
    if (!user?.trialActive || !user?.trialExpiresAt) return false;
    return new Date(user.trialExpiresAt) > new Date();
  };

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-outfit text-4xl font-bold text-white mb-8">
          {t('dashboard.title')}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <p className="text-gray-400 text-sm mb-2">{t('dashboard.welcome')}</p>
            <p className="font-outfit text-2xl font-bold text-white">{user?.name}</p>
            <p className="text-gray-400">{user?.email}</p>
          </div>

          <div className="card">
            <p className="text-gray-400 text-sm mb-2">{t('dashboard.trial')}</p>
            <p className={`font-outfit text-2xl font-bold ${
              isTrialActive() ? 'text-accent' : 'text-red-400'
            }`}>
              {isTrialActive() ? t('dashboard.active') : t('dashboard.expired')}
            </p>
            {isTrialActive() && (
              <p className="text-gray-400">{t('dashboard.expires')}: {trialDaysLeft()} days</p>
            )}
          </div>

          <div className="card">
            <p className="text-gray-400 text-sm mb-2">{t('dashboard.subscription')}</p>
            <p className={`font-outfit text-2xl font-bold ${
              user?.subscription?.active ? 'text-accent' : 'text-gray-400'
            }`}>
              {user?.subscription?.active ? 'Premium' : 'Free'}
            </p>
            {!user?.subscription?.active && (
              <Link to="/subscription" className="text-accent text-sm hover:underline">
                {t('subscription.upgrade')}
              </Link>
            )}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="font-outfit text-2xl font-bold text-white mb-6">
            Live Market
          </h2>
          <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-2xl border border-gray-800">
            <AdvancedRealTimeChart theme="dark" width="100%" height="100%" symbol="BINANCE:BTCUSDT" />
          </div>
        </div>

        <div className="mb-8">
          <Link to="/analyze" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('landing.upload')}
          </Link>
        </div>

        <div>
          <h2 className="font-outfit text-2xl font-bold text-white mb-6">
            {t('dashboard.history')}
          </h2>

          {history.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-400">{t('analyze.noHistory')}</p>
              <Link to="/analyze" className="btn-primary mt-4 inline-block">
                {t('analyze.analyze')}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item._id} className="card relative group">
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="absolute top-4 right-4 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <img
                    src={item.imageUrl}
                    alt="Chart"
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <span className={`font-bold ${
                      item.result.signal === 'Buy' ? 'signal-buy' :
                      item.result.signal === 'Sell' ? 'signal-sell' : 'signal-hold'
                    }`}>
                      {item.result.signal}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Confidence: {item.result.confidence}%
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
