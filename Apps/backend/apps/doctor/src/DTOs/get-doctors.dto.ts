import { VerificationStatus } from '../doctor.entity';

export class GetDoctorsDto {
  specialization?: string;
  verification_status?: VerificationStatus;
  is_active?: boolean;
  page?: number;
  limit?: number;
}
