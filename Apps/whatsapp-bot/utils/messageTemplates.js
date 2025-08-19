const welcomeMessage = (isRegistered = false, firstName = '') => {
  if (isRegistered) {
    return `👋 Welcome back, ${firstName}!\n\n` +
           "You can:\n" +
           "1. *NEW APPOINTMENT* - Book new appointment\n" +
           "2. *MY APPOINTMENTS* - View your appointments\n" +
           "3. *DELETE APPOINTMENT* - Cancel appointments";
  } else {
    return "👋 Welcome to *MediBook Appointment System*!\n\n" +
           "You need to register first. Please reply with:\n\n" +
           "REGISTER - To start registration\n\n" +
           "We'll need your:\n" +
           "- Full Name\n" +
           "- Email\n" +
           "- Date of Birth\n" +
           "- Gender";
  }
};

const registrationPrompt = () => {
  return "🔒 You need to register first. Please reply with:\n\n" +
         "REGISTER - To start registration\n\n" +
         "We'll need your:\n" +
         "- Full Name\n" +
         "- Email\n" +
         "- Date of Birth (DD/MM/YYYY)\n" +
         "- Gender";
};

const registrationStart = () => {
  return "📝 Let's get you registered!\n\n" +
         "Please enter your FULL NAME:";
};

const invalidCommandMessage = () => {
  return "Sorry, I didn't understand that. Please reply with:\n" +
         "'NEW APPOINTMENT' - Book appointment\n" +
         "'MY APPOINTMENTS' - View appointments\n" +
         "'DELETE APPOINTMENT' - Cancel appointments\n" +
         "'CANCEL' - Quick cancel";
};

const errorMessage = () => {
  return "⚠️ An error occurred. Please start over by sending 'HI'.";
};

module.exports = {
  welcomeMessage,
  registrationPrompt,
  registrationStart,
  invalidCommandMessage,
  errorMessage
};