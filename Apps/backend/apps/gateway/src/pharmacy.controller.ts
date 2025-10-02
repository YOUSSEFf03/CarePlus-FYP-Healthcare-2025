import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Inject,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { AuthenticatedRequest } from './middleware/auth.middleware';

@Controller('pharmacy')
export class PharmacyController {
  constructor(
    @Inject('PHARMACY_SERVICE_CLIENT')
    private readonly pharmacyServiceClient: ClientProxy,
  ) {}

  async handleRequest(pattern: any, body: any, fallbackMsg: string) {
    try {
      const result = await lastValueFrom(
        this.pharmacyServiceClient.send(pattern, body),
      );
      return {
        success: true,
        data: result,
        message: 'Operation successful',
      };
    } catch (err) {
      console.error('Pharmacy Microservice Error:', err);

      let status = err?.status || HttpStatus.BAD_REQUEST;
      if (typeof status !== 'number' || isNaN(status)) {
        status = HttpStatus.BAD_REQUEST;
      }
      const message = err?.response?.message || err?.message || fallbackMsg;
      throw new HttpException(
        {
          success: false,
          status,
          message,
          error: this.getErrorName(status),
        },
        status,
      );
    }
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }

  // ==================== PUBLIC ROUTES ====================

  @Get()
  async getPharmacies(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'rating' | 'total_sales' | 'name',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.handleRequest(
      { cmd: 'get_pharmacies' },
      { page, limit, sortBy, sortOrder },
      'Failed to get pharmacies',
    );
  }

