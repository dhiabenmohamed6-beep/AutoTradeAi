const express = require('express');
const router = express.Router();
const { analyze, getHistory, deleteAnalysis } = require('../controllers/analysisController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/analyze', auth, upload.single('image'), analyze);
router.get('/history', auth, getHistory);
router.delete('/history/:id', auth, deleteAnalysis);

module.exports = router;
