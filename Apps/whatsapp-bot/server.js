// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const twilio = require('twilio');
// const { format, addDays, parse, isWithinInterval } = require('date-fns');
// const userStates={};
// const app = express();
// app.use(bodyParser.urlencoded({ extended: false }));

// // Twilio Client
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// // =============================================
// // DATA STRUCTURES
// // =============================================

// // Regions
// const regions = [
//   { region_id: 1, name: "Downtown" },
//   { region_id: 2, name: "Westside" },
//   { region_id: 3, name: "East District" }
// ];

// // Doctors
// const doctors = [
//   {
//     doctor_id: 1,
//     user_id: 1,
//     name: "Dr. Smith",
//     specialization: "Cardiology",
//     license_number: "MD12345",
//     verification_status: "verified",
//     region_id: 1
//   },
//   {
//     doctor_id: 2,
//     user_id: 2,
//     name: "Dr. Johnson",
//     specialization: "Pediatrics",
//     license_number: "MD67890",
//     verification_status: "verified",
//     region_id: 1
//   },
//   {
//     doctor_id: 3,
//     user_id: 3,
//     name: "Dr. Lee",
//     specialization: "Orthopedics",
//     license_number: "MD54321",
//     verification_status: "verified",
//     region_id: 2
//   }
// ];

// // Clinics
// const doctorWorkplaces = [
//   {
//     workplace_id: 1,
//     doctor_id: 1,
//     name: "City Heart Center",
//     type: "clinic",
//     region_id: 1,
//     phone: "+1234567890"
//   },
//   {
//     workplace_id: 2,
//     doctor_id: 2,
//     name: "Pediatric Care Clinic",
//     type: "clinic",
//     region_id: 1,
//     phone: "+1234567891"
//   },
//   {
//     workplace_id: 3,
//     doctor_id: 3,
//     name: "Westside Orthopedics",
//     type: "hospital",
//     region_id: 2,
//     phone: "+1234567892"
//   }
// ];

// // Patients storage
// let patients = [];

// // Generate appointment slots
// const generateSlots = () => {
//   const slots = [];
//   const now = new Date();
  
//   doctors.forEach(doctor => {
//     for (let day = 1; day <= 14; day++) {
//       const slotDate = addDays(now, day);
//       if (slotDate.getDay() === 0) continue; // Skip Sunday
      
//       for (let hour = 9; hour < 17; hour++) {
//         // :00 slot
//         slots.push({
//           slot_id: slots.length + 1,
//           doctor_id: doctor.doctor_id,
//           workplace_id: doctorWorkplaces.find(w => w.doctor_id === doctor.doctor_id)?.workplace_id,
//           date: new Date(slotDate.setHours(0, 0, 0, 0)),
//           start_time: new Date(slotDate.setHours(hour, 0, 0, 0)),
//           end_time: new Date(slotDate.setHours(hour, 30, 0, 0)),
//           is_available: true
//         });
        
//         // :30 slot
//         slots.push({
//           slot_id: slots.length + 1,
//           doctor_id: doctor.doctor_id,
//           workplace_id: doctorWorkplaces.find(w => w.doctor_id === doctor.doctor_id)?.workplace_id,
//           date: new Date(slotDate.setHours(0, 0, 0, 0)),
//           start_time: new Date(slotDate.setHours(hour, 30, 0, 0)),
//           end_time: new Date(slotDate.setHours(hour + 1, 0, 0, 0)),
//           is_available: true
//         });
//       }
//     }
//   });
//   return slots;
// };

// let appointmentSlots = generateSlots();
// let appointments = [];
// let users = [
//   {
//     user_id: 1,
//     phone: "++96171522745", // Use a real number here
//     name: "Admin User",
//     email: "admin@clinic.com",
//     role: "admin",
//     profile_picture_url: "",
//     created_at: new Date(),
//     updated_at: new Date()
//   }
// ];

// // =============================================
// // BUSINESS LOGIC FUNCTIONS
// // =============================================

// const getClinicsInRegion = (regionId) => {
//   return doctorWorkplaces.filter(clinic => clinic.region_id === regionId);
// };

// const getSpecializationsInRegion = (regionId) => {
//   const doctorsInRegion = doctors.filter(doctor => doctor.region_id === regionId);
//   return [...new Set(doctorsInRegion.map(d => d.specialization))];
// };

// const getDoctorsBySpecialization = (specialization, regionId) => {
//   return doctors.filter(doctor => 
//     doctor.specialization === specialization && 
//     doctor.region_id === regionId
//   );
// };

