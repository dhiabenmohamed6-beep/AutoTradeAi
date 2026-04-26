const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'autotradeai_secret_key', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

    const user = new User({
      email,
      password,
      name,
      trialExpiresAt
    });

    await user.save();
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, trialActive: user.trialActive, trialExpiresAt: user.trialExpiresAt }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role, trialActive: user.trialActive, trialExpiresAt: user.trialExpiresAt, subscription: user.subscription }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ id: user._id, email: user.email, name: user.name, role: user.role, trialActive: user.trialActive, trialExpiresAt: user.trialExpiresAt, subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
