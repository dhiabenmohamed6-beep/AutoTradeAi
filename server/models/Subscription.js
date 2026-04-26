const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['premium'], default: 'premium' },
  status: { type: String, enum: ['pending', 'active', 'expired'], default: 'pending' },
  paymentMethod: { type: String, enum: ['e-dinar', 'bank-transfer'], default: 'e-dinar' },
  amount: { type: Number, default: 59 },
  currency: { type: String, default: 'DT' },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
