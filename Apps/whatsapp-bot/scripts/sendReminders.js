const ReminderService = require('../services/reminderService');

async function sendDailyReminders() {
  try {
    console.log('Starting daily reminder service...');
    
    // Send appointment reminders
    const remindersSent = await ReminderService.sendAppointmentReminders();
    console.log(`Sent ${remindersSent} appointment reminders`);
    
    // Send follow-up messages
    const followUpsSent = await ReminderService.sendFollowUpMessages();
    console.log(`Sent ${followUpsSent} follow-up messages`);
    
    // Send prescription reminders
    const prescriptionRemindersSent = await ReminderService.sendPrescriptionReminders();
    console.log(`Sent ${prescriptionRemindersSent} prescription reminders`);
    
    console.log('Daily reminder service completed');
    process.exit(0);
  } catch (error) {
    console.error('Error in daily reminder service:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  sendDailyReminders();
}

module.exports = {
  sendDailyReminders
};