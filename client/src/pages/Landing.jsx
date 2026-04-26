import { Link } from 'react-router-dom';
import { TickerTape, MarketOverview } from 'react-ts-tradingview-widgets';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-primary">
      <div className="w-full pt-16">
        <TickerTape colorTheme="dark" displayMode="regular" />
      </div>

      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl animate-blob mix-blend-screen"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-screen"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                <span className="text-accent text-sm font-medium">AI-Powered Trading Analysis</span>
              </div>

              <h1 className="font-outfit text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                {t('landing.hero')}
              </h1>

              <p className="text-gray-400 text-lg sm:text-xl mb-10 animate-fade-in-up animate-delay-100">
                {t('landing.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animate-delay-200">
                {user ? (
                  <Link to="/analyze" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto text-center">
                    {t('landing.upload')}
                  </Link>
                ) : (
                  <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto text-center">
                    Start 7-Day Free Trial
                  </Link>
                )}
                <Link to="/markets" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto text-center">
                  {t('nav.markets')}
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block animate-fade-in-up animate-delay-200">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent/20 to-transparent rounded-2xl blur-2xl"></div>
                <img 
                  src="/new_trading_hero.png" 
                  alt="AI Trading Analysis" 
                  className="relative w-full rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.15)] border border-gray-800/50 object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-white mb-4">
                How It Works
              </h2>
              <p className="text-gray-400 text-lg">Three simple steps to automated trading analysis</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -z-10 transform -translate-y-1/2"></div>
              
              <div className="card text-center bg-secondary/80 backdrop-blur-xl border-accent/20 hover:border-accent transition-colors">
                <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-accent text-black font-bold text-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(var(--accent),0.5)]">
                  1
                </div>
                <h3 className="font-outfit text-xl font-bold text-white mb-3">Upload Chart</h3>
                <p className="text-gray-400 text-sm">Take a screenshot of any trading chart and upload it to our secure platform.</p>
              </div>

              <div className="card text-center bg-secondary/80 backdrop-blur-xl border-accent/20 hover:border-accent transition-colors">
                <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-accent text-black font-bold text-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(var(--accent),0.5)]">
                  2
                </div>
                <h3 className="font-outfit text-xl font-bold text-white mb-3">AI Analysis</h3>
                <p className="text-gray-400 text-sm">Our advanced neural network instantly identifies patterns, trends, and key levels.</p>
              </div>

              <div className="card text-center bg-secondary/80 backdrop-blur-xl border-accent/20 hover:border-accent transition-colors">
                <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-accent text-black font-bold text-xl flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(var(--accent),0.5)]">
                  3
                </div>
                <h3 className="font-outfit text-xl font-bold text-white mb-3">Execute Trade</h3>
                <p className="text-gray-400 text-sm">Receive precise entry, stop-loss, and take-profit targets to execute your trade confidently.</p>
              </div>
            </div>
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                {t('landing.features.smart.title')}
              </h3>
              <p className="text-gray-400">
                {t('landing.features.smart.desc')}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                {t('landing.features.fast.title')}
              </h3>
              <p className="text-gray-400">
                {t('landing.features.fast.desc')}
              </p>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-accent/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                {t('landing.features.secure.title')}
              </h3>
              <p className="text-gray-400">
                {t('landing.features.secure.desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-y border-border relative overflow-hidden bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-white mb-4">
              Live Market Overview
            </h2>
            <p className="text-gray-400 text-lg">Stay updated with real-time market movements</p>
          </div>
          
          <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-800 bg-secondary">
            <MarketOverview colorTheme="dark" width="100%" height="100%" showFloatingTooltip={true} />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-outfit text-3xl sm:text-4xl font-bold text-white mb-4">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-gray-400 text-lg">
              {t('landing.pricing.monthly')}
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="card text-center">
              <h3 className="font-outfit text-2xl font-bold text-white mb-4">Premium</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-accent">59 DT</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                {t('landing.pricing.features', { returnObjects: true }).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {user ? (
                <Link to="/subscription" className="btn-primary w-full">
                  {t('subscription.upgrade')}
                </Link>
              ) : (
                <Link to="/register" className="btn-primary w-full">
                  {t('landing.cta')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