  @Get('search')
  async searchPharmaciesAndProducts(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'search_pharmacies_and_products' },
      { query, category, minPrice, maxPrice, page, limit },
      'Failed to search pharmacies and products',
    );
  }

  @Get('products')
  async getNonPrescriptionProducts(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.handleRequest(
      { cmd: 'get_non_prescription_products' },
      { page, limit },
      'Failed to get non-prescription products',
    );
  }

  @Get('categories')
  async getCategories() {
    return this.handleRequest(
      { cmd: 'get_categories' },
      {},
      'Failed to get categories',
    );
  }

  @Get(':id')
  async getPharmacyById(@Param('id') id: string) {
    return this.handleRequest(
      { cmd: 'get_pharmacy_by_id' },
      { pharmacyId: parseInt(id) },
      'Failed to get pharmacy',
    );
  }

  // ==================== PROTECTED ROUTES ====================

  @Get('orders/current-count')
  async getCurrentOrdersCount(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'get_current_orders_count' },
      { patientId: req.user.id },
      'Failed to get current orders count',
    );
  }

  @Get('prescriptions')
  async getPrescriptions(
    @Req() req: AuthenticatedRequest,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'date_issued',
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'get_patient_prescriptions' },
      { patientId: req.user.id, page, limit, sortBy, sortOrder },
      'Failed to get prescriptions',
    );
  }

  @Post('search/prescription')
  async searchByPrescription(
    @Req() req: AuthenticatedRequest,
    @Body() body: { prescriptionId: number; page?: number; limit?: number },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'search_by_prescription' },
      { patientId: req.user.id, ...body },
      'Failed to search by prescription',
    );
  }

  @Post('reservations')
  async createReservation(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      pharmacy_branch_id: number;
      medicine_id: number;
      quantity_reserved: number;
      prescription_id?: number;
      pickup_deadline?: Date;
      notes?: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'create_reservation' },
      { patientId: req.user.id, ...body },
      'Failed to create reservation',
    );
  }

  @Post('orders')
  async createOrder(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      pharmacy_branch_id: number;
      items: Array<{
        item_id: number;
        quantity: number;
        instructions?: string;
      }>;
      delivery_method: 'pickup' | 'delivery';
      address_id?: number;
      payment_method: string;
      notes?: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'create_order' },
      { patientId: req.user.id, ...body },
      'Failed to create order',
    );
  }

  @Get('orders/my-orders')
  async getMyOrders(
    @Req() req: AuthenticatedRequest,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'get_patient_orders' },
      { patientId: req.user.id, status, page, limit },
      'Failed to get orders',
    );
  }

  @Put('orders/:orderId/status')
  async updateOrderStatus(
    @Req() req: AuthenticatedRequest,
    @Param('orderId') orderId: string,
    @Body() body: { status: string },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'update_order_status' },
      { orderId: parseInt(orderId), status: body.status },
      'Failed to update order status',
    );
  }

  @Put('reservations/:reservationId/cancel')
  async cancelReservation(
    @Req() req: AuthenticatedRequest,
    @Param('reservationId') reservationId: string,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'cancel_reservation' },
      { reservationId: parseInt(reservationId), patientId: req.user.id },
      'Failed to cancel reservation',
    );
  }

  // ==================== PHARMACY PROFILE APIs ====================

  @Get('profile')
  async getProfile(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    const userId = req.user.id;

    return this.handleRequest(
      { cmd: 'get_pharmacy_profile' },
      { userId },
      'Failed to get pharmacy profile',
    );
  }

  @Put('profile')
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateData: any,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    const userId = req.user.id;

    return this.handleRequest(
      { cmd: 'update_pharmacy_profile' },
      { userId, updateData },
      'Failed to update pharmacy profile',
    );
  }

  // ==================== PHARMACY DASHBOARD APIs ====================

  @Get('dashboard/stats')
  async getDashboardStats(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    // Get pharmacy ID from user ID (assuming user ID is the pharmacy ID for now)
    // In a real app, you'd have a separate table linking users to pharmacies
    const pharmacyId = req.user.id; // Keep as string since it's a UUID

    return this.handleRequest(
      { cmd: 'get_pharmacy_dashboard_stats' },
      { pharmacyId },
      'Failed to get dashboard stats',
    );
  }

  @Get('dashboard/top-products')
  async getTopSellingProducts(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    const pharmacyId = req.user.id; // Keep as string since it's a UUID

    return this.handleRequest(
      { cmd: 'get_top_selling_products' },
      { pharmacyId, limit },
      'Failed to get top-selling products',
    );
  }

  @Get('dashboard/recent-activity')
  async getRecentActivity(
    @Req() req: AuthenticatedRequest,
    @Query('limit') limit?: number,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    const pharmacyId = req.user.id; // Keep as string since it's a UUID

    return this.handleRequest(
      { cmd: 'get_recent_activity' },
      { pharmacyId, limit },
      'Failed to get recent activity',
    );
  }

  // ==================== ITEM MANAGEMENT ROUTES ====================

  @Post('items')
  async createItem(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      category_id: number;
      name: string;
      manufacturer: string;
      description?: string;
      image_url?: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'create_item' },
      body,
      'Failed to create item',
    );
  }

  @Put('items/:itemId')
  async updateItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
    @Body()
    updateData: {
      category_id?: number;
      name?: string;
      manufacturer?: string;
      description?: string;
      image_url?: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'update_item' },
      { itemId: parseInt(itemId), updateData },
      'Failed to update item',
    );
  }

  @Get('items/:itemId')
  async getItemDetails(
    @Req() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'get_item_details' },
      { itemId: parseInt(itemId) },
      'Failed to get item details',
    );
  }

  @Put('items/:itemId/delete')
  async deleteItem(
    @Req() req: AuthenticatedRequest,
    @Param('itemId') itemId: string,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'delete_item' },
      { itemId: parseInt(itemId) },
      'Failed to delete item',
    );
  }

  // ==================== MEDICINE MANAGEMENT ROUTES ====================

  @Post('medicines')
  async createMedicine(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      item_id: number;
      prescription_required: boolean;
      requires_approval?: boolean;
      type: string;
      dosage: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'create_medicine' },
      body,
      'Failed to create medicine',
    );
  }

  @Put('medicines/:medicineId')
  async updateMedicine(
    @Req() req: AuthenticatedRequest,
    @Param('medicineId') medicineId: string,
    @Body()
    updateData: {
      prescription_required?: boolean;
      requires_approval?: boolean;
      type?: string;
      dosage?: string;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'update_medicine' },
      { medicineId: parseInt(medicineId), updateData },
      'Failed to update medicine',
    );
  }

  @Put('medicines/:medicineId/delete')
  async deleteMedicine(
    @Req() req: AuthenticatedRequest,
    @Param('medicineId') medicineId: string,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'delete_medicine' },
      { medicineId: parseInt(medicineId) },
      'Failed to delete medicine',
    );
  }

  // ==================== STOCK MANAGEMENT ROUTES ====================

  @Post('stock')
  async addStock(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      pharmacy_branch_id: number;
      item_id: number;
      quantity: number;
      initial_price: number;
      sold_price: number;
      expiry_date?: Date;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'add_stock' },
      body,
      'Failed to add stock',
    );
  }

  @Put('stock/:stockId')
  async updateStock(
    @Req() req: AuthenticatedRequest,
    @Param('stockId') stockId: string,
    @Body()
    updateData: {
      quantity?: number;
      initial_price?: number;
      sold_price?: number;
      expiry_date?: Date;
    },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'update_stock' },
      { stockId: parseInt(stockId), updateData },
      'Failed to update stock',
    );
  }

  @Get('stock/branch/:branchId')
  async getStockByBranch(
    @Req() req: AuthenticatedRequest,
    @Param('branchId') branchId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'get_stock_by_branch' },
      { branchId: parseInt(branchId), page, limit },
      'Failed to get stock by branch',
    );
  }

  // ==================== CATEGORY MANAGEMENT ROUTES ====================

  @Post('categories')
  async createCategory(
    @Req() req: AuthenticatedRequest,
    @Body() body: { category_name: string },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'create_category' },
      body,
      'Failed to create category',
    );
  }

  @Put('categories/:categoryId')
  async updateCategory(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId') categoryId: string,
    @Body() updateData: { category_name: string },
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'update_category' },
      { categoryId: parseInt(categoryId), updateData },
      'Failed to update category',
    );
  }

  @Put('categories/:categoryId/delete')
  async deleteCategory(
    @Req() req: AuthenticatedRequest,
    @Param('categoryId') categoryId: string,
  ) {
    if (!req.user) {
      throw new HttpException(
        {
          success: false,
          status: 401,
          message: 'Authentication required',
          error: 'Unauthorized',
        },
        401,
      );
    }

    return this.handleRequest(
      { cmd: 'delete_category' },
      { categoryId: parseInt(categoryId) },
      'Failed to delete category',
    );
  }
}