// const getDoctorSlots = (doctorId, date) => {
//   return appointmentSlots.filter(slot => (
//     slot.doctor_id === doctorId &&
//     slot.date.getTime() === date.getTime() &&
//     slot.is_available
//   ));
// };

// const getPatientAppointments = (patientId) => {
//   return appointments.filter(a => 
//     a.patient_id === patientId && 
//     a.status === 'booked'
//   ).map(app => {
//     const slot = appointmentSlots.find(s => s.slot_id === app.slot_id);
//     const doctor = doctors.find(d => d.doctor_id === slot?.doctor_id);
//     const clinic = doctorWorkplaces.find(w => w.workplace_id === slot?.workplace_id);
    
//     return {
//       ...app,
//       doctor_name: doctor?.name || "Unknown",
//       clinic_name: clinic?.name || "Unknown",
//       slot_time: slot?.start_time || new Date()
//     };
//   });
// };

// // =============================================
// // MESSAGE HANDLER
// // =============================================


// app.post('/whatsapp', async (req, res) => {
//   const incomingMsg = req.body.Body.trim();
//   const sender = req.body.From.replace('whatsapp:', '');
  
//   // Initialize user state if it doesn't exist
//   if (!userStates[sender]) {
//     userStates[sender] = { step: null, data: {} };
//   }
//   const currentState = userStates[sender];

//   try {
//     // Check if user exists on first interaction
//     if (!userExists(sender) && currentState.step === null && !/^(hi|hello|start|register)$/i.test(incomingMsg)) {
//       await promptRegistration(sender);
//       return res.status(200).send();
//     }

//     if (/^(hi|hello|start)$/i.test(incomingMsg)) {
//       await sendWelcomeMessage(sender);
//       userStates[sender] = { step: null, data: {} }; // Reset state
//     }
//     else if (/^register$/i.test(incomingMsg)) {
//       await startRegistrationFlow(sender);
//     }
//     else if (currentState.step === 'register_name') {
//       await handleRegistrationName(sender, incomingMsg, currentState);
//     }
//     else if (currentState.step === 'register_email') {
//       await handleRegistrationEmail(sender, incomingMsg, currentState);
//     }
//     else if (currentState.step === 'register_dob') {
//       await handleRegistrationDOB(sender, incomingMsg, currentState);
//     }
//     else if (currentState.step === 'register_gender') {
//       await handleRegistrationGender(sender, incomingMsg, currentState);
//     }
//     else if (/^new appointment$|^book appointment$/i.test(incomingMsg)) {
//       if (!userExists(sender)) {
//         await promptRegistration(sender);
//       } else {
//         await startAppointmentFlow(sender);
//       }
//     }
//     else {
//       await sendInvalidCommand(sender);
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     await sendErrorMessage(sender);
//     userStates[sender] = { step: null, data: {} }; // Reset state on error
//   }

//   res.status(200).send();
// });

// // =============================================
// // REGISTRATION FUNCTIONS
// // =============================================

// function userExists(phone) {
//   return users.some(user => user.phone === phone);
// }

// async function promptRegistration(sender) {
//   await client.messages.create({
//     body: "🔒 You need to register first. Please reply with:\n\n" +
//           "REGISTER - To start registration\n\n" +
//           "We'll need your:\n" +
//           "- Full Name\n" +
//           "- Email\n" +
//           "- Date of Birth (DD/MM/YYYY)\n" +
//           "- Gender",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });
//   userStates[sender] = { step: 'awaiting_registration', data: {} };
// }

// async function startRegistrationFlow(sender) {
//   await client.messages.create({
//     body: "📝 Let's get you registered!\n\n" +
//           "Please enter your FULL NAME:",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });
//   userStates[sender] = { step: 'register_name', data: {} };
// }

// async function handleRegistrationName(sender, fullName, state) {
//   const names = fullName.trim().split(/\s+/);
  
//   if (names.length < 2) {
//     await client.messages.create({
//       body: "❌ Please enter both your FIRST and LAST name:",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//     return;
//   }

//   await client.messages.create({
//     body: "📧 Now please enter your EMAIL address:",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });

//   userStates[sender] = { 
//     step: 'register_email', 
//     data: { 
//       ...state.data, 
//       firstName: names[0], 
//       lastName: names.slice(1).join(' ') 
//     } 
//   };
// }

