const DatabaseService = require('../services/databaseService');
const TwilioService = require('../services/twilioService');
const { formatDate } = require('../utils/dateHelper');
const { validateDate, validateTime } = require('../utils/validators');

class AppointmentController {
  static async startAppointmentFlow(sender) {
    const patient = await DatabaseService.getPatientByPhone(sender);
    if (!patient) {
      await TwilioService.sendMessage(sender, "❌ Patient record not found. Please register again.");
      return { step: null, data: {} };
    }

    // Validation: Check if patient already has an active appointment
    const appointments = await DatabaseService.getPatientAppointments(patient.id);
    const activeAppointments = appointments.filter(app => app.status === 'booked');
    if (activeAppointments.length > 0) {
      await TwilioService.sendMessage(sender,
        "❌ You already have an active appointment. Please cancel your existing appointment before booking a new one."
      );
      return { step: null, data: {} };
    }

    await this.sendRegionSelection(sender);

    return {
      step: 'appointment_select_region',
      data: {
        patientId: patient.id,
        firstName: patient.name.split(' ')[0],
        lastName: patient.name.split(' ').slice(1).join(' ')
      }
    };
  }

  static async sendRegionSelection(sender) {
    // In a real implementation, you would fetch regions from the database
    const regions = [
      { region_id: 1, name: "Downtown" },
      { region_id: 2, name: "Westside" },
      { region_id: 3, name: "East District" }
    ];
    
    const regionList = regions.map(r => `• ${r.name}`).join('\n');
    
    await TwilioService.sendMessage(sender,
      "📍 Please select your region:\n\n" +
      regionList + "\n\n" +
      "Reply with the region name (e.g. 'Downtown')"
    );
  }

  static async handleAppointmentStep(sender, input, state) {
    switch (state.step) {
      case 'appointment_select_region':
        return await this.handleRegionSelection(sender, input, state);
      case 'appointment_select_specialization':
        return await this.handleSpecializationSelection(sender, input, state);
      case 'appointment_select_doctor':
        return await this.handleDoctorSelection(sender, input, state);
      case 'appointment_select_clinic':
        return await this.handleClinicSelection(sender, input, state);
      case 'appointment_select_date':
        return await this.handleDateSelection(sender, input, state);
      case 'appointment_select_slot':
        return await this.handleSlotSelection(sender, input, state);
      default:
        await TwilioService.sendMessage(sender, "Invalid step. Please start over with 'NEW APPOINTMENT'");
        return { step: null, data: {} };
    }
  }

