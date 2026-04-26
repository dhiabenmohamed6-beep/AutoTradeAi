const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.createSubscription = async (req, res) => {
  try {
    const { paymentMethod, useTrial } = req.body;
    const user = await User.findById(req.user._id);

    if (user.subscription && user.subscription.active) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    // If user chooses trial, activate trial period
    if (useTrial) {
      const now = new Date();
      const hasActiveTrial = user.trialActive && user.trialExpiresAt && new Date(user.trialExpiresAt) > now;
      
      if (!hasActiveTrial) {
        user.trialActive = true;
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
        user.trialExpiresAt = trialExpiresAt;
        await user.save();
        return res.status(200).json({ 
          message: 'Free trial activated! You have 7 days to try all premium features.',
          trialActive: true,
          trialExpiresAt
        });
      } else {
        return res.status(200).json({ 
          message: 'You already have an active free trial.',
          trialActive: true,
          trialExpiresAt: user.trialExpiresAt
        });
      }
    }

    // Otherwise, create payment request
    const subscription = new Subscription({
      userId: user._id,
      paymentMethod,
      status: 'pending'
    });

    await subscription.save();
    res.status(201).json({ message: 'Subscription request submitted. Waiting for admin approval.', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const hasTrialAccess = user.trialActive && user.trialExpiresAt && new Date(user.trialExpiresAt) > now;
    const hasSubscription = user.subscription && user.subscription.active;
    
    res.json({
      hasAccess: hasTrialAccess || hasSubscription,
      trialActive: user.trialActive,
      trialExpiresAt: user.trialExpiresAt,
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
