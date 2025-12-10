import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000';

// Types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Item and Medicine types
export interface Item {
  item_id: number;
  name: string;
  manufacturer: string;
  description?: string;
  image_url?: string;
  category_id: number;
  category?: Category;
  medicines?: Medicine[];
  pharmacy_stock?: PharmacyBranchStock[];
}

export interface Medicine {
  medicine_id: number;
  item_id: number;
  prescription_required: boolean;
  requires_approval?: boolean;
  type: string;
  dosage: string;
  item?: Item;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface PharmacyBranchStock {
  pharmacy_branch_stock_id: number;
  pharmacy_branch_id: number;
  item_id: number;
  quantity: number;
  initial_price: number;
  sold_price: number;
  expiry_date?: string;
  last_updated: string;
  item?: Item;
  pharmacy_branch?: PharmacyBranch;
}

export interface PharmacyBranch {
  branch_id: number;
  pharmacy_id: number;
  branch_name: string;
  address: string;
  phone: string;
  is_main: boolean;
  is_active: boolean;
}

// Order types
export interface Order {
  order_id: number;
  patient_id: number;
  pharmacy_branch_id: number;
  order_date: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total_amount: number;
  notes?: string;
  pharmacy_branch?: PharmacyBranch;
  order_items?: OrderItem[];
  deliveries?: Delivery[];
}

export interface OrderItem {
  order_item_id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  instructions?: string;
  item?: Item;
}

export interface Delivery {
  delivery_id: number;
  order_id: number;
  address_id: number;
  delivery_method: string;
  delivery_status: string;
  address?: Address;
}

export interface Address {
  address_id: number;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

// Reservation types
export interface Reservation {
  reservation_id: number;
  patient_id: number;
  pharmacy_branch_id: number;
  medicine_id: number;
  prescription_id?: number;
  quantity_reserved: number;
  status: string;
  reserved_date: string;
  pickup_deadline?: string;
  notes?: string;
  medicine?: Medicine;
  pharmacy_branch?: PharmacyBranch;
}

// Customer types (derived from orders)
export interface Customer {
  patient_id: number;
  name: string;
  email?: string;
  phone?: string;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  preferred_channel: string;
}

// Prescription types
export interface Prescription {
  prescription_id: number;
  patient_id: number;
  doctor_id: number;
  date_issued: string;
  status: string;
  medicines: PrescriptionMedicine[];
  patient?: {
    name: string;
    email: string;
    phone: string;
  };
  doctor?: {
    name: string;
    specialization: string;
  };
}

export interface PrescriptionMedicine {
  prescription_medicine_id: number;
  prescription_id: number;
  medicine_id: number;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  notes?: string;
  medicine?: Medicine;
}

class PharmacyApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // ==================== ITEM MANAGEMENT ====================

  async getItems(page: number = 1, limit: number = 10, categoryId?: number): Promise<PaginatedResponse<Item>> {
    try {
      const params: any = { page, limit };
      if (categoryId) params.categoryId = categoryId;
      
      const response = await axios.get(`${API_BASE}/pharmacy/items`, {
        headers: this.getAuthHeaders(),
        params,
      });
      const payload = response.data?.data || {};
      const list: Item[] = payload.data ?? payload.items ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching items:', error);
      throw new Error('Failed to fetch items');
    }
  }

