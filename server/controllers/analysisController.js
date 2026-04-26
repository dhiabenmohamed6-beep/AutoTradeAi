const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { analyzeChart } = require('../services/aiService');

exports.analyze = async (req, res) => {
  try {
    const user = req.user; // Set by auth middleware
    const now = new Date();
    const hasAccess = user.trial_active && user.trial_expires_at && new Date(user.trial_expires_at) > now;
    const hasSubscription = user.subscription_active;

    if (!hasAccess && !hasSubscription) {
      return res.status(403).json({
        message: 'Trial expired. Please subscribe to continue.',
        trialExpired: true
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const fs = require('fs');
    const path = require('path');

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64 = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    const analysisResult = await analyzeChart(base64, mimeType);

    const analysis = await Analysis.create({
      userId: user.id,
      imageUrl: `/uploads/${req.file.filename}`,
      result: analysisResult.result
    });

    res.json({
      ...analysisResult,
      imageUrl: analysis.image_url
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.findByUser(req.user.id, {
      sort: { field: 'created_at', order: 'DESC' },
      limit: 50
    });
    // Transform to match frontend expectations
    const formatted = analyses.map(a => ({
      _id: a.id.toString(),
      userId: a.user_id,
      imageUrl: a.image_url,
      result: a.result,
      createdAt: a.created_at
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndUserId(req.params.id, req.user.id);
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    // Delete image file
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '..', analysis.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Analysis.deleteById(analysis.id);
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