// async function handleRegistrationEmail(sender, email, state) {
//   // Simple email validation
//   if (!email.includes('@') || !email.includes('.')) {
//     await client.messages.create({
//       body: "❌ Please enter a valid EMAIL address:",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//     return;
//   }

//   await client.messages.create({
//     body: "📅 Please enter your DATE OF BIRTH (DD/MM/YYYY):",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });

//   userStates[sender] = { 
//     ...state, 
//     step: 'register_dob',
//     data: { ...state.data, email: email.trim() } 
//   };
// }

// async function handleRegistrationDOB(sender, dobInput, state) {
//   const [day, month, year] = dobInput.split('/').map(Number);
//   const dob = new Date(year, month - 1, day);

//   if (isNaN(dob.getTime())) {
//     await client.messages.create({
//       body: "❌ Invalid date format. Please use DD/MM/YYYY (e.g. 15/05/1985):",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//     return;
//   }

//   await client.messages.create({
//     body: "👤 Please specify your GENDER (Male/Female/Other):",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });

//   userStates[sender] = { 
//     ...state, 
//     step: 'register_gender',
//     data: { ...state.data, dob: dob } 
//   };
// }

// async function handleRegistrationGender(sender, genderInput, state) {
//   const gender = genderInput.toLowerCase();
//   if (!['male', 'female', 'other'].includes(gender)) {
//     await client.messages.create({
//       body: "❌ Please specify Male, Female or Other:",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//     return;
//   }

//   // Create user record
//   const newUser = {
//     user_id: users.length + 1,
//     phone: sender,
//     name: `${state.data.firstName} ${state.data.lastName}`,
//     email: state.data.email,
//     role: "patient",
//     profile_picture_url: "",
//     created_at: new Date(),
//     updated_at: new Date()
//   };
//   users.push(newUser);

//   // Create patient record
//   const newPatient = {
//     patient_id: patients.length + 1,
//     user_id: newUser.user_id,
//     date_of_birth: format(state.data.dob, "yyyy-MM-dd"),
//     gender: gender,
//     medical_history: ""
//   };
//   patients.push(newPatient);

//   await client.messages.create({
//     body: `✅ Registration complete! Welcome ${state.data.firstName} ${state.data.lastName}.\n\n` +
//           `DOB: ${format(state.data.dob, "dd/MM/yyyy")}\n` +
//           `Gender: ${gender.charAt(0).toUpperCase() + gender.slice(1)}\n\n` +
//           "You can now book appointments by replying 'NEW APPOINTMENT'",
//     from: 'whatsapp:+14155238886',
//     to: `whatsapp:${sender}`
//   });

//   userStates[sender] = { step: null, data: {} };
// }
// // =============================================
// // CONVERSATION FLOW HANDLERS
// // =============================================

// async function sendWelcomeMessage(sender) {
//   const isRegistered = userExists(sender);
  
//   if (isRegistered) {
//     const user = users.find(u => u.phone === sender);
//     await client.messages.create({
//       body: `👋 Welcome back, ${user.name.split(' ')[0]}!\n\n` +
//             "You can:\n" +
//             "1. *NEW APPOINTMENT* - Book new appointment\n" +
//             "2. *MY APPOINTMENTS* - View your appointments\n" +
//             "3. *DELETE APPOINTMENT* - Cancel appointments",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//   } else {
//     await client.messages.create({
//       body: "👋 Welcome to *MediBook Appointment System*!\n\n" +
//             "You need to register first. Please reply with:\n\n" +
//             "REGISTER - To start registration\n\n" +
//             "We'll need your:\n" +
//             "- Full Name\n" +
//             "- Email\n" +
//             "- Date of Birth\n" +
//             "- Gender",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//   }
// }

// async function startAppointmentFlow(sender) {
//   const user = users.find(u => u.phone === sender);
//   if (!user) {
//     await promptRegistration(sender);
//     return;
//   }

//   const patient = patients.find(p => p.user_id === user.user_id);
  
//   userStates[sender] = { 
//     step: 'select_region', 
//     data: { 
//       patientId: patient.patient_id,
//       firstName: user.name.split(' ')[0],
//       lastName: user.name.split(' ').slice(1).join(' ')
//     } 
//   };
//   await sendRegionSelection(sender);
// }
// async function handleNameInput(sender, fullName, state) {
//   const names = fullName.trim().split(/\s+/);
  
//   if (names.length < 2) {
//     await client.messages.create({
//       body: "❌ Please enter both your FIRST and LAST name:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const firstName = names[0];
//   const lastName = names.slice(1).join(' ');

