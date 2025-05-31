export class UpdateDoctorDto {
  specialization?: string;
  biography?: string;
  consultation_fee?: number;
  available_days?: string[];
  start_time?: string;
  end_time?: string;
}
