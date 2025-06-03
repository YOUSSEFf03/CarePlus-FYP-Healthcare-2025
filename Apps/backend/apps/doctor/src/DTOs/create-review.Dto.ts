export class CreateReviewDto {
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
}