  static async handleRegionSelection(sender, regionName, state) {
    // In a real implementation, you would fetch regions from the database
    const regions = [
      { region_id: 1, name: "Downtown" },
      { region_id: 2, name: "Westside" },
      { region_id: 3, name: "East District" }
    ];
    
    const region = regions.find(r => r.name.toLowerCase() === regionName.toLowerCase());

    if (region) {
      // Fetch specializations for the region
      const specializations = ["Cardiology", "Pediatrics", "Orthopedics"];
      const specList = specializations.map(s => `• ${s}`).join('\n');
      await TwilioService.sendMessage(sender,
        `🩺 Available specializations in ${region.name}:\n\n` +
        specList + "\n\n" +
        "Reply with the specialization you need"
      );
      
      return {
        step: 'appointment_select_specialization',
        data: { ...state.data, regionId: region.region_id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Invalid region. Please try again:");
      return state;
    }
  }

  static async handleSpecializationSelection(sender, specialization, state) {
    // In a real implementation, you would fetch specializations from the database
    const specializations = ["Cardiology", "Pediatrics", "Orthopedics"];
    const matchedSpec = specializations.find(s => 
      s.toLowerCase().includes(specialization.toLowerCase())
    );

    if (matchedSpec) {
      const doctors = await DatabaseService.getDoctorsBySpecialization(matchedSpec, state.data.regionId);
      const doctorList = doctors.map(d => `• Dr. ${d.name}`).join('\n');
      
      await TwilioService.sendMessage(sender,
        `👨‍⚕️ Available ${matchedSpec} doctors:\n\n` +
        doctorList + "\n\n" +
        "Reply with the doctor's name"
      );
      
      return {
        ...state,
        step: 'appointment_select_doctor',
        data: { ...state.data, specialization: matchedSpec }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Specialization not available. Please try again:");
      return state;
    }
  }

  static async handleDoctorSelection(sender, doctorName, state) {
    const doctors = await DatabaseService.getDoctorsBySpecialization(
      state.data.specialization,
      state.data.regionId
    );
    
    const doctor = doctors.find(d => 
      d.name && d.name.toLowerCase().includes(doctorName.toLowerCase().replace('dr.', '').trim())
    );

    if (doctor) {
      // Use the workplace data from the doctor query
      const clinicList = doctor.workplace_name ? `• ${doctor.workplace_name}` : '• No clinic available';
      await TwilioService.sendMessage(sender,
        `🏥 Clinics for Dr. ${doctor.name}:\n\n` +
        clinicList + "\n\n" +
        "Reply with the clinic name you prefer"
      );
      
      return {
        ...state,
        step: 'appointment_select_clinic',
        data: { ...state.data, doctorId: doctor.id, workplaceId: doctor.id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Doctor not found. Please try again:");
      return state;
    }
  }

  static async handleClinicSelection(sender, clinicName, state) {
    // Get the doctor's workplace information
    const doctor = await DatabaseService.getDoctorById(state.data.doctorId);
    
    if (doctor && doctor.workplace_name && 
        doctor.workplace_name.toLowerCase().includes(clinicName.toLowerCase())) {
      await TwilioService.sendMessage(sender,
        "📅 Please enter your preferred date (DD/MM format, e.g. 15/07):"
      );
      
      return {
        ...state,
        step: 'appointment_select_date',
        data: { ...state.data, workplaceId: doctor.id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Clinic not found. Please try again:");
      return state;
    }
  }

  static async handleDateSelection(sender, dateInput, state) {
    if (!validateDate(dateInput + '/' + new Date().getFullYear())) {
      await TwilioService.sendMessage(sender,
        "❌ Invalid date format. Please use DD/MM (e.g. 15/07):"
      );
      return state;
    }

    const [day, month] = dateInput.split('/').map(Number);
    const year = new Date().getFullYear();
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    // Get all slots for the doctor on that date
    const slots = await DatabaseService.getAvailableSlots(state.data.doctorId, date);

    // Validation: Check if doctor already has an appointment on this date
    const appointmentsOnDate = state.data.appointments
      ? state.data.appointments.filter(app =>
          app.doctor_id === state.data.doctorId &&
          new Date(app.start_time).toDateString() === date.toDateString() &&
          app.status === 'booked'
        )
      : [];

    // If all slots are booked, or doctor has an appointment on this date, show error
    if (slots.length === 0 || appointmentsOnDate.length > 0) {
      await TwilioService.sendMessage(sender,
        "❌ This doctor is fully booked or already has an appointment on this date. Please try another date:"
      );
      return state;
    }

    const slotList = slots.slice(0, 6).map(s =>
      `• ${s.start_time.substring(0, 5)}`
    ).join('\n');

    await TwilioService.sendMessage(sender,
      `⏰ Available slots on ${formatDate(date, "EEEE, dd/MM")}:\n\n` +
      slotList + "\n\n" +
      "Reply with your preferred time (e.g. 14:30)"
    );

    return {
      ...state,
      step: 'appointment_select_slot',
      data: { ...state.data, date: date, slots: slots }
    };
  }

  static async handleSlotSelection(sender, timeInput, state) {
    if (!validateTime(timeInput)) {
      await TwilioService.sendMessage(sender,
        "❌ Invalid time format. Please use HH:MM (e.g. 14:30):"
      );
      return state;
    }

    const [hours, minutes] = timeInput.split(':').map(Number);
    const selectedSlot = state.data.slots.find(slot => {
      const slotTime = slot.start_time.substring(0, 5); // Get "HH:mm" format
      const inputTime = `${hours.toString().padStart(2, '0')}:${(minutes || 0).toString().padStart(2, '0')}`;
      return slotTime === inputTime;
    });

    if (selectedSlot) {
      try {
        const appointment = await DatabaseService.createAppointment({
          patientId: state.data.patientId,
          doctorId: state.data.doctorId,
          appointment_date: new Date(`${selectedSlot.slot_date}T${selectedSlot.start_time}`),
          notes: `Booked via WhatsApp by ${state.data.firstName} ${state.data.lastName}`
        });

        // In a real implementation, you would mark the slot as unavailable
        // await DatabaseService.reserveSlot(selectedSlot.slot_id);

        const doctor = await DatabaseService.getDoctorById(state.data.doctorId);
        // In a real implementation, you would get clinic details from the database
        
        await TwilioService.sendMessage(sender,
          `✅ Appointment Booked for ${state.data.firstName} ${state.data.lastName}!\n\n` +
          `Doctor: Dr. ${doctor.name}\n` +
          `Specialization: ${doctor.specialization}\n` +
          `Date: ${formatDate(new Date(`${selectedSlot.slot_date}T${selectedSlot.start_time}`), "EEEE, dd/MM HH:mm")}\n\n` +
          "You'll receive a reminder before your appointment."
        );
        
        return { step: null, data: {} };
      } catch (error) {
        console.error('Error creating appointment:', error);
        await TwilioService.sendMessage(sender,
          "❌ An error occurred while booking your appointment. Please try again later."
        );
        return { step: null, data: {} };
      }
    } else {
      await TwilioService.sendMessage(sender,
        "❌ Invalid time slot. Please choose from the list:"
      );
      return state;
    }
  }

  static async showPatientAppointments(sender) {
    const patient = await DatabaseService.getPatientByPhone(sender);
    
    if (!patient) {
      await TwilioService.sendMessage(sender, "❌ Patient record not found. Please register again.");
      return;
    }

    const appointments = await DatabaseService.getPatientAppointments(patient.id);
    
    if (appointments.length === 0) {
      await TwilioService.sendMessage(sender, "You don't have any active appointments.");
      return;
    }

    const appointmentList = appointments.map(app => 
      `• Dr. ${app.specialization} - ${app.appointment_date} (${app.workplace_name})`
    ).join('\n');

    await TwilioService.sendMessage(sender,
      `📋 Your Appointments:\n\n${appointmentList}\n\n` +
      "Reply:\n" +
      "'DELETE APPOINTMENT' to cancel any"
    );
  }

static async showAppointmentsForDeletion(sender) {
  const patient = await DatabaseService.getPatientByPhone(sender);
  
  if (!patient) {
    await TwilioService.sendMessage(sender, "❌ You don't have any appointments to delete.");
    return { step: null, data: {} };
  }

  const appointments = await DatabaseService.getPatientAppointments(patient.id);

  if (appointments.length === 0) {
    await TwilioService.sendMessage(sender, "❌ You don't have any active appointments to delete.");
    return { step: null, data: {} };
  }

  // Show appointments with index numbers
  const appointmentList = appointments.map((app, idx) => 
    `${idx + 1}. [ID: ${app.id}] Dr. ${app.specialization} - ${app.appointment_date}`
  ).join('\n');

  await TwilioService.sendMessage(sender,
    `📋 Your Appointments:\n\n${appointmentList}\n\n` +
    "Reply with the appointment ID to delete (e.g. '4'), or 'CANCEL' to abort"
  );

  return {
    step: 'delete_appointment',
    data: { patientId: patient.id, appointments: appointments }
  };
}

static async handleAppointmentDeletion(sender, input, state) {
  if (input.toLowerCase() === 'cancel') {
    await TwilioService.sendMessage(sender, "Appointment deletion cancelled.");
    return { step: null, data: {} };
  }

  // Parse input as appointment ID (extract numbers from the input)
  const appointmentId = parseInt(input.replace(/\D/g, ''), 10);
  
  if (isNaN(appointmentId)) {
    await TwilioService.sendMessage(sender,
      "❌ Please enter a valid appointment ID number (e.g., '4', '6', '7'), or type 'CANCEL' to abort."
    );
    return state; // Return current state to stay in deletion flow
  }

  // Check if the entered ID exists in the user's appointments
  const appointment = state.data.appointments.find(app => 
    app.id === appointmentId
  );

  if (!appointment) {
    await TwilioService.sendMessage(sender,
      `❌ Appointment ID ${appointmentId} not found in your appointments. Please reply with a valid ID from the list, or type 'CANCEL' to abort.`
    );
    return state; // Return current state to stay in deletion flow
  }

  try {
    await DatabaseService.cancelAppointment(appointment.id);
    // In a real implementation, you would mark the slot as available again
    // await DatabaseService.releaseSlot(appointment.slot_id);

    await TwilioService.sendMessage(sender,
      `✅ Appointment with Dr. ${appointment.specialization} on ${appointment.appointment_date} has been cancelled.`
    );
    return { step: null, data: {} }; // Clear the state
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    await TwilioService.sendMessage(sender,
      "❌ An error occurred while cancelling your appointment. Please try again later."
    );
    return { step: null, data: {} }; // Clear the state on error
  }
}
}

module.exports = AppointmentController;
