import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { subscriptionAPI } from '../services/api';

const Subscription = () => {
  const { t } = useLanguage();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('e-dinar');
  const [useTrial, setUseTrial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await subscriptionAPI.getStatus();
      if (res.data && res.data.status === 'pending') {
        setPending(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await subscriptionAPI.create({ 
        paymentMethod: useTrial ? 'trial' : paymentMethod,
        useTrial 
      });
      
      if (useTrial) {
        navigate('/dashboard');
      } else {
        setPending(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (user?.subscription?.active) {
    return (
      <div className="min-h-screen bg-primary pt-20 flex items-center justify-center">
        <div className="card text-center max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white mb-4">
            You are subscribed!
          </h2>
          <p className="text-gray-400 mb-6">
            Your Premium subscription is active. Enjoy unlimited AI analyses!
          </p>
          <button onClick={() => navigate('/analyze')} className="btn-primary">
            {t('analyze.analyze')}
          </button>
        </div>
      </div>
    );
  }

  if (pending) {
    return (
      <div className="min-h-screen bg-primary pt-20 flex items-center justify-center">
        <div className="card text-center max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white mb-4">
            {t('subscription.pending')}
          </h2>
          <p className="text-gray-400 mb-6">
            Your payment request is being reviewed by our team. You'll receive an email once approved.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-outfit text-4xl font-bold text-white mb-8 text-center">
          {t('subscription.title')}
        </h1>

        <div className="card">
          <div className="text-center mb-8">
            <h2 className="font-outfit text-2xl font-bold text-white mb-4">Premium Plan</h2>
            <div className="mb-4">
              <span className="text-5xl font-bold text-accent">59 DT</span>
              <span className="text-gray-400">/month</span>
            </div>
            <ul className="text-left space-y-2 max-w-xs mx-auto">
              <li className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unlimited AI analyses
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Priority support
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Advanced indicators
              </li>
              <li className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Market alerts
              </li>
            </ul>
          </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {error && (
               <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                 {error}
               </div>
             )}

             <div>
               <label className="block text-gray-400 text-sm mb-3">{t('subscription.paymentOption')}</label>
               <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                 useTrial ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
               }`}>
                 <input
                   type="radio"
                   name="paymentOption"
                   value="trial"
                   checked={useTrial}
                   onChange={(e) => setUseTrial(true)}
                   className="hidden"
                 />
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                   useTrial ? 'border-accent' : 'border-gray-500'
                 }`}>
                   {useTrial && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                 </div>
                 <div className="flex-1">
                   <span className="text-white font-medium">Start 7-Day Free Trial</span>
                   <p className="text-gray-500 text-xs">Try for 7 days, then decide to upgrade</p>
                 </div>
               </label>
               
               <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all mt-3 ${
                 !useTrial ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
               }`}>
                 <input
                   type="radio"
                   name="paymentOption"
                   value="now"
                   checked={!useTrial}
                   onChange={(e) => setUseTrial(false)}
                   className="hidden"
                 />
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                   !useTrial ? 'border-accent' : 'border-gray-500'
                 }`}>
                   {(!useTrial) && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                 </div>
                 <div className="flex-1">
                   <span className="text-white font-medium">Pay Now (59 DT)</span>
                   <p className="text-gray-500 text-xs">Get immediate access to all premium features</p>
                 </div>
               </label>
             </div>

             {!useTrial && (
               <div>
                 <label className="block text-gray-400 text-sm mb-3">{t('subscription.method')}</label>

              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'e-dinar' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="e-dinar"
                    checked={paymentMethod === 'e-dinar'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'e-dinar' ? 'border-accent' : 'border-gray-500'
                  }`}>
                    {paymentMethod === 'e-dinar' && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                  </div>
                  <span className="text-white">{t('subscription.edinar')}</span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                  paymentMethod === 'bank-transfer' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/50'
                }`}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank-transfer"
                    checked={paymentMethod === 'bank-transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === 'bank-transfer' ? 'border-accent' : 'border-gray-500'
                  }`}>
                    {paymentMethod === 'bank-transfer' && <div className="w-3 h-3 rounded-full bg-accent"></div>}
                  </div>
                  <span className="text-white">{t('subscription.bank')}</span>
                </label>
              </div>
            </div>
            )}

            {paymentMethod === 'e-dinar' && (
              <div className="p-4 bg-secondary border border-border rounded-lg text-left animate-fade-in-up">
                <p className="text-gray-400 text-sm mb-2">Please transfer <strong className="text-accent">59 DT</strong> to the following E-Dinar account:</p>
                <p className="font-mono text-white text-lg bg-black/50 p-3 rounded text-center tracking-wider border border-gray-800">
                  0000 1111 2222 3333
                </p>
                <p className="text-gray-500 text-xs mt-3 text-center">After transferring, click Submit. Our team will verify your payment and activate your subscription.</p>
              </div>
            )}

            {paymentMethod === 'bank-transfer' && (
              <div className="p-4 bg-secondary border border-border rounded-lg text-left animate-fade-in-up">
                <p className="text-gray-400 text-sm mb-2">Please transfer <strong className="text-accent">59 DT</strong> to the following Bank Account (RIB):</p>
                <p className="font-mono text-white text-lg bg-black/50 p-3 rounded text-center tracking-wider border border-gray-800 break-all">
                  12 345 6789012345678 90
                </p>
                <p className="text-gray-500 text-xs mt-3 text-center">After transferring, click Submit. Our team will verify your payment and activate your subscription.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t('common.loading') : t('subscription.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
