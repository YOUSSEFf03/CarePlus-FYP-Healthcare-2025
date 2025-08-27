const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendMessage = async (to, body) => {
  try {
    const message = await client.messages.create({
      body: body,
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${to}`
    });
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

module.exports = {
  sendMessage
};