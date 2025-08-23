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

    await this.sendRegionSelection(sender);
    
    return {
      step: 'appointment_select_region',
      data: {
        patientId: patient.patient_id,
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
      case 'appointment_select_clinic':
        return await this.handleClinicSelection(sender, input, state);
      case 'appointment_select_specialization':
        return await this.handleSpecializationSelection(sender, input, state);
      case 'appointment_select_doctor':
        return await this.handleDoctorSelection(sender, input, state);
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
    
    const region = regions.find(r => 
      r.name.toLowerCase() === regionName.toLowerCase()
    );

    if (region) {
      // In a real implementation, you would fetch clinics from the database
      const clinics = [
        { workplace_id: 1, name: "City Heart Center", type: "clinic", region_id: 1 },
        { workplace_id: 2, name: "Pediatric Care Clinic", type: "clinic", region_id: 1 },
        { workplace_id: 3, name: "Westside Orthopedics", type: "hospital", region_id: 2 }
      ];
      
      const regionClinics = clinics.filter(c => c.region_id === region.region_id);
      const clinicList = regionClinics.map(c => `• ${c.name}`).join('\n');
      
      await TwilioService.sendMessage(sender,
        `🏥 Clinics in ${region.name}:\n\n` +
        clinicList + "\n\n" +
        "Reply with the clinic name you prefer"
      );
      
      return {
        step: 'appointment_select_clinic',
        data: { ...state.data, regionId: region.region_id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Invalid region. Please try again:");
      return state;
    }
  }

  static async handleClinicSelection(sender, clinicName, state) {
    // In a real implementation, you would fetch clinics from the database
    const clinics = [
      { workplace_id: 1, name: "City Heart Center", type: "clinic", region_id: 1 },
      { workplace_id: 2, name: "Pediatric Care Clinic", type: "clinic", region_id: 1 },
      { workplace_id: 3, name: "Westside Orthopedics", type: "hospital", region_id: 2 }
    ];
    
    const regionClinics = clinics.filter(c => c.region_id === state.data.regionId);
    const clinic = regionClinics.find(c => 
      c.name.toLowerCase().includes(clinicName.toLowerCase())
    );

    if (clinic) {
      // In a real implementation, you would fetch specializations from the database
      const specializations = ["Cardiology", "Pediatrics", "Orthopedics"];
      const specList = specializations.map(s => `• ${s}`).join('\n');
      
      await TwilioService.sendMessage(sender,
        `🩺 Available specializations:\n\n` +
        specList + "\n\n" +
        "Reply with the specialization you need"
      );
      
      return {
        ...state,
        step: 'appointment_select_specialization',
        data: { ...state.data, workplaceId: clinic.workplace_id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Clinic not found. Please try again:");
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
      d.name.toLowerCase().includes(doctorName.toLowerCase().replace('dr.', '').trim())
    );

    if (doctor) {
      await TwilioService.sendMessage(sender,
        "📅 Please enter your preferred date (DD/MM format, e.g. 15/07):"
      );
      
      return {
        ...state,
        step: 'appointment_select_date',
        data: { ...state.data, doctorId: doctor.doctor_id }
      };
    } else {
      await TwilioService.sendMessage(sender, "❌ Doctor not found. Please try again:");
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

    const slots = await DatabaseService.getAvailableSlots(state.data.doctorId, date);
    
    if (slots.length > 0) {
      const slotList = slots.slice(0, 6).map(s => 
        `• ${formatDate(s.start_time, "HH:mm")}`
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
    } else {
      await TwilioService.sendMessage(sender,
        "❌ No available slots on this date. Please try another date:"
      );
      return state;
    }
  }

  static async handleSlotSelection(sender, timeInput, state) {
    if (!validateTime(timeInput)) {
      await TwilioService.sendMessage(sender,
        "❌ Invalid time format. Please use HH:MM (e.g. 14:30):"
      );
      return state;
    }

    const [hours, minutes] = timeInput.split(':').map(Number);
    const selectedSlot = state.data.slots.find(slot => 
      slot.start_time.getHours() === hours &&
      slot.start_time.getMinutes() === (minutes || 0)
    );

    if (selectedSlot) {
      try {
        const appointment = await DatabaseService.createAppointment({
          patient_id: state.data.patientId,
          doctor_workplace_id: state.data.workplaceId,
          slot_id: selectedSlot.slot_id,
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
          `Date: ${formatDate(selectedSlot.start_time, "EEEE, dd/MM/yyyy 'at' HH:mm")}\n\n` +
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

    const appointments = await DatabaseService.getPatientAppointments(patient.patient_id);
    
    if (appointments.length === 0) {
      await TwilioService.sendMessage(sender, "You don't have any active appointments.");
      return;
    }

    const appointmentList = appointments.map(app => 
      `• Dr. ${app.doctor_name} - ${formatDate(app.start_time, "EEE, dd/MM 'at' HH:mm")} (${app.workplace_name})`
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
      return;
    }

    const appointments = await DatabaseService.getPatientAppointments(patient.patient_id);

    if (appointments.length === 0) {
      await TwilioService.sendMessage(sender, "❌ You don't have any active appointments to delete.");
      return;
    }

    const appointmentList = appointments.map(app => 
      `• [ID: ${app.appointment_id}] Dr. ${app.doctor_name} - ${formatDate(app.start_time, "EEE, dd/MM 'at' HH:mm")}`
    ).join('\n');

    await TwilioService.sendMessage(sender,
      `📋 Your Appointments:\n\n${appointmentList}\n\n` +
      "Reply with:\n" +
      "- The ID to delete (e.g. '1')\n" +
      "- 'ALL' to delete all\n" +
      "- 'CANCEL' to abort"
    );

    return {
      step: 'delete_appointment',
      data: { patientId: patient.patient_id, appointments: appointments }
    };
  }

  static async handleAppointmentDeletion(sender, input, state) {
    if (input.toLowerCase() === 'cancel') {
      await TwilioService.sendMessage(sender, "Appointment deletion cancelled.");
      return;
    }

    if (input.toLowerCase() === 'all') {
      // Delete all appointments
      for (const app of state.data.appointments) {
        await DatabaseService.cancelAppointment(app.appointment_id);
        // In a real implementation, you would mark the slot as available again
        // await DatabaseService.releaseSlot(app.slot_id);
      }

      await TwilioService.sendMessage(sender,
        `✅ All ${state.data.appointments.length} appointments have been cancelled.`
      );
    } else {
      // Delete specific appointment by ID
      const appointmentId = parseInt(input);
      const appointment = state.data.appointments.find(a => a.appointment_id === appointmentId);

      if (appointment) {
        await DatabaseService.cancelAppointment(appointmentId);
        // In a real implementation, you would mark the slot as available again
        // await DatabaseService.releaseSlot(appointment.slot_id);

        await TwilioService.sendMessage(sender,
          `✅ Appointment with Dr. ${appointment.doctor_name} on ${formatDate(appointment.start_time, "EEE, dd/MM 'at' HH:mm")} has been cancelled.`
        );
      } else {
        await TwilioService.sendMessage(sender,
          "❌ Invalid appointment ID. Please try again or type 'CANCEL' to abort."
        );
      }
    }
  }
}

module.exports = AppointmentController;