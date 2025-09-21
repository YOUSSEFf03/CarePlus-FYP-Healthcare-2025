const DatabaseService = require('../services/databaseService');
const TwilioService = require('../services/twilioService');
const { formatDate, formatDateInLebanonTime, convertFromLebanonTime, LEBANON_TIMEZONE } = require('../utils/dateHelper');
const { validateDate, validateTime } = require('../utils/validators');

class AppointmentController {
  static async startAppointmentFlow(sender) {
    const patient = await DatabaseService.getPatientByPhone(sender);
    if (!patient) {
      await TwilioService.sendMessage(sender, "❌ Patient record not found. Please register again.");
      return { step: null, data: {} };
    }

    // Show existing appointments to user (if any)
    const appointments = await DatabaseService.getPatientAppointments(patient.id);
    const activeAppointments = appointments.filter(app => app.status === 'CONFIRMED');
    
    if (activeAppointments.length > 0) {
      const appointmentList = activeAppointments.map(app => {
        const appointmentDate = new Date(app.appointment_date);
        const [hours, minutes] = app.appointment_time.split(':').map(Number);
        appointmentDate.setHours(hours, minutes, 0, 0);
        const lebanonTime = formatDateInLebanonTime(appointmentDate, "EEE MMM dd yyyy HH:mm");
        return `• Dr. ${app.specialization} - ${lebanonTime} (Lebanon Time)`;
      }).join('\n');
      
      await TwilioService.sendMessage(sender,
        `📋 You currently have ${activeAppointments.length} active appointment(s):\n\n` +
        appointmentList + "\n\n" +
        "You can book additional appointments, but not at the same time as existing ones."
      );
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
      
      // Get the actual workplace ID for this doctor
      const workplaceId = await DatabaseService.getWorkplaceIdByDoctorId(state.data.doctorId);
      
      await TwilioService.sendMessage(sender,
        "📅 Please enter your preferred date (DD/MM format, e.g. 15/07):"
      );
      
      return {
        ...state,
        step: 'appointment_select_date',
        data: { ...state.data, workplaceId: workplaceId }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Clinic not found. Please try again:");
      return state;
    }
  }

  static async handleDateSelection(sender, dateInput, state) {
    console.log('Date input received:', dateInput);
    
    if (!validateDate(dateInput + '/' + new Date().getFullYear())) {
      await TwilioService.sendMessage(sender,
        "❌ Invalid date format. Please use DD/MM (e.g. 15/07):"
      );
      return state;
    }

    const [day, month] = dateInput.split('/').map(Number);
    
    // Smart year handling: if the date is in the past, assume next year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    let year = currentYear;
    
    const testDate = new Date(currentYear, month - 1, day);
    if (testDate < currentDate) {
      year = currentYear + 1;
      console.log('Date is in the past, using next year:', year);
    }
    
    // Create the date correctly using UTC to avoid timezone issues
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));

    console.log('Parsed date:', date.toISOString());
    console.log('Date day:', date.getUTCDate(), 'Month:', date.getUTCMonth() + 1, 'Year:', date.getUTCFullYear());
    console.log('Doctor ID:', state.data.doctorId);

    // Get all slots for the doctor on that date (excluding already booked times)
    let slots = await DatabaseService.getAvailableSlotsExcludingBooked(state.data.doctorId, date, state.data.patientId);
    console.log('Initial slots found (excluding booked):', slots.length);

    // If no slots exist, generate them
    if (slots.length === 0) {
      console.log('No slots found, generating new slots...');
      const SlotQueries = require('../database/queries/slots');
      await SlotQueries.generateSlots(state.data.doctorId, state.data.workplaceId, date, 1);
      
      // Try to get slots again (excluding booked times)
      slots = await DatabaseService.getAvailableSlotsExcludingBooked(state.data.doctorId, date, state.data.patientId);
      console.log('Slots after generation (excluding booked):', slots.length);
    }

    // Validation: Check if doctor already has an appointment on this date
    const appointmentsOnDate = state.data.appointments
      ? state.data.appointments.filter(app =>
          app.doctor_id === state.data.doctorId &&
          new Date(app.start_time).toDateString() === date.toDateString() &&
          app.status === 'CONFIRMED'
        )
      : [];

    console.log('Appointments on date:', appointmentsOnDate.length);

    // If all slots are booked, or doctor has an appointment on this date, show error
    if (slots.length === 0 || appointmentsOnDate.length > 0) {
      await TwilioService.sendMessage(sender,
        "❌ This doctor is fully booked or already has an appointment on this date. Please try another date:"
      );
      return state;
    }

    const slotList = slots.slice(0, 6).map(s => {
      // Handle both full datetime strings and time-only strings
      let timeStr = 'Unknown';
      if (s.start_time) {
        if (s.start_time.includes('T') || s.start_time.includes(' ')) {
          // Full datetime string - extract time
          timeStr = s.start_time.substring(11, 16);
        } else {
          // Time-only string - use as is
          timeStr = s.start_time.substring(0, 5);
        }
      }
      return `• ${timeStr}`;
    }).join('\n');

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
        // Construct proper appointment date in Lebanese timezone
        const slotDate = selectedSlot.slot_date instanceof Date 
          ? selectedSlot.slot_date 
          : new Date(selectedSlot.slot_date);
        
        const [hours, minutes] = selectedSlot.start_time.split(':').map(Number);
        
