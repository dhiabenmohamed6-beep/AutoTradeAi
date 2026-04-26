const express = require('express');
const router = express.Router();
const { createSubscription, getSubscription, checkAccess } = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

router.post('/create', auth, createSubscription);
router.get('/status', auth, getSubscription);
router.get('/check-access', auth, checkAccess);

module.exports = router;
