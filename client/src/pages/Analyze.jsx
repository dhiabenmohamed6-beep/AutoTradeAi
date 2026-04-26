import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { analysisAPI, subscriptionAPI } from '../services/api';

const Analyze = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [trialExpired, setTrialExpired] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [showSimulator, setShowSimulator] = useState(false);
  const [investment, setInvestment] = useState(1000);
  const [leverage, setLeverage] = useState(1);
  const [selectedTarget, setSelectedTarget] = useState(0);

  useEffect(() => {
    if (user) {
      checkAccess();
      fetchHistory();
    }
  }, [user]);

  const checkAccess = async () => {
    try {
      const res = await subscriptionAPI.checkAccess();
      if (!res.data.hasAccess) {
        setTrialExpired(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleFile = (file) => {
    if (!file) return;
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Only PNG, JPG, JPEG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const res = await analysisAPI.analyze(formData);

      if (res.data.trialExpired) {
        setTrialExpired(true);
        setLoading(false);
        return;
      }

      setResult(res.data.result);
      setPreview(null);
      setImage(null);
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'bg-accent';
    if (confidence >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateSimulation = () => {
    if (!result || !result.entryPrice) return { profit: 0, loss: 0, profitPercent: 0, lossPercent: 0 };
    
    const entry = result.entryPrice;
    const target = result.takeProfit && result.takeProfit.length > 0 ? result.takeProfit[selectedTarget] : entry;
    const stop = result.stopLoss || entry;

    const isLong = target > entry;
    
    let profitPercent, lossPercent;
    
    if (isLong) {
      profitPercent = ((target - entry) / entry) * 100 * leverage;
      lossPercent = ((entry - stop) / entry) * 100 * leverage;
    } else {
      profitPercent = ((entry - target) / entry) * 100 * leverage;
      lossPercent = ((stop - entry) / entry) * 100 * leverage;
    }

    const profit = (investment * profitPercent) / 100;
    const loss = (investment * lossPercent) / 100;

    return { profit, loss, profitPercent, lossPercent };
  };

  const simResult = calculateSimulation();

  if (trialExpired) {
    return (
      <div className="min-h-screen bg-primary pt-20 flex items-center justify-center">
        <div className="card text-center max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white mb-4">
            {t('subscription.expired')}
          </h2>
          <p className="text-gray-400 mb-6">
            {t('landing.disclaimer')}
          </p>
          <button
            onClick={() => navigate('/subscription')}
            className="btn-primary w-full"
          >
            {t('subscription.upgrade')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-outfit text-4xl font-bold text-white mb-8 text-center">
          {t('analyze.title')}
        </h1>

        {!result && !loading && (
          <div className="max-w-2xl mx-auto">
            <div
              className={`drop-zone ${dragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />
              
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreview(null);
                      setImage(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">{t('analyze.drag')}</p>
                  <p className="text-gray-500 text-sm">{t('analyze.formats')}</p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {image && (
              <button
                onClick={handleAnalyze}
                className="btn-primary w-full mt-6"
              >
                {t('analyze.analyze')}
              </button>
            )}
          </div>
        )}

        {loading && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="card">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              <h3 className="font-outfit text-xl font-semibold text-white mb-2">
                {t('analyze.analyzing')}
              </h3>
              <p className="text-gray-400 mb-4">AI is analyzing your chart...</p>
              <div className="confidence-bar w-full">
                <div className="confidence-fill bg-accent animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="max-w-3xl mx-auto">
            <div className="card animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-outfit text-2xl font-bold text-white">
                  {t('analyze.results')}
                </h2>
                <button
                  onClick={() => {
                    setResult(null);
                    setPreview(null);
                    setImage(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{t('analyze.signal')}</p>
                  <p className={`font-outfit text-3xl font-bold ${
                    result.signal === 'Buy' ? 'signal-buy' :
                    result.signal === 'Sell' ? 'signal-sell' : 'signal-hold'
                  }`}>
                    {result.signal}
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{t('analyze.confidence')}</p>
                  <div className="flex items-center gap-3">
                    <p className="font-outfit text-3xl font-bold text-white">
                      {result.confidence}%
                    </p>
                    <div className="confidence-bar flex-1">
                      <div 
                        className={`confidence-fill ${getConfidenceColor(result.confidence)}`}
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{t('analyze.entry')}</p>
                  <p className="font-mono text-xl text-white">
                    {result.entryPrice ? `$${result.entryPrice.toLocaleString()}` : '-'}
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{t('analyze.stopLoss')}</p>
                  <p className="font-mono text-xl text-red-400">
                    {result.stopLoss ? `$${result.stopLoss.toLocaleString()}` : '-'}
                  </p>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">{t('analyze.takeProfit')}</p>
                  <div className="font-mono text-xl text-accent">
                    {result.takeProfit?.length > 0 ? result.takeProfit.map(p => `$${p.toLocaleString()}`).join(', ') : '-'}
                  </div>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-sm mb-1">{t('analyze.risk')}</p>
                <p className={`font-outfit text-xl font-bold ${
                  result.riskLevel === 'Low' ? 'risk-low' :
                  result.riskLevel === 'Medium' ? 'risk-medium' : 'risk-high'
                }`}>
                  {result.riskLevel}
                </p>
              </div>

              <div className="bg-secondary rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">{t('analyze.explanation')}</p>
                <p className="text-white">{result.explanation}</p>
              </div>

              <div className="mt-8 border-t border-gray-800 pt-8">
                <button
                  onClick={() => setShowSimulator(!showSimulator)}
                  className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {showSimulator ? 'Close Trade Simulator' : 'Simulate Trade'}
                </button>

                {showSimulator && (
                  <div className="bg-primary/50 rounded-xl p-6 border border-gray-800 animate-fade-in-up">
                    <h3 className="font-outfit text-xl font-bold text-white mb-6">Trade Simulator</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Investment ($)</label>
                        <input 
                          type="number" 
                          value={investment}
                          onChange={(e) => setInvestment(Number(e.target.value))}
                          className="input-field w-full"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Leverage</label>
                        <select 
                          value={leverage}
                          onChange={(e) => setLeverage(Number(e.target.value))}
                          className="input-field w-full bg-secondary"
                        >
                          <option value="1">1x (Spot)</option>
                          <option value="2">2x</option>
                          <option value="5">5x</option>
                          <option value="10">10x</option>
                          <option value="20">20x</option>
                          <option value="50">50x</option>
                          <option value="100">100x</option>
                        </select>
                      </div>

                      {result.takeProfit && result.takeProfit.length > 0 && (
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Take Profit Target</label>
                          <select 
                            value={selectedTarget}
                            onChange={(e) => setSelectedTarget(Number(e.target.value))}
                            className="input-field w-full bg-secondary"
                          >
                            {result.takeProfit.map((tp, idx) => (
                              <option key={idx} value={idx}>Target {idx + 1} (${tp.toLocaleString()})</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Potential Profit</p>
                        <p className="font-mono text-2xl font-bold text-green-400">
                          +${simResult.profit.toFixed(2)}
                        </p>
                        <p className="text-green-500/80 text-sm">+{simResult.profitPercent.toFixed(2)}% ROE</p>
                      </div>

                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-gray-400 text-sm mb-1">Potential Loss (at Stop Loss)</p>
                        <p className="font-mono text-2xl font-bold text-red-400">
                          -${Math.abs(simResult.loss).toFixed(2)}
                        </p>
                        <p className="text-red-500/80 text-sm">-{Math.abs(simResult.lossPercent).toFixed(2)}% ROE</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm">
                  ⚠️ {t('landing.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && !loading && !result && (
          <div className="mt-16 max-w-2xl mx-auto">
            <h2 className="font-outfit text-2xl font-bold text-white mb-6">
              {t('analyze.history')}
            </h2>
            <div className="space-y-4">
              {history.slice(0, 5).map((item) => (
                <div key={item._id} className="card flex items-center justify-between relative group">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.imageUrl}
                      alt="Chart"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className={`font-bold ${
                        item.result.signal === 'Buy' ? 'signal-buy' :
                        item.result.signal === 'Sell' ? 'signal-sell' : 'signal-hold'
                      }`}>
                        {item.result.signal}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-gray-400">{item.result.confidence}%</p>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;