//   const newPatient = {
//     patient_id: patients.length + 1,
//     first_name: firstName,
//     last_name: lastName,
//     phone: sender.replace('whatsapp:', '')
//   };
//   patients.push(newPatient);

//   userStates[sender] = { 
//     step: 'select_region', 
//     data: { 
//       patientId: newPatient.patient_id,
//       firstName: firstName,
//       lastName: lastName
//     } 
//   };

//   await client.messages.create({
//     body: `Thank you, ${firstName} ${lastName}! Now let's book your appointment...`,
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });

//   await sendRegionSelection(sender);
// }

// async function sendRegionSelection(sender) {
//   const regionList = regions.map(r => `• ${r.name}`).join('\n');
  
//   await client.messages.create({
//     body: "📍 Please select your region:\n\n" +
//           regionList + "\n\n" +
//           "Reply with the region name (e.g. 'Downtown')",
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });
// }

// async function handleRegionSelection(sender, regionName, state) {
//   const region = regions.find(r => 
//     r.name.toLowerCase() === regionName.toLowerCase()
//   );

//   if (region) {
//     const clinics = getClinicsInRegion(region.region_id);
//     const clinicList = clinics.map(c => `• ${c.name}`).join('\n');
    
//     await client.messages.create({
//       body: `🏥 Clinics in ${region.name}:\n\n` +
//             clinicList + "\n\n" +
//             "Reply with the clinic name you prefer",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { 
//       step: 'select_clinic', 
//       data: { ...state.data, regionId: region.region_id } 
//     };
//   } else {
//     await client.messages.create({
//       body: "❌ Invalid region. Please try again:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function handleClinicSelection(sender, clinicName, state) {
//   const clinics = getClinicsInRegion(state.data.regionId);
//   const clinic = clinics.find(c => 
//     c.name.toLowerCase().includes(clinicName.toLowerCase())
//   );

//   if (clinic) {
//     const specializations = getSpecializationsInRegion(state.data.regionId);
//     const specList = specializations.map(s => `• ${s}`).join('\n');
    
//     await client.messages.create({
//       body: `🩺 Available specializations at ${clinic.name}:\n\n` +
//             specList + "\n\n" +
//             "Reply with the specialization you need",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { 
//       ...state, 
//       step: 'select_specialization',
//       data: { ...state.data, workplaceId: clinic.workplace_id }
//     };
//   } else {
//     await client.messages.create({
//       body: "❌ Clinic not found. Please try again:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function handleSpecializationSelection(sender, specialization, state) {
//   const specs = getSpecializationsInRegion(state.data.regionId);
//   const matchedSpec = specs.find(s => 
//     s.toLowerCase().includes(specialization.toLowerCase())
//   );

//   if (matchedSpec) {
//     const doctors = getDoctorsBySpecialization(matchedSpec, state.data.regionId);
//     const doctorList = doctors.map(d => `• Dr. ${d.name}`).join('\n');
    
//     await client.messages.create({
//       body: `👨‍⚕️ Available ${matchedSpec} doctors:\n\n` +
//             doctorList + "\n\n" +
//             "Reply with the doctor's name",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { 
//       ...state, 
//       step: 'select_doctor',
//       data: { ...state.data, specialization: matchedSpec }
//     };
//   } else {
//     await client.messages.create({
//       body: "❌ Specialization not available. Please try again:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function handleDoctorSelection(sender, doctorName, state) {
//   const doctorsList = getDoctorsBySpecialization(
//     state.data.specialization, 
//     state.data.regionId
//   );
  
//   const doctor = doctorsList.find(d => 
//     d.name.toLowerCase().includes(doctorName.toLowerCase().replace('dr.', '').trim())
//   );

//   if (doctor) {
//     await client.messages.create({
//       body: "📅 Please enter your preferred date (DD/MM format, e.g. 15/07):",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { 
//       ...state, 
//       step: 'select_date',
//       data: { ...state.data, doctorId: doctor.doctor_id }
//     };
//   } else {
//     await client.messages.create({
//       body: "❌ Doctor not found. Please try again:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function handleDateSelection(sender, dateInput, state) {
//   const [day, month] = dateInput.split('/').map(Number);
//   const date = new Date();
//   date.setMonth(month - 1);
//   date.setDate(day);
//   date.setHours(0, 0, 0, 0);

//   if (isNaN(date.getTime())) {
//     await client.messages.create({
//       body: "❌ Invalid date format. Please use DD/MM (e.g. 15/07):",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const slots = getDoctorSlots(state.data.doctorId, date);
  
