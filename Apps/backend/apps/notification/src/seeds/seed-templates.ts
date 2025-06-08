// src/seeds/seed-templates.ts
import { DataSource } from 'typeorm';
import {
  NotificationTemplate,
  NotificationType,
} from '../entities/notification-template.entity';
import { NotificationType } from '../entities/notification-log.entity';

export async function seedNotificationTemplates(dataSource: DataSource) {
  const templateRepo = dataSource.getRepository(NotificationTemplate);

  const templates = [
    // OTP Templates
    {
      name: 'otp',
      type: NotificationType.EMAIL,
      subject: 'Verify your account',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Account</h2>
          <p>Hello {{userName}},</p>
          <p>Your verification code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
            {{otp}}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      defaultData: { userName: 'User' },
    },
    {
      name: 'otp',
      type: NotificationType.WHATSAPP,
      subject: 'OTP Verification',
      content:
        'Hello {{userName}}! Your verification code is: {{otp}}. This code expires in 10 minutes.',
      defaultData: { userName: 'User' },
    },

    // Password Reset Templates
    {
      name: 'password_reset',
      type: NotificationType.EMAIL,
      subject: 'Reset Your Password',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello {{userName}},</p>
          <p>You requested to reset your password. Use this code to reset it:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
            {{otp}}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please secure your account immediately.</p>
        </div>
      `,
      defaultData: { userName: 'User' },
    },

    // Appointment Templates
    {
      name: 'appointment_reminder',
      type: NotificationType.EMAIL,
      subject: 'Appointment Reminder',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Appointment Reminder</h2>
          <p>Hello {{patientName}},</p>
          <p>This is a reminder about your upcoming appointment:</p>
          <div style="background: #e3f2fd; padding: 20px; border-left: 4px solid #2196f3;">
            <p><strong>Doctor:</strong> {{doctorName}}</p>
            <p><strong>Date:</strong> {{appointmentDate}}</p>
            <p><strong>Time:</strong> {{appointmentTime}}</p>
          </div>
          <p>Please arrive 15 minutes early for check-in.</p>
          <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
        </div>
      `,
      defaultData: {},
    },
    {
      name: 'appointment_reminder',
      type: NotificationType.WHATSAPP,
      subject: 'Appointment Reminder',
      content: `Hi {{patientName}}! Reminder: You have an appointment with Dr. {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}. Please arrive 15 minutes early.`,
      defaultData: {},
    },

    // Doctor Verification Templates
    {
      name: 'doctor_verification_approved',
      type: NotificationType.EMAIL,
      subject: 'Doctor Verification Approved',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4caf50;">Verification Approved!</h2>
          <p>Congratulations Dr. {{doctorName}},</p>
          <p>Your doctor profile has been successfully verified! You can now:</p>
          <ul>
            <li>Accept patient appointments</li>
            <li>Update your availability</li>
            <li>Manage your consultation fees</li>
            <li>View your doctor dashboard</li>
          </ul>
          <p>Welcome to our healthcare platform!</p>
        </div>
      `,
      defaultData: {},
    },
    {
      name: 'doctor_verification_rejected',
      type: NotificationType.EMAIL,
      subject: 'Doctor Verification Update',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f44336;">Verification Update</h2>
          <p>Hello Dr. {{doctorName}},</p>
          <p>Thank you for your interest in joining our platform. Unfortunately, we need additional information to complete your verification.</p>
          <div style="background: #fff3e0; padding: 20px; border-left: 4px solid #ff9800;">
            <p><strong>Reason:</strong> {{rejectionReason}}</p>
          </div>
          <p>Please update your profile with the required information and we'll review it again.</p>
          <p>If you have questions, please contact our support team.</p>
        </div>
      `,
      defaultData: {},
    },

    // Welcome Templates
    {
      name: 'welcome_patient',
      type: NotificationType.EMAIL,
      subject: 'Welcome to Our Healthcare Platform',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2196f3;">Welcome {{userName}}!</h2>
          <p>Thank you for joining our healthcare platform. You can now:</p>
          <ul>
            <li>Find and book appointments with verified doctors</li>
            <li>View your appointment history</li>
            <li>Manage your medical records</li>
            <li>Receive appointment reminders</li>
          </ul>
          <p>Get started by booking your first appointment!</p>
        </div>
      `,
      defaultData: {},
    },
  ];

  for (const templateData of templates) {
    const existing = await templateRepo.findOne({
      where: { name: templateData.name, type: templateData.type },
    });

    if (!existing) {
      const template = templateRepo.create(templateData);
      await templateRepo.save(template);
      console.log(
        `✅ Created template: ${templateData.name} (${templateData.type})`,
      );
    }
  }

  console.log('🌱 Notification templates seeded successfully!');
}

// To run this seed, create a separate script or add to your main.ts
export async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.NOTIFICATION_DB_NAME || 'notification_service',
    entities: [NotificationTemplate],
    synchronize: true,
  });

  await dataSource.initialize();
  await seedNotificationTemplates(dataSource);
  await dataSource.destroy();
}
