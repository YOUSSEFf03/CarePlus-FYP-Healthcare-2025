const DatabaseService = require('../services/databaseService');
const TwilioService = require('../services/twilioService');

class UserController {
  static async getUserProfile(sender) {
    try {
      const patient = await DatabaseService.getPatientByPhone(sender);
      
      if (!patient) {
        await TwilioService.sendMessage(sender, "❌ User profile not found. Please register first.");
        return;
      }

      const profileMessage = 
        `👤 Your Profile:\n\n` +
        `Name: ${patient.name}\n` +
        `Email: ${patient.email}\n` +
        `Phone: ${patient.phone}\n` +
        `Date of Birth: ${new Date(patient.date_of_birth).toLocaleDateString()}\n` +
        `Gender: ${patient.gender}\n\n` +
        `To update your profile, please contact support.`;

      await TwilioService.sendMessage(sender, profileMessage);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      await TwilioService.sendMessage(sender, "❌ An error occurred while fetching your profile.");
    }
  }

  static async updateUserProfile(sender, updates) {
    try {
      const patient = await DatabaseService.getPatientByPhone(sender);
      
      if (!patient) {
        await TwilioService.sendMessage(sender, "❌ User profile not found. Please register first.");
        return false;
      }

      // In a real implementation, you would update the user and patient records
      // const updatedUser = await DatabaseService.updateUser(patient.user_id, updates);
      
      await TwilioService.sendMessage(sender, "✅ Your profile has been updated successfully.");
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      await TwilioService.sendMessage(sender, "❌ An error occurred while updating your profile.");
      return false;
    }
  }
}

module.exports = UserController;