export class AuthResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string; // Changed from 'Bearer' to string
}
