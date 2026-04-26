const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  createTicket,
  getUserTickets,
  getAllTickets,
  replyToTicket,
  closeTicket
} = require('../controllers/supportController');

// User routes
router.post('/', auth, createTicket);
router.get('/my-tickets', auth, getUserTickets);
router.post('/:id/reply', auth, replyToTicket);

// Admin routes
router.get('/all', auth, admin, getAllTickets);
router.put('/:id/close', auth, admin, closeTicket);

module.exports = router;
