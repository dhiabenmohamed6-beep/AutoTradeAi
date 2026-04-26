const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Subscription = require('../models/Subscription');
const Contact = require('../models/Contact');

// Format user for admin display (without password)
const formatUser = (u) => ({
  _id: u.id.toString(),
  email: u.email,
  name: u.name,
  role: u.is_admin ? 'admin' : 'user',
  trialActive: u.trial_active,
  trialExpiresAt: u.trial_expires_at,
  subscription: {
    active: u.subscription_active,
    plan: u.subscription_plan,
    expiresAt: u.subscription_expires_at
  },
  createdAt: u.created_at
});

// Format analysis for admin display
const formatAnalysis = (a) => ({
  _id: a.id.toString(),
  userId: a.user_id ? { id: a.user_id, name: a.user_name, email: a.user_email } : null,
  imageUrl: a.image_url,
  result: a.result,
  createdAt: a.created_at
});

// Format contact
const formatContact = (c) => ({
  _id: c.id.toString(),
  name: c.name,
  email: c.email,
  subject: c.subject,
  message: c.message,
  read: c.is_read,
  createdAt: c.created_at
});

// Format subscription for admin pending list
const formatSubscription = (s) => ({
  _id: s.id.toString(),
  userId: s.user_id ? { id: s.user_id, name: s.user_name, email: s.user_email } : null,
  plan: s.plan,
  paymentMethod: s.payment_method,
  amount: s.amount,
  currency: s.currency,
  approved: s.approved,
  status: s.status,
  createdAt: s.start_date || s.created_at
});

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users.map(formatUser));
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await Analysis.deleteManyByUserId(userId);
    await User.deleteById(userId);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countAll();
    const activeSubscriptions = await Subscription.countActive();
    const pendingPayments = await Subscription.countPending();
    const totalAnalyses = await Analysis.countAll();

    res.json({
      totalUsers,
      activeSubscriptions,
      pendingPayments,
      totalAnalyses
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.findAllWithUser(100);
    res.json(analyses.map(formatAnalysis));
  } catch (error) {
    console.error('Get all analyses error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      sort: { field: 'created_at', order: 'DESC' }
    });
    res.json(contacts.map(formatContact));
  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.markContactRead = async (req, res) => {
  try {
    await Contact.markAsRead(req.params.id);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark contact read error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.getPending();
    res.json(subscriptions.map(formatSubscription));
  } catch (error) {
    console.error('Get pending subscriptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.approveSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    // Update subscription status
    const updatedSubscription = await Subscription.update(subscriptionId, {
      status: 'active',
      approved: true,
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Update user subscription fields
    await User.update(subscription.user_id, {
      subscription_active: true,
      subscription_plan: subscription.plan,
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      trial_active: false
    });

    // Return formatted subscription
    const formatted = formatSubscription({ ...updatedSubscription, user_id: subscription.user_id, user_name: subscription.user_name, user_email: subscription.user_email });
    res.json({ message: 'Subscription approved', subscription: formatted });
  } catch (error) {
    console.error('Approve subscription error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSubscription = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    const updatedSubscription = await Subscription.update(subscriptionId, { status: 'expired' });

    const formatted = formatSubscription({ ...updatedSubscription, user_id: subscription.user_id, user_name: subscription.user_name, user_email: subscription.user_email });
    res.json({ message: 'Subscription rejected', subscription: formatted });
  } catch (error) {
    console.error('Reject subscription error:', error);
    res.status(500).json({ message: error.message });
  }
};
