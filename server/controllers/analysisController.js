const Analysis = require('../models/Analysis');
const User = require('../models/User');
const { analyzeChart } = require('../services/aiService');

exports.analyze = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const now = new Date();
    const hasAccess = user.trialActive && user.trialExpiresAt && new Date(user.trialExpiresAt) > now;
    const hasSubscription = user.subscription && user.subscription.active;

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

    const analysis = new Analysis({
      userId: user._id,
      imageUrl: `/uploads/${req.file.filename}`,
      result: analysisResult.result
    });

    await analysis.save();

    res.json({
      ...analysisResult,
      imageUrl: analysis.imageUrl
    });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    
    // Delete image file
    const fs = require('fs');
    const path = require('path');
    const imagePath = path.join(__dirname, '..', analysis.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    await Analysis.deleteOne({ _id: req.params.id });
    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
