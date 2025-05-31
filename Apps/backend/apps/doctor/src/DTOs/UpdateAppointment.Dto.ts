import { AppointmentStatus } from '../appointment.entity';

export class UpdateAppointmentDto {
  status: AppointmentStatus;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  cancellation_reason?: string;
}
