const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'autotradeai_secret_key', { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

    const user = await User.create({
      email,
      password,
      name,
      trialExpiresAt
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.is_admin ? 'admin' : 'user',
        trialActive: user.trial_active,
        trialExpiresAt: user.trial_expires_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.is_admin ? 'admin' : 'user',
        trialActive: user.trial_active,
        trialExpiresAt: user.trial_expires_at,
        subscription: {
          active: user.subscription_active,
          plan: user.subscription_plan,
          expiresAt: user.subscription_expires_at
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = req.user; // Already set by auth middleware
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.is_admin ? 'admin' : 'user',
      trialActive: user.trial_active,
      trialExpiresAt: user.trial_expires_at,
      subscription: {
        active: user.subscription_active,
        plan: user.subscription_plan,
        expiresAt: user.subscription_expires_at
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