  async getItemDetails(itemId: number): Promise<Item> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/items/${itemId}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.item;
    } catch (error) {
      console.error('Error fetching item details:', error);
      throw new Error('Failed to fetch item details');
    }
  }

  async createItem(itemData: {
    category_id: number;
    name: string;
    manufacturer: string;
    description?: string;
    image_url?: string;
  }): Promise<Item> {
    try {
      const response = await axios.post(`${API_BASE}/pharmacy/items`, itemData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.item;
    } catch (error) {
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to create item';
      console.error('Error creating item:', error);
      throw new Error(message);
    }
  }

  async updateItem(itemId: number, updateData: {
    category_id?: number;
    name?: string;
    manufacturer?: string;
    description?: string;
    image_url?: string;
  }): Promise<Item> {
    try {
      const response = await axios.put(`${API_BASE}/pharmacy/items/${itemId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.item;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error('Failed to update item');
    }
  }

  async deleteItem(itemId: number): Promise<void> {
    try {
      await axios.put(`${API_BASE}/pharmacy/items/${itemId}/delete`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error('Failed to delete item');
    }
  }

  // ==================== MEDICINE MANAGEMENT ====================

  async createMedicine(medicineData: {
    item_id: number;
    prescription_required: boolean;
    requires_approval?: boolean;
    type: string;
    dosage: string;
  }): Promise<Medicine> {
    try {
      const response = await axios.post(`${API_BASE}/pharmacy/medicines`, medicineData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.medicine;
    } catch (error) {
      console.error('Error creating medicine:', error);
      throw new Error('Failed to create medicine');
    }
  }

  async updateMedicine(medicineId: number, updateData: {
    prescription_required?: boolean;
    requires_approval?: boolean;
    type?: string;
    dosage?: string;
  }): Promise<Medicine> {
    try {
      const response = await axios.put(`${API_BASE}/pharmacy/medicines/${medicineId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.medicine;
    } catch (error) {
      console.error('Error updating medicine:', error);
      throw new Error('Failed to update medicine');
    }
  }

  async deleteMedicine(medicineId: number): Promise<void> {
    try {
      await axios.put(`${API_BASE}/pharmacy/medicines/${medicineId}/delete`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting medicine:', error);
      throw new Error('Failed to delete medicine');
    }
  }

  // ==================== STOCK MANAGEMENT ====================

  async getStockByBranch(branchId: number, page: number = 1, limit: number = 10): Promise<PaginatedResponse<PharmacyBranchStock>> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/stock/branch/${branchId}`, {
        headers: this.getAuthHeaders(),
        params: { page, limit },
      });
      const payload = response.data?.data || {};
      const list: PharmacyBranchStock[] = payload.data ?? payload.stock ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching stock:', error);
      throw new Error('Failed to fetch stock');
    }
  }

  async getStock(page: number = 1, limit: number = 10): Promise<PaginatedResponse<PharmacyBranchStock>> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/stock`, {
        headers: this.getAuthHeaders(),
        params: { page, limit },
      });
      const payload = response.data?.data || {};
      const list: PharmacyBranchStock[] = payload.data ?? payload.stock ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching stock:', error);
      throw new Error('Failed to fetch stock');
    }
  }

  async addStock(stockData: {
    pharmacy_branch_id: number;
    item_id: number;
    quantity: number;
    initial_price: number;
    sold_price: number;
    expiry_date?: string;
  }): Promise<PharmacyBranchStock> {
    try {
      const response = await axios.post(`${API_BASE}/pharmacy/stock`, stockData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.stock;
    } catch (error) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to add stock';
      console.error('Error adding stock:', error);
      if (status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(message);
    }
  }

  async updateStock(stockId: number, updateData: {
    quantity?: number;
    initial_price?: number;
    sold_price?: number;
    expiry_date?: string;
  }): Promise<PharmacyBranchStock> {
    try {
      const response = await axios.put(`${API_BASE}/pharmacy/stock/${stockId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.stock;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw new Error('Failed to update stock');
    }
  }

  // ==================== CATEGORY MANAGEMENT ====================

  async getCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/categories`, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  async createCategory(categoryData: { category_name: string }): Promise<Category> {
    try {
      const response = await axios.post(`${API_BASE}/pharmacy/categories`, categoryData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.category;
    } catch (error) {
      const status = (error as any)?.response?.status;
      const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Failed to create category';
      console.error('Error creating category:', error);
      if (status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error(message);
    }
  }

  async updateCategory(categoryId: number, updateData: { category_name: string }): Promise<Category> {
    try {
      const response = await axios.put(`${API_BASE}/pharmacy/categories/${categoryId}`, updateData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data.category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  async deleteCategory(categoryId: number): Promise<void> {
    try {
      await axios.put(`${API_BASE}/pharmacy/categories/${categoryId}/delete`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // ==================== ORDER MANAGEMENT ====================

  async getOrders(status?: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Order>> {
    try {
      const params: any = { page, limit };
      if (status) params.status = status;
      
      const response = await axios.get(`${API_BASE}/pharmacy/orders`, {
        headers: this.getAuthHeaders(),
        params,
      });
      const payload = response.data?.data || {};
      const list: Order[] = payload.data ?? payload.orders ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    try {
      const response = await axios.put(`${API_BASE}/pharmacy/orders/${orderId}/status`, { status }, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // ==================== RESERVATION MANAGEMENT ====================

  async getReservations(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Reservation>> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/reservations`, {
        headers: this.getAuthHeaders(),
        params: { page, limit },
      });
      const payload = response.data?.data || {};
      const list: Reservation[] = payload.data ?? payload.reservations ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching reservations:', error);
      throw new Error('Failed to fetch reservations');
    }
  }

  async createReservation(reservationData: {
    pharmacy_branch_id: number;
    medicine_id: number;
    quantity_reserved: number;
    prescription_id?: number;
    pickup_deadline?: string;
    notes?: string;
  }): Promise<Reservation> {
    try {
      const response = await axios.post(`${API_BASE}/pharmacy/reservations`, reservationData, {
        headers: this.getAuthHeaders(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw new Error('Failed to create reservation');
    }
  }

  async cancelReservation(reservationId: number): Promise<void> {
    try {
      await axios.put(`${API_BASE}/pharmacy/reservations/${reservationId}/cancel`, {}, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw new Error('Failed to cancel reservation');
    }
  }

  // ==================== PRESCRIPTION MANAGEMENT ====================

  async getPrescriptions(page: number = 1, limit: number = 10, sortBy: string = 'date_issued', sortOrder: 'ASC' | 'DESC' = 'DESC'): Promise<PaginatedResponse<Prescription>> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/prescriptions`, {
        headers: this.getAuthHeaders(),
        params: { page, limit, sortBy, sortOrder },
      });
      const payload = response.data?.data || {};
      const list: Prescription[] = payload.data ?? payload.prescriptions ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw new Error('Failed to fetch prescriptions');
    }
  }

  // ==================== CUSTOMER MANAGEMENT ====================

  async getCustomers(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Customer>> {
    try {
      // This would need to be implemented in the backend
      // For now, we'll derive customer data from orders
      const ordersResponse = await this.getOrders(undefined, page, limit);
      
      // Group orders by patient_id to create customer records
      const customerMap = new Map<number, Customer>();
      
      ordersResponse.data.forEach(order => {
        if (!customerMap.has(order.patient_id)) {
          customerMap.set(order.patient_id, {
            patient_id: order.patient_id,
            name: `Patient ${order.patient_id}`, // This would come from user service
            total_orders: 0,
            total_spent: 0,
            preferred_channel: 'pickup',
          });
        }
        
        const customer = customerMap.get(order.patient_id)!;
        customer.total_orders++;
        customer.total_spent += order.total_amount;
        if (order.deliveries && order.deliveries.length > 0) {
          customer.preferred_channel = 'delivery';
        }
      });
      
      return {
        data: Array.from(customerMap.values()),
        total: customerMap.size,
        page,
        limit,
        totalPages: Math.ceil(customerMap.size / limit),
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new Error('Failed to fetch customers');
    }
  }

  // ==================== SEARCH AND FILTERING ====================

  async searchPharmaciesAndProducts(query?: string, category?: string, minPrice?: number, maxPrice?: number, page: number = 1, limit: number = 10) {
    try {
      const params: any = { page, limit };
      if (query) params.query = query;
      if (category) params.category = category;
      if (minPrice !== undefined) params.minPrice = minPrice;
      if (maxPrice !== undefined) params.maxPrice = maxPrice;
      
      const response = await axios.get(`${API_BASE}/pharmacy/search`, {
        headers: this.getAuthHeaders(),
        params,
      });
      const payload = response.data?.data || {};
      return {
        pharmacies: payload.pharmacies?.data ?? [],
        products: payload.products?.data ?? [],
        meta: {
          pharmacies: {
            total: payload.pharmacies?.total ?? 0,
            page: payload.pharmacies?.page ?? page,
            limit: payload.pharmacies?.limit ?? limit,
            totalPages: payload.pharmacies?.totalPages ?? 1,
          },
          products: {
            total: payload.products?.total ?? 0,
            page: payload.products?.page ?? page,
            limit: payload.products?.limit ?? limit,
            totalPages: payload.products?.totalPages ?? 1,
          }
        }
      };
    } catch (error) {
      console.error('Error searching pharmacies and products:', error);
      throw new Error('Failed to search pharmacies and products');
    }
  }

  async getNonPrescriptionProducts(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Item>> {
    try {
      const response = await axios.get(`${API_BASE}/pharmacy/products`, {
        headers: this.getAuthHeaders(),
        params: { page, limit },
      });
      const payload = response.data?.data || {};
      const list: Item[] = payload.data ?? payload.products ?? [];
      return {
        data: list,
        total: payload.total ?? list.length,
        page: payload.page ?? page,
        limit: payload.limit ?? limit,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error) {
      console.error('Error fetching non-prescription products:', error);
      throw new Error('Failed to fetch non-prescription products');
    }
  }
}

export default new PharmacyApiService();
