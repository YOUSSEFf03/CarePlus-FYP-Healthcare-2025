require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Temporary storage for appointments (replace with a real database later)
const appointments = {};

app.post('/whatsapp', async (req, res) => {
    const incomingMsg = req.body.Body.toLowerCase().trim();
    const sender = req.body.From;

    let response;

    if (incomingMsg === 'hi' || incomingMsg === 'hello') {
        response = "👋 Hello! Welcome to *Dr. Smith's Clinic*. \n\nTo book an appointment, reply *'book'*. \nTo cancel, reply *'cancel'*.";
    } 
    else if (incomingMsg === 'book') {
        response = "📅 Please provide your preferred date and time (e.g., *'July 30 3 PM'*).";
        appointments[sender] = { state: 'awaiting_date' };
    } 
    else if (appointments[sender]?.state === 'awaiting_date') {
        response = `✅ Your appointment is confirmed for *${incomingMsg}*. \n\nThank you! We’ll send a reminder before your visit.`;
        delete appointments[sender];
    } 
    else if (incomingMsg === 'cancel') {
        response = "❌ Your appointment has been cancelled. Let us know if you need anything else!";
        delete appointments[sender];
    } 
    else {
        response = "Sorry, I didn’t understand that. \n\nTo book an appointment, reply *'book'*. \nTo cancel, reply *'cancel'*.";
    }

   
    await client.messages.create({
        body: response,
        from: 'whatsapp:+14155238886',
        to: sender
    });

    res.status(200).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));