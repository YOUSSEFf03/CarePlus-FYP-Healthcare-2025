import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

export interface DashboardStats {
  sales: {
    today: number;
    change: number;
    timeframe: string;
  };
  orders: {
    today: number;
    change: number;
    timeframe: string;
  };
  prescriptionQueue: {
    current: number;
    change: number;
    timeframe: string;
  };
  lowStockSKUs: {
    current: number;
    change: number;
    timeframe: string;
  };
}

export interface TopSellingProduct {
  product_id: number;
  name: string;
  units_sold: number;
  revenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'reservation';
  patient_id: number;
  status: string;
  total?: number;
  quantity?: number;
  date: string;
  delivery_method?: string;
  medicine_name?: string;
}

class PharmacyDashboardService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/dashboard/stats`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data || {
        sales: { today: 0, change: 0, timeframe: '7d' },
        orders: { today: 0, change: 0, timeframe: '7d' },
        prescriptionQueue: { current: 0, change: 0, timeframe: '7d' },
        lowStockSKUs: { current: 0, change: 0, timeframe: '7d' }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  async getTopSellingProducts(limit: number = 5): Promise<TopSellingProduct[]> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/dashboard/top-products`, {
        headers: this.getAuthHeaders(),
        params: { limit },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching top-selling products:', error);
      throw new Error('Failed to fetch top-selling products');
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/dashboard/recent-activity`, {
        headers: this.getAuthHeaders(),
        params: { limit },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }
}

export default new PharmacyDashboardService();
