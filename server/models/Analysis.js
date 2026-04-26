const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  result: {
    signal: { type: String, enum: ['Buy', 'Sell', 'Hold'] },
    confidence: { type: Number },
    entryPrice: { type: Number },
    stopLoss: { type: Number },
    takeProfit: [{ type: Number }],
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    explanation: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