        // Create appointment datetime in Lebanese timezone
        const lebanonDateTime = new Date(slotDate);
        lebanonDateTime.setHours(hours, minutes, 0, 0);
        
        // Store the appointment date as-is (no timezone conversion needed)
        // The database will store it correctly
        const appointmentDateTime = lebanonDateTime;
        
        // Check for time conflicts with existing appointments
        const existingAppointments = await DatabaseService.getPatientAppointments(state.data.patientId);
        const activeAppointments = existingAppointments.filter(app => app.status === 'CONFIRMED');
        
        const hasTimeConflict = activeAppointments.some(existingApp => {
          const existingDate = new Date(existingApp.appointment_date);
          const [existingHours, existingMinutes] = existingApp.appointment_time.split(':').map(Number);
          existingDate.setHours(existingHours, existingMinutes, 0, 0);
          
          // Check if same date and time
          return existingDate.getTime() === appointmentDateTime.getTime();
        });
        
        if (hasTimeConflict) {
          await TwilioService.sendMessage(sender,
            `❌ You already have an appointment at this time (${formatDateInLebanonTime(appointmentDateTime, "EEEE, dd/MM HH:mm")}). Please choose a different time.`
          );
          return state;
        }
        
        const appointment = await DatabaseService.createAppointment({
          patientId: state.data.patientId,
          doctorId: state.data.doctorId,
          appointment_date: appointmentDateTime,
          appointment_time: selectedSlot.start_time.substring(0, 5),
          notes: `Booked via WhatsApp by ${state.data.firstName} ${state.data.lastName}`
        });

        // In a real implementation, you would mark the slot as unavailable
        // await DatabaseService.reserveSlot(selectedSlot.slot_id);

        const doctor = await DatabaseService.getDoctorById(state.data.doctorId);
        // In a real implementation, you would get clinic details from the database
        
        // Get updated appointment count
        const updatedAppointments = await DatabaseService.getPatientAppointments(state.data.patientId);
        const totalActiveAppointments = updatedAppointments.filter(app => app.status === 'CONFIRMED').length;
        
        await TwilioService.sendMessage(sender,
          `✅ Appointment Booked for ${state.data.firstName} ${state.data.lastName}!\n\n` +
          `Doctor: Dr. ${doctor.name}\n` +
          `Specialization: ${doctor.specialization}\n` +
          `Date: ${formatDateInLebanonTime(appointmentDateTime, "EEEE, dd/MM HH:mm")} (Lebanon Time)\n\n` +
          `📋 You now have ${totalActiveAppointments} active appointment(s).\n\n` +
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

    const appointmentList = appointments.map(app => {
      // Combine appointment_date and appointment_time to create a proper datetime
      const appointmentDate = new Date(app.appointment_date);
      const [hours, minutes] = app.appointment_time.split(':').map(Number);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const lebanonTime = formatDateInLebanonTime(appointmentDate, "EEE MMM dd yyyy HH:mm");
      return `• Dr. ${app.specialization} - ${lebanonTime} (Lebanon Time) (${app.workplace_name})`;
    }).join('\n');

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
  const appointmentList = appointments.map((app, idx) => {
    // Combine appointment_date and appointment_time to create a proper datetime
    const appointmentDate = new Date(app.appointment_date);
    const [hours, minutes] = app.appointment_time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    
    const lebanonTime = formatDateInLebanonTime(appointmentDate, "EEE MMM dd yyyy HH:mm");
    return `${idx + 1}. Dr. ${app.specialization} - ${lebanonTime} (Lebanon Time)`;
  }).join('\n');

  await TwilioService.sendMessage(sender,
    `📋 Your Appointments:\n\n${appointmentList}\n\n` +
    "Reply with the appointment number to delete (e.g. '1', '2'), or 'CANCEL' to abort"
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

  // Parse input as appointment index number (1, 2, 3, etc.)
  const appointmentIndex = parseInt(input.replace(/\D/g, ''), 10);
  
  if (isNaN(appointmentIndex) || appointmentIndex < 1) {
    await TwilioService.sendMessage(sender,
      "❌ Please enter a valid appointment number (e.g., '1', '2', '3'), or type 'CANCEL' to abort."
    );
    return state; // Return current state to stay in deletion flow
  }

  // Check if the entered index is within the range of available appointments
  if (appointmentIndex > state.data.appointments.length) {
    await TwilioService.sendMessage(sender,
      `❌ Appointment number ${appointmentIndex} not found. You have ${state.data.appointments.length} appointment(s). Please reply with a valid number from the list, or type 'CANCEL' to abort.`
    );
    return state; // Return current state to stay in deletion flow
  }

  // Get the appointment by index (convert from 1-based to 0-based index)
  const appointment = state.data.appointments[appointmentIndex - 1];

  try {
    await DatabaseService.cancelAppointment(appointment.id);
    // In a real implementation, you would mark the slot as available again
    // await DatabaseService.releaseSlot(appointment.slot_id);

    // Format the appointment date for display
    const appointmentDate = new Date(appointment.appointment_date);
    const [hours, minutes] = appointment.appointment_time.split(':').map(Number);
    appointmentDate.setHours(hours, minutes, 0, 0);
    const lebanonTime = formatDateInLebanonTime(appointmentDate, "EEE MMM dd yyyy HH:mm");

    await TwilioService.sendMessage(sender,
      `✅ Appointment with Dr. ${appointment.specialization} on ${lebanonTime} (Lebanon Time) has been cancelled.`
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
