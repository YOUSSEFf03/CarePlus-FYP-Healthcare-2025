require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const { format, addDays, parse, isWithinInterval } = require('date-fns');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Twilio Client
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// =============================================
// DATA STRUCTURES
// =============================================

// Regions
const regions = [
  { region_id: 1, name: "Downtown" },
  { region_id: 2, name: "Westside" },
  { region_id: 3, name: "East District" }
];

// Doctors
const doctors = [
  {
    doctor_id: 1,
    user_id: 1,
    name: "Dr. Smith",
    specialization: "Cardiology",
    license_number: "MD12345",
    verification_status: "verified",
    region_id: 1
  },
  {
    doctor_id: 2,
    user_id: 2,
    name: "Dr. Johnson",
    specialization: "Pediatrics",
    license_number: "MD67890",
    verification_status: "verified",
    region_id: 1
  },
  {
    doctor_id: 3,
    user_id: 3,
    name: "Dr. Lee",
    specialization: "Orthopedics",
    license_number: "MD54321",
    verification_status: "verified",
    region_id: 2
  }
];

// Clinics
const doctorWorkplaces = [
  {
    workplace_id: 1,
    doctor_id: 1,
    name: "City Heart Center",
    type: "clinic",
    region_id: 1,
    phone: "+1234567890"
  },
  {
    workplace_id: 2,
    doctor_id: 2,
    name: "Pediatric Care Clinic",
    type: "clinic",
    region_id: 1,
    phone: "+1234567891"
  },
  {
    workplace_id: 3,
    doctor_id: 3,
    name: "Westside Orthopedics",
    type: "hospital",
    region_id: 2,
    phone: "+1234567892"
  }
];

// Patients storage
let patients = [];

// Generate appointment slots
const generateSlots = () => {
  const slots = [];
  const now = new Date();
  
  doctors.forEach(doctor => {
    for (let day = 1; day <= 14; day++) {
      const slotDate = addDays(now, day);
      if (slotDate.getDay() === 0) continue; // Skip Sunday
      
      for (let hour = 9; hour < 17; hour++) {
        // :00 slot
        slots.push({
          slot_id: slots.length + 1,
          doctor_id: doctor.doctor_id,
          workplace_id: doctorWorkplaces.find(w => w.doctor_id === doctor.doctor_id)?.workplace_id,
          date: new Date(slotDate.setHours(0, 0, 0, 0)),
          start_time: new Date(slotDate.setHours(hour, 0, 0, 0)),
          end_time: new Date(slotDate.setHours(hour, 30, 0, 0)),
          is_available: true
        });
        
        // :30 slot
        slots.push({
          slot_id: slots.length + 1,
          doctor_id: doctor.doctor_id,
          workplace_id: doctorWorkplaces.find(w => w.doctor_id === doctor.doctor_id)?.workplace_id,
          date: new Date(slotDate.setHours(0, 0, 0, 0)),
          start_time: new Date(slotDate.setHours(hour, 30, 0, 0)),
          end_time: new Date(slotDate.setHours(hour + 1, 0, 0, 0)),
          is_available: true
        });
      }
    }
  });
  return slots;
};

let appointmentSlots = generateSlots();
let appointments = [];
let userStates = {};

// =============================================
// BUSINESS LOGIC FUNCTIONS
// =============================================

const getClinicsInRegion = (regionId) => {
  return doctorWorkplaces.filter(clinic => clinic.region_id === regionId);
};

const getSpecializationsInRegion = (regionId) => {
  const doctorsInRegion = doctors.filter(doctor => doctor.region_id === regionId);
  return [...new Set(doctorsInRegion.map(d => d.specialization))];
};

const getDoctorsBySpecialization = (specialization, regionId) => {
  return doctors.filter(doctor => 
    doctor.specialization === specialization && 
    doctor.region_id === regionId
  );
};

const getDoctorSlots = (doctorId, date) => {
  return appointmentSlots.filter(slot => (
    slot.doctor_id === doctorId &&
    slot.date.getTime() === date.getTime() &&
    slot.is_available
  ));
};

