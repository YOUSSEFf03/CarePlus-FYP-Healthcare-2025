import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PharmacyService } from './pharmacy.service';
import { 
  GetPharmaciesDto, 
  SearchPharmaciesDto, 
  SearchByPrescriptionDto,
  CreateReservationDto,
  CreateOrderDto,
  GetOrdersDto,
  GetPrescriptionsDto
} from './dto/pharmacy.dto';

@Controller()
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // Get top pharmacies
  @MessagePattern({ cmd: 'get_pharmacies' })
  async getPharmacies(@Payload() data: GetPharmaciesDto) {
    return await this.pharmacyService.getPharmacies(data);
  }

  // Get current orders count
  @MessagePattern({ cmd: 'get_current_orders_count' })
  async getCurrentOrdersCount(@Payload() data: { patientId: number }) {
    return await this.pharmacyService.getCurrentOrdersCount(data.patientId);
  }

  // Search pharmacies and products
  @MessagePattern({ cmd: 'search_pharmacies_and_products' })
  async searchPharmaciesAndProducts(@Payload() data: SearchPharmaciesDto) {
    return await this.pharmacyService.searchPharmaciesAndProducts(data);
  }

  // Get patient prescriptions
  @MessagePattern({ cmd: 'get_patient_prescriptions' })
  async getPrescriptions(@Payload() data: { patientId: number } & GetPrescriptionsDto) {
    const { patientId, ...dto } = data;
    return await this.pharmacyService.getPrescriptions(patientId, dto);
  }

  // Get non-prescription products
  @MessagePattern({ cmd: 'get_non_prescription_products' })
  async getNonPrescriptionProducts(@Payload() data: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = data;
    return await this.pharmacyService.getNonPrescriptionProducts(page, limit);
  }

  // Search medicines by prescription
  @MessagePattern({ cmd: 'search_by_prescription' })
  async searchByPrescription(@Payload() data: { patientId: number } & SearchByPrescriptionDto) {
    const { patientId, ...dto } = data;
    return await this.pharmacyService.searchByPrescription(patientId, dto);
  }

  // Create reservation
  @MessagePattern({ cmd: 'create_reservation' })
  async createReservation(@Payload() data: { patientId: number } & CreateReservationDto) {
    const { patientId, ...dto } = data;
    return await this.pharmacyService.createReservation(patientId, dto);
  }

  // Create order
  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: { patientId: number } & CreateOrderDto) {
    const { patientId, ...dto } = data;
    return await this.pharmacyService.createOrder(patientId, dto);
  }

  // Get patient orders
  @MessagePattern({ cmd: 'get_patient_orders' })
  async getPatientOrders(@Payload() data: { patientId: number } & GetOrdersDto) {
    const { patientId, ...dto } = data;
    return await this.pharmacyService.getPatientOrders(patientId, dto);
  }

  // Get categories
  @MessagePattern({ cmd: 'get_categories' })
  async getCategories() {
    return await this.pharmacyService.getCategories();
  }

  // Get pharmacy by ID
  @MessagePattern({ cmd: 'get_pharmacy_by_id' })
  async getPharmacyById(@Payload() data: { pharmacyId: number }) {
    // This would be implemented in the service
    return { message: 'Get pharmacy by ID not implemented yet' };
  }

  // Get pharmacy branch by ID
  @MessagePattern({ cmd: 'get_pharmacy_branch_by_id' })
  async getPharmacyBranchById(@Payload() data: { branchId: number }) {
    // This would be implemented in the service
    return { message: 'Get pharmacy branch by ID not implemented yet' };
  }

  // Get product details
  @MessagePattern({ cmd: 'get_product_details' })
  async getProductDetails(@Payload() data: { itemId: number }) {
    // This would be implemented in the service
    return { message: 'Get product details not implemented yet' };
  }

  // Update order status
  @MessagePattern({ cmd: 'update_order_status' })
  async updateOrderStatus(@Payload() data: { orderId: number; status: string }) {
    // This would be implemented in the service
    return { message: 'Update order status not implemented yet' };
  }

  // Cancel reservation
  @MessagePattern({ cmd: 'cancel_reservation' })
  async cancelReservation(@Payload() data: { reservationId: number; patientId: number }) {
    // This would be implemented in the service
    return { message: 'Cancel reservation not implemented yet' };
  }

  // ==================== PHARMACY PROFILE APIs ====================

  // Get pharmacy profile
  @MessagePattern({ cmd: 'get_pharmacy_profile' })
  async getPharmacyProfile(@Payload() data: { userId: string }) {
    return await this.pharmacyService.getPharmacyProfile(data.userId);
  }

  // Update pharmacy profile
  @MessagePattern({ cmd: 'update_pharmacy_profile' })
  async updatePharmacyProfile(@Payload() data: { userId: string; updateData: any }) {
    return await this.pharmacyService.updatePharmacyProfile(data.userId, data.updateData);
  }

  // ==================== PHARMACY DASHBOARD APIs ====================

  // Get pharmacy dashboard stats
  @MessagePattern({ cmd: 'get_pharmacy_dashboard_stats' })
  async getPharmacyDashboardStats(@Payload() data: { pharmacyId: number }) {
    return await this.pharmacyService.getPharmacyDashboardStats(data.pharmacyId);
  }

  // Get top-selling products
  @MessagePattern({ cmd: 'get_top_selling_products' })
  async getTopSellingProducts(@Payload() data: { pharmacyId: number; limit?: number }) {
    const { pharmacyId, limit = 5 } = data;
    return await this.pharmacyService.getTopSellingProducts(pharmacyId, limit);
  }

  // Get recent activity
  @MessagePattern({ cmd: 'get_recent_activity' })
  async getRecentActivity(@Payload() data: { pharmacyId: number; limit?: number }) {
    const { pharmacyId, limit = 10 } = data;
    return await this.pharmacyService.getRecentActivity(pharmacyId, limit);
  }
}