//   if (slots.length > 0) {
//     const slotList = slots.slice(0, 6).map(s => 
//       `• ${format(s.start_time, "HH:mm")}`
//     ).join('\n');
    
//     await client.messages.create({
//       body: `⏰ Available slots on ${format(date, "EEEE, dd/MM")}:\n\n` +
//             slotList + "\n\n" +
//             "Reply with your preferred time (e.g. 14:30)",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { 
//       ...state, 
//       step: 'select_slot',
//       data: { ...state.data, date: date, slots: slots }
//     };
//   } else {
//     await client.messages.create({
//       body: "❌ No available slots on this date. Please try another date:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function handleSlotSelection(sender, timeInput, state) {
//   const [hours, minutes] = timeInput.split(':').map(Number);
//   const selectedSlot = state.data.slots.find(slot => 
//     slot.start_time.getHours() === hours &&
//     slot.start_time.getMinutes() === (minutes || 0)
//   );

//   if (selectedSlot) {
//     const newAppointment = {
//       appointment_id: appointments.length + 1,
//       patient_id: state.data.patientId || 1,
//       doctor_workplace_id: state.data.workplaceId,
//       slot_id: selectedSlot.slot_id,
//       appointment_date: new Date(),
//       status: 'booked',
//       patient_name: `${state.data.firstName} ${state.data.lastName}`
//     };
    
//     appointments.push(newAppointment);
//     selectedSlot.is_available = false;
    
//     const doctor = doctors.find(d => d.doctor_id === state.data.doctorId);
//     const clinic = doctorWorkplaces.find(w => w.workplace_id === state.data.workplaceId);
    
//     await client.messages.create({
//       body: `✅ Appointment Booked for ${state.data.firstName} ${state.data.lastName}!\n\n` +
//             `Doctor: Dr. ${doctor.name}\n` +
//             `Specialization: ${doctor.specialization}\n` +
//             `Clinic: ${clinic.name}\n` +
//             `Date: ${format(selectedSlot.start_time, "EEEE, dd/MM/yyyy 'at' HH:mm")}\n\n` +
//             "You'll receive a reminder before your appointment.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
    
//     userStates[sender] = { step: null, data: {} };
//   } else {
//     await client.messages.create({
//       body: "❌ Invalid time slot. Please choose from the list:",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function showPatientAppointments(sender) {
//   const user = users.find(u => u.phone === sender);
//   if (!user) {
//     await promptRegistration(sender);
//     return;
//   }

//   const patient = patients.find(p => p.user_id === user.user_id);
//   if (!patient) {
//     await client.messages.create({
//       body: "❌ Patient record not found. Please register again.",
//       from: 'whatsapp:+14155238886',
//       to: `whatsapp:${sender}`
//     });
//     return;
//   }

//   const patientApps = getPatientAppointments(patient.patient_id);
  
//   if (patientApps.length === 0) {
//     await client.messages.create({
//       body: "You don't have any active appointments.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const appointmentList = patientApps.map(app => 
//     `• Dr. ${app.doctor_name} - ${format(app.slot_time, "EEE, dd/MM 'at' HH:mm")} (${app.clinic_name})`
//   ).join('\n');

//   await client.messages.create({
//     body: `📋 Your Appointments:\n\n${appointmentList}\n\n` +
//           "Reply:\n" +
//           "'DELETE APPOINTMENT' to cancel any",
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });
// }

// async function showAppointmentsForDeletion(sender) {
//   const patientPhone = sender.replace('whatsapp:', '');
//   const patient = patients.find(p => p.phone === patientPhone);
  
//   if (!patient) {
//     await client.messages.create({
//       body: "❌ You don't have any appointments to delete.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const patientApps = getPatientAppointments(patient.patient_id);

//   if (patientApps.length === 0) {
//     await client.messages.create({
//       body: "❌ You don't have any active appointments to delete.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const appointmentList = patientApps.map(app => 
//     `• [ID: ${app.appointment_id}] Dr. ${app.doctor_name} - ${format(app.slot_time, "EEE, dd/MM 'at' HH:mm")}`
//   ).join('\n');

//   await client.messages.create({
//     body: `📋 Your Appointments:\n\n${appointmentList}\n\n` +
//           "Reply with:\n" +
//           "- The ID to delete (e.g. '1')\n" +
//           "- 'ALL' to delete all\n" +
//           "- 'CANCEL' to abort",
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });

