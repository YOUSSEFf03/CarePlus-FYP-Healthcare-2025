import authService from './authService';

// For development, use your computer's IP address instead of localhost
const API_BASE_URL = 'http://192.168.50.176:3000'; // Your computer's IP address

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  appointment_date: string;
  appointment_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  notes?: string;
  consultation_fee?: number;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  license_number: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  biography?: string;
  consultation_fee?: number;
  rating?: number;
  total_reviews?: number;
  total_patients?: number;
}

export interface Workplace {
  id: string;
  doctorId: string;
  workplace_name: string;
  workplace_type: string;
  phone_number?: string;
  email?: string;
  description?: string;
  website?: string;
  is_primary: boolean;
  is_active: boolean;
  addresses?: Address[];
}

export interface Address {
  id: string;
  doctor_workplace_id: string;
  building_name?: string;
  building_number?: string;
  floor_number?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode?: string;
  area_description?: string;
  maps_link?: string;
  is_active: boolean;
}

export interface AppointmentWithDetails extends Appointment {
  doctor?: Doctor;
  workplace?: Workplace;
}

const appointmentService = {
  async getNextUpcomingAppointment(): Promise<AppointmentWithDetails | null> {
    try {
      console.log('Fetching next upcoming appointment...');
      
      // Get stored auth data
      const authData = await this.getAuthData();
      if (!authData) {
        throw new Error('User not authenticated');
      }
      
      console.log('Auth data for upcoming appointment:', { 
        hasToken: !!authData.token, 
        tokenLength: authData.token?.length,
        userId: authData.user?.id,
        tokenPreview: authData.token?.substring(0, 50) + '...'
      });

      const response = await fetch(`${API_BASE_URL}/doctors/appointments/next-upcoming`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      console.log('Next upcoming appointment response status:', response.status);
      const data = await response.json();
      console.log('Next upcoming appointment response data:', data);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No upcoming appointment
        }
        throw new Error(data.message || 'Failed to fetch upcoming appointment');
      }

      const appointment = data.data;
      if (!appointment) {
        return null;
      }

      // Fetch doctor details
      const doctorDetails = await this.getDoctorDetails(appointment.doctorId);
      appointment.doctor = doctorDetails;

      // Fetch workplace details if available
      if (doctorDetails) {
        const workplaceDetails = await this.getDoctorWorkplace(doctorDetails.id);
        appointment.workplace = workplaceDetails;
      }

      return appointment;
    } catch (error) {
      console.error('Error fetching next upcoming appointment:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getAllAppointments(): Promise<AppointmentWithDetails[]> {
    try {
      console.log('Fetching all appointments...');
      
      // Get stored auth data
      const authData = await this.getAuthData();
      if (!authData) {
        throw new Error('User not authenticated');
      }
      
      console.log('Auth data for all appointments:', { 
        hasToken: !!authData.token, 
        tokenLength: authData.token?.length,
        userId: authData.user?.id 
      });

      const response = await fetch(`${API_BASE_URL}/doctors/appointments/my-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      console.log('All appointments response status:', response.status);
      const data = await response.json();
      console.log('All appointments response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch appointments');
      }

      const appointments = data.data || [];
      
      // Fetch doctor and workplace details for each appointment
      const appointmentsWithDetails = await Promise.all(
        appointments.map(async (appointment: Appointment) => {
          try {
            const doctorDetails = await this.getDoctorDetails(appointment.doctorId);
            let workplaceDetails = null;
            
            if (doctorDetails) {
              workplaceDetails = await this.getDoctorWorkplace(doctorDetails.id);
            }

            return {
              ...appointment,
              doctor: doctorDetails,
              workplace: workplaceDetails,
            };
          } catch (error) {
            console.error(`Error fetching details for appointment ${appointment.id}:`, error);
            return appointment;
          }
        })
      );

      return appointmentsWithDetails;
    } catch (error) {
      console.error('Error fetching all appointments:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getDoctorDetails(doctorId: string): Promise<Doctor | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching doctor details:', error);
      return null;
    }
  },

  async getDoctorWorkplace(doctorId: string): Promise<Workplace | null> {
    try {
      const authData = await this.getAuthData();
      if (!authData) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/doctors/workplaces`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const workplaces = data.data || [];
      
      // Return the primary workplace or the first one
      const primaryWorkplace = workplaces.find((wp: Workplace) => wp.is_primary) || workplaces[0];
      return primaryWorkplace || null;
    } catch (error) {
      console.error('Error fetching doctor workplace:', error);
      return null;
    }
  },

  async getAuthData() {
    try {
      let authData = await authService.getStoredAuthData();
      
      if (!authData) {
        console.log('No stored auth data found');
        return null;
      }
      
      // Check if token is expired
      try {
        const tokenPayload = JSON.parse(atob(authData.token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (tokenPayload.exp && tokenPayload.exp < currentTime) {
          console.log('Token expired, attempting refresh...');
          // Try to refresh the token
          const refreshResult = await authService.refreshToken();
          if (refreshResult) {
            authData = await authService.getStoredAuthData();
          } else {
            console.log('Token refresh failed, user needs to login again');
            return null;
          }
        }
      } catch (tokenError) {
        console.log('Error checking token expiration:', tokenError);
        // Continue with the token as is
      }
      
      return authData;
    } catch (error) {
      console.error('Error getting auth data:', error);
      return null;
    }
  },
};

export default appointmentService;
