export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string; // Changed from 'Bearer' to string
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    date_of_birth?: string;
    gender?: string;
    medical_history?: string;
  };
}
