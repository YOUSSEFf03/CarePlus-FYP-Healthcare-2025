const DatabaseService = require('../services/databaseService');
const TwilioService = require('../services/twilioService');
const { validateEmail, validateDate } = require('../utils/validators');
const { formatDate } = require('../utils/dateHelper');

const startRegistration = async (sender) => {
  await TwilioService.sendMessage(sender, 
    "📝 Let's get you registered!\n\n" +
    "Please enter your FULL NAME:"
  );
  return { step: 'register_name', data: {} };
};

const handleNameInput = async (sender, fullName, state) => {
  const names = fullName.trim().split(/\s+/);
  
  if (names.length < 2) {
    await TwilioService.sendMessage(sender, 
      "❌ Please enter both your FIRST and LAST name:"
    );
    return state;
  }

  await TwilioService.sendMessage(sender, 
    "📧 Now please enter your EMAIL address:"
  );

  return {
    step: 'register_email',
    data: {
      ...state.data,
      firstName: names[0],
      lastName: names.slice(1).join(' ')
    }
  };
};

const handleEmailInput = async (sender, email, state) => {
  if (!validateEmail(email)) {
    await TwilioService.sendMessage(sender, 
      "❌ Please enter a valid EMAIL address:"
    );
    return state;
  }

  await TwilioService.sendMessage(sender, 
    "📅 Please enter your DATE OF BIRTH (DD/MM/YYYY):"
  );

  return {
    ...state,
    step: 'register_dob',
    data: { ...state.data, email: email.trim() }
  };
};

const handleDOBInput = async (sender, dobInput, state) => {
  if (!validateDate(dobInput)) {
    await TwilioService.sendMessage(sender, 
      "❌ Invalid date format. Please use DD/MM/YYYY (e.g. 15/05/1985):"
    );
    return state;
  }

  const [day, month, year] = dobInput.split('/').map(Number);
  const dob = new Date(year, month - 1, day);

  await TwilioService.sendMessage(sender, 
    "👤 Please specify your GENDER (Male/Female/Other):"
  );

  return {
    ...state,
    step: 'register_gender',
    data: { ...state.data, dob }
  };
};

const handleGenderInput = async (sender, genderInput, state) => {
  const gender = genderInput.toLowerCase();
  if (!['male', 'female', 'other'].includes(gender)) {
    await TwilioService.sendMessage(sender, 
      "❌ Please specify Male, Female or Other:"
    );
    return state;
  }

  // Create user and patient records
  try {
    const { user, patient } = await DatabaseService.createUserAndPatient(
      {
        phone: sender,
        name: `${state.data.firstName} ${state.data.lastName}`,
        email: state.data.email,
        role: 'patient'
      },
      {
        date_of_birth: state.data.dob,
        gender: gender,
        medical_history: ''
      }
    );

    await TwilioService.sendMessage(sender,
      `✅ Registration complete! Welcome ${state.data.firstName} ${state.data.lastName}.\n\n` +
      `DOB: ${formatDate(state.data.dob, "dd/MM/yyyy")}\n` +
      `Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}\n\n` +
      "You can now book appointments by replying 'NEW APPOINTMENT'"
    );

    return { step: null, data: {} };
  } catch (error) {
    console.error('Registration error:', error);
    await TwilioService.sendMessage(sender, 
      "❌ An error occurred during registration. Please try again later."
    );
    return { step: null, data: {} };
  }
};

module.exports = {
  startRegistration,
  handleNameInput,
  handleEmailInput,
  handleDOBInput,
  handleGenderInput
};