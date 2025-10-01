import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

export interface PharmacyProfileData {
  pharmacy_id: number;
  pharmacy_name: string;
  pharmacy_owner: string;
  pharmacy_license?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_picture_url?: string;
  };
  branches: Array<{
    branch_id: number;
    branch_name: string;
    address: string;
    phone: string;
    is_main: boolean;
  }>;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  pharmacy_name?: string;
  pharmacy_owner?: string;
  pharmacy_license?: string;
  profile_picture_url?: string;
}

const pharmacyProfileService = {
  async getProfile(): Promise<PharmacyProfileData> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_BASE_URL}/pharmacy/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  },

  async updateProfile(updateData: UpdateProfileData): Promise<PharmacyProfileData> {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_BASE_URL}/pharmacy/profile`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.data;
  },
};

export default pharmacyProfileService;
