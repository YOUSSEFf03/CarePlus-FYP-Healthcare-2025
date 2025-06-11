import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DoctorService } from '../doctor.service';

@Injectable()
export class ReminderTask {
  constructor(private readonly doctorService: DoctorService) {}

  @Cron('0 9 * * *') // Cron: 9:00 AM every day
  async handleAppointmentReminders() {
    console.log(' Running daily appointment reminder task...');
    await this.doctorService.scheduleAppointmentReminders();
  }
}
