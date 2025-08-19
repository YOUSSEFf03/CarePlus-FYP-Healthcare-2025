const RegistrationController = require('./registrationController');
const AppointmentController = require('./appointmentController');
const UserController = require('./userController');
const DatabaseService = require('../services/databaseService');
const TwilioService = require('../services/twilioService');
const { welcomeMessage, registrationPrompt, invalidCommandMessage, errorMessage } = require('../utils/messageTemplates');

// In-memory user states (you might want to move this to Redis in production)
const userStates = {};

class MessageHandler {
  static async handleIncomingMessage(req, res) {
    const incomingMsg = req.body.Body.trim();
    const sender = req.body.From.replace('whatsapp:', '');
    
    // Initialize user state if it doesn't exist
    if (!userStates[sender]) {
      userStates[sender] = { step: null, data: {} };
    }
    
    const currentState = userStates[sender];

    try {
      // Check if user exists on first interaction
      const userExists = await DatabaseService.userExists(sender);
      
      if (!userExists && currentState.step === null && !/^(hi|hello|start|register)$/i.test(incomingMsg)) {
        await TwilioService.sendMessage(sender, registrationPrompt());
        userStates[sender] = { step: 'awaiting_registration', data: {} };
        return res.status(200).send();
      }

      if (/^(hi|hello|start)$/i.test(incomingMsg)) {
        await this.handleWelcomeMessage(sender, userExists);
        userStates[sender] = { step: null, data: {} };
      }
      else if (/^register$/i.test(incomingMsg)) {
        userStates[sender] = await RegistrationController.startRegistration(sender);
      }
      else if (currentState.step === 'register_name') {
        userStates[sender] = await RegistrationController.handleNameInput(sender, incomingMsg, currentState);
      }
      else if (currentState.step === 'register_email') {
        userStates[sender] = await RegistrationController.handleEmailInput(sender, incomingMsg, currentState);
      }
      else if (currentState.step === 'register_dob') {
        userStates[sender] = await RegistrationController.handleDOBInput(sender, incomingMsg, currentState);
      }
      else if (currentState.step === 'register_gender') {
        userStates[sender] = await RegistrationController.handleGenderInput(sender, incomingMsg, currentState);
      }
      else if (/^new appointment$|^book appointment$/i.test(incomingMsg)) {
        if (!userExists) {
          await TwilioService.sendMessage(sender, registrationPrompt());
        } else {
          userStates[sender] = await AppointmentController.startAppointmentFlow(sender);
        }
      }
      else if (/^my appointments$|^appointments$/i.test(incomingMsg)) {
        await AppointmentController.showPatientAppointments(sender);
      }
      else if (/^delete appointment$|^cancel appointment$/i.test(incomingMsg)) {
        await AppointmentController.showAppointmentsForDeletion(sender);
      }
      else if (currentState.step && currentState.step.startsWith('appointment_')) {
        userStates[sender] = await AppointmentController.handleAppointmentStep(sender, incomingMsg, currentState);
      }
      else if (currentState.step === 'delete_appointment') {
        await AppointmentController.handleAppointmentDeletion(sender, incomingMsg, currentState);
        userStates[sender] = { step: null, data: {} };
      }
      else {
        await TwilioService.sendMessage(sender, invalidCommandMessage());
      }
    } catch (error) {
      console.error("Error handling message:", error);
      await TwilioService.sendMessage(sender, errorMessage());
      userStates[sender] = { step: null, data: {} };
    }

    res.status(200).send();
  }

  static async handleWelcomeMessage(sender, isRegistered) {
    let firstName = '';
    if (isRegistered) {
      const patient = await DatabaseService.getPatientByPhone(sender);
      if (patient) {
        firstName = patient.name.split(' ')[0];
      }
    }
    
    await TwilioService.sendMessage(sender, welcomeMessage(isRegistered, firstName));
  }
}

module.exports = MessageHandler;