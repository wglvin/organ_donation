const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

// Remove direct notification endpoint
router.post('/notify/email', notificationController.sendEmail);
router.post('/notify/email/user/:userId', notificationController.sendDynamicEmail);
router.get('/health', notificationController.healthCheck);

module.exports = router;