const getPatientAppointments = (patientId) => {
  return appointments.filter(a => 
    a.patient_id === patientId && 
    a.status === 'booked'
  ).map(app => {
    const slot = appointmentSlots.find(s => s.slot_id === app.slot_id);
    const doctor = doctors.find(d => d.doctor_id === slot?.doctor_id);
    const clinic = doctorWorkplaces.find(w => w.workplace_id === slot?.workplace_id);
    
    return {
      ...app,
      doctor_name: doctor?.name || "Unknown",
      clinic_name: clinic?.name || "Unknown",
      slot_time: slot?.start_time || new Date()
    };
  });
};

// =============================================
// MESSAGE HANDLER
// =============================================

app.post('/whatsapp', async (req, res) => {
  const incomingMsg = req.body.Body.trim();
  const sender = req.body.From;
  const currentState = userStates[sender] || { step: null, data: {} };

  try {
    if (/^(hi|hello|start)$/i.test(incomingMsg)) {
      await sendWelcomeMessage(sender);
      userStates[sender] = { step: null, data: {} };
    }
    else if (/^new appointment$|^book appointment$/i.test(incomingMsg)) {
      await startAppointmentFlow(sender);
    }
    else if (/^my appointments$|^view appointments$/i.test(incomingMsg)) {
      await showPatientAppointments(sender);
    }
    else if (/^delete appointment$/i.test(incomingMsg)) {
      await showAppointmentsForDeletion(sender);
    }
    else if (currentState.step === 'get_name') {
      await handleNameInput(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_region') {
      await handleRegionSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_clinic') {
      await handleClinicSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_specialization') {
      await handleSpecializationSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_doctor') {
      await handleDoctorSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_date') {
      await handleDateSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'select_slot') {
      await handleSlotSelection(sender, incomingMsg, currentState);
    }
    else if (currentState.step === 'delete_appointment') {
      await handleAppointmentDeletion(sender, incomingMsg, currentState);
    }
    else if (/^cancel$/i.test(incomingMsg)) {
      await cancelAppointment(sender);
      userStates[sender] = { step: null, data: {} };
    }
    else {
      await sendInvalidCommand(sender);
    }
  } catch (error) {
    console.error("Error:", error);
    await sendErrorMessage(sender);
    userStates[sender] = { step: null, data: {} };
  }

  res.status(200).send();
});

// =============================================
// CONVERSATION FLOW HANDLERS
// =============================================

async function sendWelcomeMessage(sender) {
  await client.messages.create({
    body: "👋 Welcome to *MediBook Appointment System*!\n\n" +
          "You can:\n" +
          "1. *NEW APPOINTMENT* - Book new appointment\n" +
          "2. *MY APPOINTMENTS* - View your appointments\n" +
          "3. *DELETE APPOINTMENT* - Cancel appointments\n" +
          "4. *CANCEL* - Quick cancel if you have one appointment",
    from: 'whatsapp:+14155238886',
    to: sender
  });
}

async function startAppointmentFlow(sender) {
  const existingPatient = patients.find(p => p.phone === sender.replace('whatsapp:', ''));
  
  if (existingPatient) {
    userStates[sender] = { 
      step: 'select_region', 
      data: { 
        patientId: existingPatient.patient_id,
        firstName: existingPatient.first_name,
        lastName: existingPatient.last_name
      } 
    };
    await sendRegionSelection(sender);
  } else {
    await client.messages.create({
      body: "To book an appointment, please enter your FULL NAME (First and Last name):",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    userStates[sender] = { step: 'get_name', data: {} };
  }
}

async function handleNameInput(sender, fullName, state) {
  const names = fullName.trim().split(/\s+/);
  
  if (names.length < 2) {
    await client.messages.create({
      body: "❌ Please enter both your FIRST and LAST name:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const firstName = names[0];
  const lastName = names.slice(1).join(' ');

  const newPatient = {
    patient_id: patients.length + 1,
    first_name: firstName,
    last_name: lastName,
    phone: sender.replace('whatsapp:', '')
  };
  patients.push(newPatient);

  userStates[sender] = { 
    step: 'select_region', 
    data: { 
      patientId: newPatient.patient_id,
      firstName: firstName,
      lastName: lastName
    } 
  };

  await client.messages.create({
    body: `Thank you, ${firstName} ${lastName}! Now let's book your appointment...`,
    from: 'whatsapp:+14155238886',
    to: sender
  });

  await sendRegionSelection(sender);
}

async function sendRegionSelection(sender) {
  const regionList = regions.map(r => `• ${r.name}`).join('\n');
  
  await client.messages.create({
    body: "📍 Please select your region:\n\n" +
          regionList + "\n\n" +
          "Reply with the region name (e.g. 'Downtown')",
    from: 'whatsapp:+14155238886',
    to: sender
  });
}

async function handleRegionSelection(sender, regionName, state) {
  const region = regions.find(r => 
    r.name.toLowerCase() === regionName.toLowerCase()
  );

  if (region) {
    const clinics = getClinicsInRegion(region.region_id);
    const clinicList = clinics.map(c => `• ${c.name}`).join('\n');
    
    await client.messages.create({
      body: `🏥 Clinics in ${region.name}:\n\n` +
            clinicList + "\n\n" +
            "Reply with the clinic name you prefer",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { 
      step: 'select_clinic', 
      data: { ...state.data, regionId: region.region_id } 
    };
  } else {
    await client.messages.create({
      body: "❌ Invalid region. Please try again:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function handleClinicSelection(sender, clinicName, state) {
  const clinics = getClinicsInRegion(state.data.regionId);
  const clinic = clinics.find(c => 
    c.name.toLowerCase().includes(clinicName.toLowerCase())
  );

  if (clinic) {
    const specializations = getSpecializationsInRegion(state.data.regionId);
    const specList = specializations.map(s => `• ${s}`).join('\n');
    
    await client.messages.create({
      body: `🩺 Available specializations at ${clinic.name}:\n\n` +
            specList + "\n\n" +
            "Reply with the specialization you need",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { 
      ...state, 
      step: 'select_specialization',
      data: { ...state.data, workplaceId: clinic.workplace_id }
    };
  } else {
    await client.messages.create({
      body: "❌ Clinic not found. Please try again:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function handleSpecializationSelection(sender, specialization, state) {
  const specs = getSpecializationsInRegion(state.data.regionId);
  const matchedSpec = specs.find(s => 
    s.toLowerCase().includes(specialization.toLowerCase())
  );

  if (matchedSpec) {
    const doctors = getDoctorsBySpecialization(matchedSpec, state.data.regionId);
    const doctorList = doctors.map(d => `• Dr. ${d.name}`).join('\n');
    
    await client.messages.create({
      body: `👨‍⚕️ Available ${matchedSpec} doctors:\n\n` +
            doctorList + "\n\n" +
            "Reply with the doctor's name",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { 
      ...state, 
      step: 'select_doctor',
      data: { ...state.data, specialization: matchedSpec }
    };
  } else {
    await client.messages.create({
      body: "❌ Specialization not available. Please try again:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function handleDoctorSelection(sender, doctorName, state) {
  const doctorsList = getDoctorsBySpecialization(
    state.data.specialization, 
    state.data.regionId
  );
  
  const doctor = doctorsList.find(d => 
    d.name.toLowerCase().includes(doctorName.toLowerCase().replace('dr.', '').trim())
  );

  if (doctor) {
    await client.messages.create({
      body: "📅 Please enter your preferred date (DD/MM format, e.g. 15/07):",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { 
      ...state, 
      step: 'select_date',
      data: { ...state.data, doctorId: doctor.doctor_id }
    };
  } else {
    await client.messages.create({
      body: "❌ Doctor not found. Please try again:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function handleDateSelection(sender, dateInput, state) {
  const [day, month] = dateInput.split('/').map(Number);
  const date = new Date();
  date.setMonth(month - 1);
  date.setDate(day);
  date.setHours(0, 0, 0, 0);

  if (isNaN(date.getTime())) {
    await client.messages.create({
      body: "❌ Invalid date format. Please use DD/MM (e.g. 15/07):",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const slots = getDoctorSlots(state.data.doctorId, date);
  
  if (slots.length > 0) {
    const slotList = slots.slice(0, 6).map(s => 
      `• ${format(s.start_time, "HH:mm")}`
    ).join('\n');
    
    await client.messages.create({
      body: `⏰ Available slots on ${format(date, "EEEE, dd/MM")}:\n\n` +
            slotList + "\n\n" +
            "Reply with your preferred time (e.g. 14:30)",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { 
      ...state, 
      step: 'select_slot',
      data: { ...state.data, date: date, slots: slots }
    };
  } else {
    await client.messages.create({
      body: "❌ No available slots on this date. Please try another date:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function handleSlotSelection(sender, timeInput, state) {
  const [hours, minutes] = timeInput.split(':').map(Number);
  const selectedSlot = state.data.slots.find(slot => 
    slot.start_time.getHours() === hours &&
    slot.start_time.getMinutes() === (minutes || 0)
  );

  if (selectedSlot) {
    const newAppointment = {
      appointment_id: appointments.length + 1,
      patient_id: state.data.patientId || 1,
      doctor_workplace_id: state.data.workplaceId,
      slot_id: selectedSlot.slot_id,
      appointment_date: new Date(),
      status: 'booked',
      patient_name: `${state.data.firstName} ${state.data.lastName}`
    };
    
    appointments.push(newAppointment);
    selectedSlot.is_available = false;
    
    const doctor = doctors.find(d => d.doctor_id === state.data.doctorId);
    const clinic = doctorWorkplaces.find(w => w.workplace_id === state.data.workplaceId);
    
    await client.messages.create({
      body: `✅ Appointment Booked for ${state.data.firstName} ${state.data.lastName}!\n\n` +
            `Doctor: Dr. ${doctor.name}\n` +
            `Specialization: ${doctor.specialization}\n` +
            `Clinic: ${clinic.name}\n` +
            `Date: ${format(selectedSlot.start_time, "EEEE, dd/MM/yyyy 'at' HH:mm")}\n\n` +
            "You'll receive a reminder before your appointment.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    
    userStates[sender] = { step: null, data: {} };
  } else {
    await client.messages.create({
      body: "❌ Invalid time slot. Please choose from the list:",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function showPatientAppointments(sender) {
  const patientPhone = sender.replace('whatsapp:', '');
  const patient = patients.find(p => p.phone === patientPhone);
  
  if (!patient) {
    await client.messages.create({
      body: "❌ You don't have any appointments yet.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const patientApps = getPatientAppointments(patient.patient_id);
  
  if (patientApps.length === 0) {
    await client.messages.create({
      body: "You don't have any active appointments.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const appointmentList = patientApps.map(app => 
    `• Dr. ${app.doctor_name} - ${format(app.slot_time, "EEE, dd/MM 'at' HH:mm")} (${app.clinic_name})`
  ).join('\n');

  await client.messages.create({
    body: `📋 Your Appointments:\n\n${appointmentList}\n\n` +
          "Reply:\n" +
          "'DELETE APPOINTMENT' to cancel any",
    from: 'whatsapp:+14155238886',
    to: sender
  });
}

async function showAppointmentsForDeletion(sender) {
  const patientPhone = sender.replace('whatsapp:', '');
  const patient = patients.find(p => p.phone === patientPhone);
  
  if (!patient) {
    await client.messages.create({
      body: "❌ You don't have any appointments to delete.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const patientApps = getPatientAppointments(patient.patient_id);

  if (patientApps.length === 0) {
    await client.messages.create({
      body: "❌ You don't have any active appointments to delete.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const appointmentList = patientApps.map(app => 
    `• [ID: ${app.appointment_id}] Dr. ${app.doctor_name} - ${format(app.slot_time, "EEE, dd/MM 'at' HH:mm")}`
  ).join('\n');

  await client.messages.create({
    body: `📋 Your Appointments:\n\n${appointmentList}\n\n` +
          "Reply with:\n" +
          "- The ID to delete (e.g. '1')\n" +
          "- 'ALL' to delete all\n" +
          "- 'CANCEL' to abort",
    from: 'whatsapp:+14155238886',
    to: sender
  });

  userStates[sender] = { 
    step: 'delete_appointment', 
    data: { patientId: patient.patient_id } 
  };
}

async function handleAppointmentDeletion(sender, input, state) {
  const patientPhone = sender.replace('whatsapp:', '');
  const patient = patients.find(p => p.phone === patientPhone);
  
  if (!patient) {
    await client.messages.create({
      body: "❌ Patient not found.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    userStates[sender] = { step: null, data: {} };
    return;
  }

  if (input.toLowerCase() === 'cancel') {
    await client.messages.create({
      body: "Appointment deletion cancelled.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    userStates[sender] = { step: null, data: {} };
    return;
  }

  const patientApps = getPatientAppointments(patient.patient_id);

  if (input.toLowerCase() === 'all') {
    // Delete all appointments
    patientApps.forEach(app => {
      app.status = 'cancelled';
      const slot = appointmentSlots.find(s => s.slot_id === app.slot_id);
      if (slot) slot.is_available = true;
    });

    await client.messages.create({
      body: `✅ All ${patientApps.length} appointments have been cancelled.`,
      from: 'whatsapp:+14155238886',
      to: sender
    });
  } else {
    // Delete specific appointment by ID
    const appointmentId = parseInt(input);
    const appointment = patientApps.find(a => a.appointment_id === appointmentId);

    if (appointment) {
      appointment.status = 'cancelled';
      const slot = appointmentSlots.find(s => s.slot_id === appointment.slot_id);
      if (slot) slot.is_available = true;

      await client.messages.create({
        body: `✅ Appointment with Dr. ${appointment.doctor_name} on ${format(appointment.slot_time, "EEE, dd/MM 'at' HH:mm")} has been cancelled.`,
        from: 'whatsapp:+14155238886',
        to: sender
      });
    } else {
      await client.messages.create({
        body: "❌ Invalid appointment ID. Please try again or type 'CANCEL' to abort.",
        from: 'whatsapp:+14155238886',
        to: sender
      });
      return;
    }
  }

  userStates[sender] = { step: null, data: {} };
}

async function cancelAppointment(sender) {
  const patientPhone = sender.replace('whatsapp:', '');
  const patient = patients.find(p => p.phone === patientPhone);
  
  if (!patient) {
    await client.messages.create({
      body: "❌ You don't have any appointments to cancel.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
    return;
  }

  const patientApps = getPatientAppointments(patient.patient_id);
  
  if (patientApps.length === 0) {
    await client.messages.create({
      body: "You don't have any active appointments to cancel.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  } 
  else if (patientApps.length === 1) {
    // Quick cancel if only one appointment
    const appointment = patientApps[0];
    appointment.status = 'cancelled';
    const slot = appointmentSlots.find(s => s.slot_id === appointment.slot_id);
    if (slot) slot.is_available = true;

    await client.messages.create({
      body: `✅ Your appointment with Dr. ${appointment.doctor_name} on ${format(appointment.slot_time, "EEE, dd/MM 'at' HH:mm")} has been cancelled.`,
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
  else {
    await client.messages.create({
      body: "You have multiple appointments. Please use 'DELETE APPOINTMENT' to select which one to cancel.",
      from: 'whatsapp:+14155238886',
      to: sender
    });
  }
}

async function sendInvalidCommand(sender) {
  await client.messages.create({
    body: "Sorry, I didn't understand that. Please reply with:\n" +
          "'NEW APPOINTMENT' - Book appointment\n" +
          "'MY APPOINTMENTS' - View appointments\n" +
          "'DELETE APPOINTMENT' - Cancel appointments\n" +
          "'CANCEL' - Quick cancel",
    from: 'whatsapp:+14155238886',
    to: sender
  });
}

async function sendErrorMessage(sender) {
  await client.messages.create({
    body: "⚠️ An error occurred. Please start over by sending 'HI'.",
    from: 'whatsapp:+14155238886',
    to: sender
  });
}

// =============================================
// SERVER STARTUP
// =============================================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available regions:", regions.map(r => r.name).join(', '));
  console.log("Total doctors:", doctors.length);
  console.log("Total clinics:", doctorWorkplaces.length);
  console.log("Initial patients:", patients.length);
  console.log("Generated slots:", appointmentSlots.length);
});