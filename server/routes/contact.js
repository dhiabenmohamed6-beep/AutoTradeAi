const express = require('express');
const router = express.Router();
const { submit } = require('../controllers/contactController');

router.post('/submit', submit);

module.exports = router;
