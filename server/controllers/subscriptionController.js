const Subscription = require('../models/Subscription');
const User = require('../models/User');

exports.createSubscription = async (req, res) => {
  try {
    const { paymentMethod, useTrial } = req.body;
    const user = req.user;

    // Check existing active subscription via user's subscription_active flag or via subscriptions table
    const currentSubscription = await Subscription.findByUser(user.id);
    if (currentSubscription && currentSubscription.status === 'active' && currentSubscription.approved) {
      return res.status(400).json({ message: 'Already subscribed' });
    }

    // If user chooses trial, activate trial period
    if (useTrial) {
      // Refresh user from DB to get latest trial status
      const freshUser = await User.findById(user.id);
      const now = new Date();
      const hasActiveTrial = freshUser.trial_active && freshUser.trial_expires_at && new Date(freshUser.trial_expires_at) > now;

      if (!hasActiveTrial) {
        const trialExpiresAt = new Date();
        trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);
        await User.update(user.id, {
          trial_active: true,
          trial_expires_at: trialExpiresAt
        });
        return res.status(200).json({
          message: 'Free trial activated! You have 7 days to try all premium features.',
          trialActive: true,
          trialExpiresAt
        });
      } else {
        return res.status(200).json({
          message: 'You already have an active free trial.',
          trialActive: true,
          trialExpiresAt: freshUser.trial_expires_at
        });
      }
    }

    // Otherwise, create payment request
    const subscription = await Subscription.create({
      userId: user.id,
      paymentMethod
    });

    res.status(201).json({
      message: 'Subscription request submitted. Waiting for admin approval.',
      subscription
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findByUser(req.user.id);
    if (!subscription) {
      return res.json(null);
    }
    // Format to match original schema
    const formatted = {
      _id: subscription.id.toString(),
      userId: subscription.user_id,
      plan: subscription.plan,
      status: subscription.status,
      paymentMethod: subscription.payment_method,
      amount: subscription.amount,
      currency: subscription.currency,
      approved: subscription.approved,
      // Map start_date to createdAt if exists
      createdAt: subscription.start_date || subscription.created_at
    };
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const user = req.user;
    const now = new Date();
    const hasTrialAccess = user.trial_active && user.trial_expires_at && new Date(user.trial_expires_at) > now;
    const hasSubscription = user.subscription_active;

    res.json({
      hasAccess: hasTrialAccess || hasSubscription,
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
