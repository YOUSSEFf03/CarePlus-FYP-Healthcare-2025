const TwilioService = require('./twilioService');
const Appointment = require('../models/Appointment');
const { formatDate } = require('../utils/dateHelpers');

class ReminderService {
  static async sendAppointmentReminders() {
    try {
      // Get appointments for the next day
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      // In a real implementation, you would query appointments for tomorrow
      // const appointments = await Appointment.findByDateRange(tomorrow, dayAfterTomorrow);
      
      // For now, we'll use a mock implementation
      const appointments = []; // This would be populated from the database
      
      let sentCount = 0;
      
      for (const appointment of appointments) {
        if (appointment.status === 'booked') {
          const message = 
            `🔔 Appointment Reminder\n\n` +
            `You have an appointment tomorrow with Dr. ${appointment.doctor_name}\n` +
            `Time: ${formatDate(appointment.start_time, "HH:mm")}\n` +
            `Location: ${appointment.workplace_name}\n\n` +
            `Please arrive 10 minutes early.`;
          
          await TwilioService.sendMessage(appointment.patient_phone, message);
          sentCount++;
          
          // Add a small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      console.log(`Sent ${sentCount} appointment reminders`);
      return sentCount;
    } catch (error) {
      console.error('Error sending appointment reminders:', error);
      throw error;
    }
  }

  static async sendFollowUpMessages() {
    try {
      // Get completed appointments from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // In a real implementation, you would query completed appointments from yesterday
      // const appointments = await Appointment.findCompletedByDateRange(yesterday, today);
      
      // For now, we'll use a mock implementation
      const appointments = []; // This would be populated from the database
      
      let sentCount = 0;
      
      for (const appointment of appointments) {
        const message = 
          `📋 Follow-up: How was your appointment?\n\n` +
          `We hope your appointment with Dr. ${appointment.doctor_name} went well.\n\n` +
          `Please rate your experience:\n` +
          `1 - Excellent\n` +
          `2 - Good\n` +
          `3 - Average\n` +
          `4 - Poor\n\n` +
          `Reply with the number that matches your experience.`;
        
        await TwilioService.sendMessage(appointment.patient_phone, message);
        sentCount++;
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`Sent ${sentCount} follow-up messages`);
      return sentCount;
    } catch (error) {
      console.error('Error sending follow-up messages:', error);
      throw error;
    }
  }

  static async sendPrescriptionReminders() {
    try {
      // This would be a more complex implementation that tracks prescriptions
      // and sends reminders when refills are needed or medications should be taken
      
      console.log('Prescription reminder service is not yet implemented');
      return 0;
    } catch (error) {
      console.error('Error sending prescription reminders:', error);
      throw error;
    }
  }
}

module.exports = ReminderService;