export class CreateAppointmentDto {
  doctorId: string;
  patientId: string;
  appointment_date: string;
  appointment_time: string;
  symptoms?: string;
}