//   userStates[sender] = { 
//     step: 'delete_appointment', 
//     data: { patientId: patient.patient_id } 
//   };
// }

// async function handleAppointmentDeletion(sender, input, state) {
//   const patientPhone = sender.replace('whatsapp:', '');
//   const patient = patients.find(p => p.phone === patientPhone);
  
//   if (!patient) {
//     await client.messages.create({
//       body: "❌ Patient not found.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     userStates[sender] = { step: null, data: {} };
//     return;
//   }

//   if (input.toLowerCase() === 'cancel') {
//     await client.messages.create({
//       body: "Appointment deletion cancelled.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     userStates[sender] = { step: null, data: {} };
//     return;
//   }

//   const patientApps = getPatientAppointments(patient.patient_id);

//   if (input.toLowerCase() === 'all') {
//     // Delete all appointments
//     patientApps.forEach(app => {
//       app.status = 'cancelled';
//       const slot = appointmentSlots.find(s => s.slot_id === app.slot_id);
//       if (slot) slot.is_available = true;
//     });

//     await client.messages.create({
//       body: `✅ All ${patientApps.length} appointments have been cancelled.`,
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   } else {
//     // Delete specific appointment by ID
//     const appointmentId = parseInt(input);
//     const appointment = patientApps.find(a => a.appointment_id === appointmentId);

//     if (appointment) {
//       appointment.status = 'cancelled';
//       const slot = appointmentSlots.find(s => s.slot_id === appointment.slot_id);
//       if (slot) slot.is_available = true;

//       await client.messages.create({
//         body: `✅ Appointment with Dr. ${appointment.doctor_name} on ${format(appointment.slot_time, "EEE, dd/MM 'at' HH:mm")} has been cancelled.`,
//         from: 'whatsapp:+14155238886',
//         to: sender
//       });
//     } else {
//       await client.messages.create({
//         body: "❌ Invalid appointment ID. Please try again or type 'CANCEL' to abort.",
//         from: 'whatsapp:+14155238886',
//         to: sender
//       });
//       return;
//     }
//   }

//   userStates[sender] = { step: null, data: {} };
// }

// async function cancelAppointment(sender) {
//   const patientPhone = sender.replace('whatsapp:', '');
//   const patient = patients.find(p => p.phone === patientPhone);
  
//   if (!patient) {
//     await client.messages.create({
//       body: "❌ You don't have any appointments to cancel.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//     return;
//   }

//   const patientApps = getPatientAppointments(patient.patient_id);
  
//   if (patientApps.length === 0) {
//     await client.messages.create({
//       body: "You don't have any active appointments to cancel.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   } 
//   else if (patientApps.length === 1) {
//     // Quick cancel if only one appointment
//     const appointment = patientApps[0];
//     appointment.status = 'cancelled';
//     const slot = appointmentSlots.find(s => s.slot_id === appointment.slot_id);
//     if (slot) slot.is_available = true;

//     await client.messages.create({
//       body: `✅ Your appointment with Dr. ${appointment.doctor_name} on ${format(appointment.slot_time, "EEE, dd/MM 'at' HH:mm")} has been cancelled.`,
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
//   else {
//     await client.messages.create({
//       body: "You have multiple appointments. Please use 'DELETE APPOINTMENT' to select which one to cancel.",
//       from: 'whatsapp:+14155238886',
//       to: sender
//     });
//   }
// }

// async function sendInvalidCommand(sender) {
//   await client.messages.create({
//     body: "Sorry, I didn't understand that. Please reply with:\n" +
//           "'NEW APPOINTMENT' - Book appointment\n" +
//           "'MY APPOINTMENTS' - View appointments\n" +
//           "'DELETE APPOINTMENT' - Cancel appointments\n" +
//           "'CANCEL' - Quick cancel",
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });
// }

// async function sendErrorMessage(sender) {
//   await client.messages.create({
//     body: "⚠️ An error occurred. Please start over by sending 'HI'.",
//     from: 'whatsapp:+14155238886',
//     to: sender
//   });
// }

// // =============================================
// // SERVER STARTUP
// // =============================================

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log("Available regions:", regions.map(r => r.name).join(', '));
//   console.log("Total doctors:", doctors.length);
//   console.log("Total clinics:", doctorWorkplaces.length);
//   console.log("Initial patients:", patients.length);
//   console.log("Generated slots:", appointmentSlots.length);
// });

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use('/whatsapp', whatsappRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("WhatsApp bot is ready to receive messages");
});