// For development, use your computer's IP address instead of localhost
const API_BASE_URL = 'http://192.168.50.176:3000'; // Your computer's IP address

export interface Specialization {
  specialization: string;
  count: number;
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

const doctorService = {
  async getAuthHeaders(): Promise<Record<string, string>> {
    const authData = await doctorService.getStoredAuthData();
    if (!authData || !authData.token) {
      throw new Error('User not authenticated');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.token}`,
    };
  },

  async getStoredAuthData() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('access_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (!token || !userData) {
        return null;
      }
      
      return {
        token,
        user: JSON.parse(userData),
      };
    } catch (error) {
      console.error('Error getting stored auth data:', error);
      return null;
    }
  },

  async getTopSpecializations(limit: number = 6): Promise<Specialization[]> {
    try {
      console.log('Fetching top specializations...');
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/specializations/top?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      console.log('Specializations response status:', response.status);
      const data = await response.json();
      console.log('Specializations response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch specializations');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error fetching specializations:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getAllSpecializations(): Promise<Specialization[]> {
    try {
      console.log('Fetching all specializations...');
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/specializations`, {
        method: 'GET',
        headers,
      });

      console.log('All specializations response status:', response.status);
      const data = await response.json();
      console.log('All specializations response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch specializations');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error fetching all specializations:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async searchSpecializations(searchTerm: string): Promise<Specialization[]> {
    try {
      console.log('Searching specializations for:', searchTerm);
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/specializations/search?q=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers,
      });

      console.log('Search specializations response status:', response.status);
      const data = await response.json();
      console.log('Search specializations response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search specializations');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error searching specializations:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getDoctorsBySpecialization(specialization: string): Promise<any> {
    try {
      console.log('Fetching doctors for specialization:', specialization);
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/specializations/${encodeURIComponent(specialization)}`, {
        method: 'GET',
        headers,
      });

      console.log('Doctors by specialization response status:', response.status);
      const data = await response.json();
      console.log('Doctors by specialization response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch doctors by specialization');
      }

      return data;
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getTopRatedDoctors(limit: number = 6): Promise<Doctor[]> {
    try {
      console.log('Fetching top rated doctors...');
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/top-rated?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      console.log('Top rated doctors response status:', response.status);
      const data = await response.json();
      console.log('Top rated doctors response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch top rated doctors');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error fetching top rated doctors:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getMostPopularDoctors(limit: number = 6): Promise<Doctor[]> {
    try {
      console.log('Fetching most popular doctors...');
      const headers = await doctorService.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/doctors/most-popular?limit=${limit}`, {
        method: 'GET',
        headers,
      });

      console.log('Most popular doctors response status:', response.status);
      const data = await response.json();
      console.log('Most popular doctors response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch most popular doctors');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error fetching most popular doctors:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async searchDoctors(searchQuery: string): Promise<Doctor[]> {
    try {
      console.log('Searching doctors...', { searchQuery });
      const headers = await doctorService.getAuthHeaders();
      const url = new URL(`${API_BASE_URL}/doctors/search`);
      url.searchParams.append('q', searchQuery);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      console.log('Search doctors response status:', response.status);
      const data = await response.json();
      console.log('Search doctors response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to search doctors');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error searching doctors:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getDoctorById(doctorId: string): Promise<Doctor> {
    try {
      console.log('Getting doctor by ID...', { doctorId });
      const headers = await doctorService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}`, {
        method: 'GET',
        headers,
      });

      console.log('Get doctor by ID response status:', response.status);
      const data = await response.json();
      console.log('Get doctor by ID response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get doctor details');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error getting doctor by ID:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  async getDoctorWorkplaces(doctorId: string): Promise<any[]> {
    try {
      console.log('Getting doctor workplaces...', { doctorId });
      const headers = await doctorService.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/doctors/${doctorId}/workplaces`, {
        method: 'GET',
        headers,
      });

      console.log('Get doctor workplaces response status:', response.status);
      const data = await response.json();
      console.log('Get doctor workplaces response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get doctor workplaces');
      }

      return data.data || data;
    } catch (error) {
      console.error('Error getting doctor workplaces:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },

  getAppointmentSlotsByWorkplace: async (doctorId: string, workplaceId: string, date?: string) => {
    try {
      const headers = await doctorService.getAuthHeaders();
      console.log('Getting available slots for workplace:', workplaceId, 'date:', date);

      let url = `${API_BASE_URL}/doctors/workplaces/${workplaceId}/available-slots`;
      if (date) {
        url += `?date=${encodeURIComponent(date)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('Get available slots response status:', response.status);
      const data = await response.json();
      console.log('Get available slots response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get available slots');
      }

      return data;
    } catch (error) {
      console.error('Error getting available slots:', error);
      if (error instanceof TypeError && error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection and make sure the backend is running.');
      }
      throw error;
    }
  },
};

export default doctorService;
