import { VerificationStatus } from '../doctor.entity';

export class VerifyDoctorDto {
  doctorId: string;
  status: VerificationStatus;
  rejection_reason?: string;
}
