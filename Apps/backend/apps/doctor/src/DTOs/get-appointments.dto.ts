import { AppointmentStatus } from '../appointment.entity';

export class GetAppointmentsDto {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}
