const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Subscription = require('../models/Subscription');
const Contact = require('../models/Contact');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Analysis.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const pendingPayments = await Subscription.countDocuments({ status: 'pending', approved: false });
    const totalAnalyses = await Analysis.countDocuments();
    
    res.json({
      totalUsers,
      activeSubscriptions,
      pendingPayments,
      totalAnalyses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markContactRead = async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPendingSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ status: 'pending', approved: false })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.approveSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

    subscription.status = 'active';
    subscription.approved = true;
    await subscription.save();

    const user = await User.findById(subscription.userId);
    user.subscription = {
      active: true,
      plan: subscription.plan,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    user.trialActive = false;
    await user.save();

    res.json({ message: 'Subscription approved', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    subscription.status = 'expired';
    await subscription.save();
    res.json({ message: 'Subscription rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
