import AsyncStorage from '@react-native-async-storage/async-storage';

// For development, use your computer's IP address instead of localhost
// You can find your IP by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
const API_BASE_URL = 'http://192.168.50.176:3000'; // Your computer's IP address

export interface PatientSignupData {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'patient';
  date_of_birth?: string;
  gender?: 'male' | 'female';
  medical_history?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: string;
    token_type: string;
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
  };
  message?: string;
}

const authService = {
  async registerPatient(signupData: PatientSignupData): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with URL:', `${API_BASE_URL}/auth/register`);
      console.log('Registration data:', signupData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Registration failed with status:', response.status);
        console.error('Error data:', data);
        throw new Error(data.message || 'Registration failed');
      }

      console.log('Registration successful, returning data:', data);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('Attempting login with URL:', `${API_BASE_URL}/auth/login`);
      console.log('Login data:', loginData);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async storeAuthData(authResponse: AuthResponse) {
    try {
      await AsyncStorage.setItem('access_token', authResponse.data.access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(authResponse.data.user));
      if (authResponse.data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', authResponse.data.refresh_token);
      }
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  },

  async getStoredAuthData() {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      console.log('Retrieved from storage:', {
        hasToken: !!token,
        tokenLength: token?.length,
        hasUserData: !!userData,
        userDataPreview: userData?.substring(0, 100) + '...'
      });
      
      if (token && userData) {
        return {
          token,
          user: JSON.parse(userData),
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return null;
    }
  },

  async clearAuthData() {
    try {
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      console.log('Attempting to refresh token...');
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.log('No refresh token found');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        console.log('Token refresh failed:', response.status);
        return false;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Store new tokens
        await AsyncStorage.setItem('access_token', data.data.access_token);
        if (data.data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.data.refresh_token);
        }
        if (data.data.user) {
          await AsyncStorage.setItem('user_data', JSON.stringify(data.data.user));
        }
        
        console.log('Token refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Verifying OTP for email:', email);
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      console.log('OTP verification response status:', response.status);
      const data = await response.json();
      console.log('OTP verification response data:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Verification failed' };
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async resendOtp(email: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Resending OTP for email:', email);
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      console.log('Resend OTP response status:', response.status);
      const data = await response.json();
      console.log('Resend OTP response data:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to resend OTP' };
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('Sending phone OTP to:', phone);
      const response = await fetch(`${API_BASE_URL}/auth/send-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      console.log('Phone OTP response status:', response.status);
      const data = await response.json();
      console.log('Phone OTP response data:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || 'Failed to send OTP' };
      }
    } catch (error) {
      console.error('Phone OTP error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async verifyPhoneOtp(phone: string, otp: string): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      console.log('Verifying phone OTP for:', phone);
      const response = await fetch(`${API_BASE_URL}/auth/verify-phone-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      console.log('Phone OTP verification response status:', response.status);
      const data = await response.json();
      console.log('Phone OTP verification response data:', data);

      if (response.ok) {
        return { success: true, data: data.data, message: data.message };
      } else {
        return { success: false, message: data.message || 'Verification failed' };
      }
    } catch (error) {
      console.error('Phone OTP verification error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },
};

export default authService;
