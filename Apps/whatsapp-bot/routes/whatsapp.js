const express = require('express');
const router = express.Router();
const MessageHandler = require('../controllers/messageHandler');

router.post('/', async (req, res) => {
  try {
    await MessageHandler.handleIncomingMessage(req, res);
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    res.status(500).send('Error processing message');
  }
});

module.exports = router;