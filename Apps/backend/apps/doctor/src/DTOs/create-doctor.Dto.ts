export class CreateDoctorDto {
  userId: string;
  specialization: string;
  license_number: string;
  dr_idCard_url: string;
  biography: string;
  medical_license_url: string;
  verification_status?: string;
}
