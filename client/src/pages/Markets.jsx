import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AdvancedRealTimeChart, Screener } from 'react-ts-tradingview-widgets';

const Markets = () => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('crypto');
  const [selectedSymbol, setSelectedSymbol] = useState('BINANCE:BTCUSDT');

  const mockData = {
    crypto: [
      { display: 'BTC/USDT', symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', price: 67432.50, change: 2.34, icon: '₿' },
      { display: 'ETH/USDT', symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', price: 3521.80, change: 1.56, icon: 'Ξ' },
      { display: 'BNB/USDT', symbol: 'BINANCE:BNBUSDT', name: 'BNB', price: 612.40, change: -0.87, icon: '◈' },
      { display: 'SOL/USDT', symbol: 'BINANCE:SOLUSDT', name: 'Solana', price: 178.90, change: 5.23, icon: '◎' },
      { display: 'XRP/USDT', symbol: 'BINANCE:XRPUSDT', name: 'Ripple', price: 0.5234, change: -1.23, icon: '✕' },
      { display: 'ADA/USDT', symbol: 'BINANCE:ADAUSDT', name: 'Cardano', price: 0.4521, change: 3.45, icon: '₳' }
    ],
    stocks: [
      { display: 'AAPL', symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', price: 178.72, change: 0.89, icon: '📱' },
      { display: 'MSFT', symbol: 'NASDAQ:MSFT', name: 'Microsoft', price: 378.91, change: 1.23, icon: '🪟' },
      { display: 'GOOGL', symbol: 'NASDAQ:GOOGL', name: 'Alphabet', price: 141.80, change: -0.45, icon: '🔍' },
      { display: 'TSLA', symbol: 'NASDAQ:TSLA', name: 'Tesla', price: 248.50, change: 2.67, icon: '🚗' },
      { display: 'AMZN', symbol: 'NASDAQ:AMZN', name: 'Amazon', price: 178.25, change: 1.12, icon: '📦' },
      { display: 'NVDA', symbol: 'NASDAQ:NVDA', name: 'NVIDIA', price: 875.40, change: 3.45, icon: '🎮' }
    ],
    forex: [
      { display: 'EUR/USD', symbol: 'FX:EURUSD', name: 'Euro/Dollar', price: 1.0876, change: 0.12, icon: '€' },
      { display: 'GBP/USD', symbol: 'FX:GBPUSD', name: 'Pound/Dollar', price: 1.2654, change: -0.08, icon: '£' },
      { display: 'USD/JPY', symbol: 'FX:USDJPY', name: 'Dollar/Yen', price: 154.32, change: 0.23, icon: '¥' },
      { display: 'USD/CHF', symbol: 'FX:USDCHF', name: 'Dollar/Franc', price: 0.8834, change: -0.15, icon: 'CHF' },
      { display: 'AUD/USD', symbol: 'FX:AUDUSD', name: 'Aussie/Dollar', price: 0.6532, change: 0.34, icon: 'A$' },
      { display: 'USD/CAD', symbol: 'FX:USDCAD', name: 'Dollar/CAD', price: 1.3654, change: -0.21, icon: 'C$' }
    ]
  };

  const filteredData = mockData[activeTab].filter(item =>
    item.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentItem = mockData[activeTab].find(item => item.symbol === selectedSymbol) || mockData[activeTab][0];

  return (
    <div className="min-h-screen bg-primary pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-outfit text-4xl font-bold text-white mb-4">
            {t('markets.title')}
          </h1>
          <p className="text-gray-400">Real-time market data powered by TradingView</p>
        </div>

        <div className="mb-8">
          <input
            type="text"
            placeholder={t('markets.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        <div className="flex gap-4 mb-8">
          {['crypto', 'stocks', 'forex'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-accent text-black'
                  : 'bg-card text-gray-300 hover:bg-accent/10'
              }`}
            >
              {t(`markets.${tab}`)}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{currentItem.icon}</span>
                  <div>
                    <h3 className="font-outfit font-semibold text-white">{currentItem.display}</h3>
                    <p className="text-gray-400 text-sm">{currentItem.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-bold text-white">
                    ${currentItem.price.toLocaleString()}
                  </p>
                  <p className={`font-mono ${currentItem.change >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {currentItem.change >= 0 ? '+' : ''}{currentItem.change}%
                  </p>
                </div>
              </div>
            </div>
            <div className="h-[500px] w-full">
              <AdvancedRealTimeChart theme="dark" width="100%" height="100%" symbol={selectedSymbol} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-outfit font-semibold text-white mb-4">Markets</h3>
            {filteredData.slice(0, 5).map((item, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedSymbol(item.symbol)}
                className={`card flex items-center justify-between py-4 cursor-pointer transition-colors ${selectedSymbol === item.symbol ? 'border-accent' : 'hover:border-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-white">{item.display}</p>
                    <p className="text-gray-400 text-sm">{item.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-white">${item.price.toLocaleString()}</p>
                  <p className={`font-mono text-sm ${item.change >= 0 ? 'text-accent' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="font-outfit text-3xl font-bold text-white mb-4">Futures & Derivatives</h2>
            <p className="text-gray-400 mb-6">Access highly leveraged futures markets with our state-of-the-art terminal and live analytics.</p>
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium border border-accent/30">Up to 100x Leverage</span>
              <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium border border-accent/30">Deep Liquidity</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-purple-500/20 blur-2xl rounded-3xl"></div>
            <img src="/futures_trading.png" alt="Futures Terminal" className="relative w-full rounded-2xl border border-gray-800 shadow-2xl" />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-outfit text-2xl font-bold text-white mb-6">Market Screener</h2>
          <div className="h-[600px] w-full rounded-xl overflow-hidden border border-border">
            <Screener colorTheme="dark" width="100%" height="100%" defaultColumn="overview" defaultScreen="general" market="crypto" showToolbar={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
