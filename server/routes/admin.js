const express = require('express');
const router = express.Router();
const admin = require('../middleware/admin');
const {
  getAllUsers,
  deleteUser,
  getStats,
  getAllAnalyses,
  getAllContacts,
  markContactRead,
  getPendingSubscriptions,
  approveSubscription,
  rejectSubscription
} = require('../controllers/adminController');

router.get('/users', admin, getAllUsers);
router.delete('/users/:id', admin, deleteUser);
router.get('/stats', admin, getStats);
router.get('/analyses', admin, getAllAnalyses);
router.get('/contacts', admin, getAllContacts);
router.put('/contacts/:id/read', admin, markContactRead);
router.get('/subscriptions/pending', admin, getPendingSubscriptions);
router.put('/subscriptions/:id/approve', admin, approveSubscription);
router.put('/subscriptions/:id/reject', admin, rejectSubscription);

module.exports = router;
