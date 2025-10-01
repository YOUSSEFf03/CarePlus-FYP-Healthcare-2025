import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

// Entities
import { Pharmacy } from './entities/pharmacy.entity';
import { PharmacyBranch } from './entities/pharmacy-branch.entity';
import { Item } from './entities/item.entity';
import { Medicine } from './entities/medicine.entity';
import { Category } from './entities/category.entity';
import { PharmacyBranchStock } from './entities/pharmacy-branch-stock.entity';
import { Reservation } from './entities/reservation.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Delivery } from './entities/delivery.entity';
import { Address } from './entities/address.entity';

// DTOs
import { 
  GetPharmaciesDto, 
  SearchPharmaciesDto, 
  SearchByPrescriptionDto,
  CreateReservationDto,
  CreateOrderDto,
  GetOrdersDto,
  GetPrescriptionsDto
} from './dto/pharmacy.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(PharmacyBranch)
    private pharmacyBranchRepository: Repository<PharmacyBranch>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Medicine)
    private medicineRepository: Repository<Medicine>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(PharmacyBranchStock)
    private stockRepository: Repository<PharmacyBranchStock>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @Inject('AUTH_SERVICE')
    private authServiceClient: ClientProxy,
  ) {}

  // Get top pharmacies (by rating or total sales)
  async getPharmacies(dto: GetPharmaciesDto) {
    const { page = 1, limit = 10, sortBy = 'rating', sortOrder = 'DESC' } = dto;
    const skip = (page - 1) * limit;

    let query = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.branches', 'branches')
      .leftJoinAndSelect('pharmacy.user', 'user')
      .where('branches.is_active = :isActive', { isActive: true });

    // Add sorting logic
    if (sortBy === 'rating') {
      // For now, we'll use a placeholder for rating since it's not in the schema
      // You might want to add a rating system later
      query = query.orderBy('pharmacy.pharmacy_name', sortOrder);
    } else if (sortBy === 'total_sales') {
      // Calculate total sales from orders
      query = query
        .leftJoin('branches.orders', 'orders')
        .addSelect('COALESCE(SUM(orders.total_amount), 0)', 'total_sales')
        .groupBy('pharmacy.pharmacy_id')
        .orderBy('total_sales', sortOrder);
    } else {
      query = query.orderBy('pharmacy.pharmacy_name', sortOrder);
    }

    const [pharmacies, total] = await query
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pharmacies,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get current orders count
  async getCurrentOrdersCount(patientId: number) {
    const count = await this.orderRepository.count({
      where: {
        patient_id: patientId,
        status: In(['pending', 'confirmed', 'processing', 'ready_for_pickup']),
      },
    });
    return { count };
  }

  // Search pharmacies and products
  async searchPharmaciesAndProducts(dto: SearchPharmaciesDto) {
    const { query, category, minPrice, maxPrice, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    let pharmacyQuery = this.pharmacyRepository
      .createQueryBuilder('pharmacy')
      .leftJoinAndSelect('pharmacy.branches', 'branches')
      .leftJoinAndSelect('pharmacy.user', 'user')
      .where('branches.is_active = :isActive', { isActive: true });

    let productQuery = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.pharmacy_stock', 'stock')
      .leftJoinAndSelect('stock.pharmacy_branch', 'branch')
      .leftJoinAndSelect('branch.pharmacy', 'pharmacy')
      .where('branch.is_active = :isActive', { isActive: true });

    if (query) {
      pharmacyQuery = pharmacyQuery.andWhere(
        '(pharmacy.pharmacy_name ILIKE :query OR pharmacy.pharmacy_owner ILIKE :query)',
        { query: `%${query}%` }
      );

      productQuery = productQuery.andWhere(
        '(item.name ILIKE :query OR item.manufacturer ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (category) {
      productQuery = productQuery.andWhere('category.category_name = :category', { category });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        productQuery = productQuery.andWhere('stock.sold_price BETWEEN :minPrice AND :maxPrice', {
          minPrice,
          maxPrice,
        });
      } else if (minPrice !== undefined) {
        productQuery = productQuery.andWhere('stock.sold_price >= :minPrice', { minPrice });
      } else if (maxPrice !== undefined) {
        productQuery = productQuery.andWhere('stock.sold_price <= :maxPrice', { maxPrice });
      }
    }

    const [pharmacies, pharmacyTotal] = await pharmacyQuery
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const [products, productTotal] = await productQuery
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      pharmacies: {
        data: pharmacies,
        total: pharmacyTotal,
        page,
        limit,
        totalPages: Math.ceil(pharmacyTotal / limit),
      },
      products: {
        data: products,
        total: productTotal,
        page,
        limit,
        totalPages: Math.ceil(productTotal / limit),
      },
    };
  }

  // Get patient prescriptions (this would typically call the doctor service)
  async getPrescriptions(patientId: number, dto: GetPrescriptionsDto) {
    const { page = 1, limit = 10, sortBy = 'date_issued', sortOrder = 'DESC' } = dto;
    
    try {
      // Call the doctor service to get prescriptions
      const prescriptions = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'get_patient_prescriptions' },
          { patientId, page, limit, sortBy, sortOrder }
        )
      );
      return prescriptions;
    } catch (error) {
      throw new Error('Failed to fetch prescriptions from doctor service');
    }
  }

  // Get products that don't require prescriptions
  async getNonPrescriptionProducts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [products, total] = await this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.medicines', 'medicine')
      .leftJoinAndSelect('item.pharmacy_stock', 'stock')
      .leftJoinAndSelect('stock.pharmacy_branch', 'branch')
      .leftJoinAndSelect('branch.pharmacy', 'pharmacy')
      .where('branch.is_active = :isActive', { isActive: true })
      .andWhere('(medicine.prescription_required = :prescriptionRequired OR medicine.prescription_required IS NULL)', {
        prescriptionRequired: false,
      })
      .andWhere('stock.quantity > :minQuantity', { minQuantity: 0 })
      .orderBy('item.name', 'ASC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Search medicines by prescription
  async searchByPrescription(patientId: number, dto: SearchByPrescriptionDto) {
    const { prescriptionId, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    try {
      // First get the prescription details from doctor service
      const prescription = await lastValueFrom(
        this.authServiceClient.send(
          { cmd: 'get_prescription_by_id' },
          { prescriptionId, patientId }
        )
      );

      if (!prescription) {
        throw new Error('Prescription not found');
      }

      // Get medicines from the prescription
      const medicineIds = prescription.medicines?.map(m => m.medicine_id) || [];

      if (medicineIds.length === 0) {
        return {
          medicines: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      const [medicines, total] = await this.medicineRepository
        .createQueryBuilder('medicine')
        .leftJoinAndSelect('medicine.item', 'item')
        .leftJoinAndSelect('item.category', 'category')
        .leftJoinAndSelect('item.pharmacy_stock', 'stock')
        .leftJoinAndSelect('stock.pharmacy_branch', 'branch')
        .leftJoinAndSelect('branch.pharmacy', 'pharmacy')
        .where('medicine.medicine_id IN (:...medicineIds)', { medicineIds })
        .andWhere('branch.is_active = :isActive', { isActive: true })
        .andWhere('stock.quantity > :minQuantity', { minQuantity: 0 })
        .orderBy('item.name', 'ASC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        medicines,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        prescription,
      };
    } catch (error) {
      throw new Error('Failed to search medicines by prescription');
    }
  }

  // Create reservation
  async createReservation(patientId: number, dto: CreateReservationDto) {
    const { pharmacy_branch_id, medicine_id, quantity_reserved, prescription_id, pickup_deadline, notes } = dto;

    // Check if medicine exists and is available
    const medicine = await this.medicineRepository.findOne({
      where: { medicine_id },
      relations: ['item'],
    });

    if (!medicine) {
      throw new Error('Medicine not found');
    }

    // Check stock availability
    const stock = await this.stockRepository.findOne({
      where: {
        pharmacy_branch_id,
        item_id: medicine.item_id,
      },
    });

    if (!stock || stock.quantity < quantity_reserved) {
      throw new Error('Insufficient stock');
    }

    // Create reservation
    const reservation = this.reservationRepository.create({
      patient_id: patientId,
      pharmacy_branch_id,
      medicine_id,
      prescription_id,
      quantity_reserved,
      status: 'reserved',
      pickup_deadline,
      notes,
    });

    const savedReservation = await this.reservationRepository.save(reservation);

    // Update stock quantity
    stock.quantity -= quantity_reserved;
    await this.stockRepository.save(stock);

    return savedReservation;
  }

  // Create order
  async createOrder(patientId: number, dto: CreateOrderDto) {
    const { pharmacy_branch_id, items, delivery_method, address_id, payment_method, notes } = dto;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const stock = await this.stockRepository.findOne({
        where: {
          pharmacy_branch_id,
          item_id: item.item_id,
        },
        relations: ['item'],
      });

      if (!stock || stock.quantity < item.quantity) {
        throw new Error(`Insufficient stock for item: ${stock?.item?.name || 'Unknown'}`);
      }

      totalAmount += stock.sold_price * item.quantity;
      orderItems.push({
        item_id: item.item_id,
        quantity: item.quantity,
        instructions: item.instructions,
      });
    }

    // Create order
    const order = this.orderRepository.create({
      patient_id: patientId,
      pharmacy_branch_id,
      order_date: new Date(),
      status: 'pending',
      payment_method,
      payment_status: 'pending',
      total_amount: totalAmount,
      notes,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    for (const orderItem of orderItems) {
      const item = this.orderItemRepository.create({
        order_id: savedOrder.order_id,
        ...orderItem,
      });
      await this.orderItemRepository.save(item);

      // Update stock
      const stock = await this.stockRepository.findOne({
        where: {
          pharmacy_branch_id,
          item_id: orderItem.item_id,
        },
      });
      stock.quantity -= orderItem.quantity;
      await this.stockRepository.save(stock);
    }

    // Create delivery if needed
    if (delivery_method === 'delivery' && address_id) {
      const delivery = this.deliveryRepository.create({
        order_id: savedOrder.order_id,
        address_id,
        delivery_method: 'delivery',
        delivery_status: 'pending',
      });
      await this.deliveryRepository.save(delivery);
    }

    return savedOrder;
  }

  // Get patient orders
  async getPatientOrders(patientId: number, dto: GetOrdersDto) {
    const { status, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;

    let query = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.pharmacy_branch', 'branch')
      .leftJoinAndSelect('branch.pharmacy', 'pharmacy')
      .leftJoinAndSelect('order.order_items', 'order_items')
      .leftJoinAndSelect('order_items.item', 'item')
      .leftJoinAndSelect('order.deliveries', 'deliveries')
      .leftJoinAndSelect('deliveries.address', 'address')
      .where('order.patient_id = :patientId', { patientId });

    if (status) {
      query = query.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await query
      .orderBy('order.order_date', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get categories
  async getCategories() {
    return await this.categoryRepository.find({
      order: { category_name: 'ASC' },
    });
  }

  // ==================== PHARMACY PROFILE APIs ====================

  // Get pharmacy profile by user ID
  async getPharmacyProfile(userId: string) {
    try {
      // Find pharmacy by user_id (convert string to number)
      const pharmacy = await this.pharmacyRepository.findOne({
        where: { user_id: parseInt(userId) },
        relations: ['user'],
      });

      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      // Return profile data
      return {
        pharmacy_id: pharmacy.pharmacy_id,
        pharmacy_name: pharmacy.pharmacy_name,
        pharmacy_owner: pharmacy.pharmacy_owner,
        user: {
          id: pharmacy.user.user_id,
          name: pharmacy.user.name,
          email: pharmacy.user.email,
          phone: pharmacy.user.phone,
          profile_picture_url: pharmacy.user.profile_picture_url,
        },
      };
    } catch (error) {
      console.error('Error getting pharmacy profile:', error);
      throw new Error('Failed to get pharmacy profile');
    }
  }

  // Update pharmacy profile
  async updatePharmacyProfile(userId: string, updateData: any) {
    try {
      // Find pharmacy by user_id (convert string to number)
      const pharmacy = await this.pharmacyRepository.findOne({
        where: { user_id: parseInt(userId) },
        relations: ['user'],
      });

      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      // Update pharmacy fields
      if (updateData.pharmacy_name) {
        pharmacy.pharmacy_name = updateData.pharmacy_name;
      }
      if (updateData.pharmacy_owner) {
        pharmacy.pharmacy_owner = updateData.pharmacy_owner;
      }
      // Remove pharmacy_license as it doesn't exist in the entity

      // Update user fields
      if (updateData.name) {
        pharmacy.user.name = updateData.name;
      }
      if (updateData.email) {
        pharmacy.user.email = updateData.email;
      }
      if (updateData.phone) {
        pharmacy.user.phone = updateData.phone;
      }
      if (updateData.profile_picture_url) {
        pharmacy.user.profile_picture_url = updateData.profile_picture_url;
      }

      // Save changes
      await this.pharmacyRepository.save(pharmacy);
      // Note: User updates should be handled by auth service

      return {
        success: true,
        message: 'Profile updated successfully',
        pharmacy: {
          pharmacy_id: pharmacy.pharmacy_id,
          pharmacy_name: pharmacy.pharmacy_name,
          pharmacy_owner: pharmacy.pharmacy_owner,
        },
        user: {
          id: pharmacy.user.user_id,
          name: pharmacy.user.name,
          email: pharmacy.user.email,
          phone: pharmacy.user.phone,
          profile_picture_url: pharmacy.user.profile_picture_url,
        },
      };
    } catch (error) {
      console.error('Error updating pharmacy profile:', error);
      throw new Error('Failed to update pharmacy profile');
    }
  }

  // ==================== PHARMACY DASHBOARD APIs ====================

  // Get pharmacy dashboard stats
  async getPharmacyDashboardStats(pharmacyId: string | number) {
    try {
      let pharmacy;

      // If pharmacyId is a string (UUID), we need to find by user relationship
      if (typeof pharmacyId === 'string') {
        // For now, let's create a mock pharmacy for testing
        // In a real app, you'd have a proper mapping between UUIDs and pharmacy IDs
        pharmacy = {
          pharmacy_id: 1, // Mock pharmacy ID
          branches: [
            { branch_id: 1 },
            { branch_id: 2 }
          ]
        };
      } else {
        // Find pharmacy by pharmacy_id
        pharmacy = await this.pharmacyRepository.findOne({
          where: { pharmacy_id: pharmacyId },
          relations: ['branches'],
        });
      }

      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      const branchIds = pharmacy.branches.map(branch => branch.branch_id);

      // Get today's date range
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

      // Get yesterday's date range for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
      const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);

      // Get last week's date range
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const startOfLastWeek = new Date(lastWeek.getFullYear(), lastWeek.getMonth(), lastWeek.getDate());
      const endOfLastWeek = new Date(today);

      // Today's sales
      const todaySales = await this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.total_amount), 0)', 'total')
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('order.order_date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
        .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
        .getRawOne();

      // Last week's sales for comparison
      const lastWeekSales = await this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.total_amount), 0)', 'total')
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('order.order_date BETWEEN :startOfLastWeek AND :endOfLastWeek', { startOfLastWeek, endOfLastWeek })
        .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
        .getRawOne();

      // Today's orders count
      const todayOrders = await this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'count')
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('order.order_date BETWEEN :startOfDay AND :endOfDay', { startOfDay, endOfDay })
        .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
        .getRawOne();

      // Last week's orders count for comparison
      const lastWeekOrders = await this.orderRepository
        .createQueryBuilder('order')
        .select('COUNT(*)', 'count')
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('order.order_date BETWEEN :startOfLastWeek AND :endOfLastWeek', { startOfLastWeek, endOfLastWeek })
        .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
        .getRawOne();

      // Prescription queue (pending reservations)
      const prescriptionQueue = await this.reservationRepository
        .createQueryBuilder('reservation')
        .select('COUNT(*)', 'count')
        .where('reservation.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('reservation.status = :status', { status: 'reserved' })
        .getRawOne();

      // Last week's prescription queue for comparison
      const lastWeekPrescriptionQueue = await this.reservationRepository
        .createQueryBuilder('reservation')
        .select('COUNT(*)', 'count')
        .where('reservation.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('reservation.status = :status', { status: 'reserved' })
        .andWhere('reservation.reserved_date BETWEEN :startOfLastWeek AND :endOfLastWeek', { startOfLastWeek, endOfLastWeek })
        .getRawOne();

      // Low-stock SKUs (quantity < 10)
      const lowStockSKUs = await this.stockRepository
        .createQueryBuilder('stock')
        .select('COUNT(*)', 'count')
        .where('stock.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('stock.quantity < :threshold', { threshold: 10 })
        .getRawOne();

      // Last week's low-stock SKUs for comparison
      const lastWeekLowStockSKUs = await this.stockRepository
        .createQueryBuilder('stock')
        .select('COUNT(*)', 'count')
        .where('stock.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('stock.quantity < :threshold', { threshold: 10 })
        .andWhere('stock.last_updated BETWEEN :startOfLastWeek AND :endOfLastWeek', { startOfLastWeek, endOfLastWeek })
        .getRawOne();

      // Calculate percentage changes
      const salesChange = lastWeekSales.total > 0 
        ? ((parseFloat(todaySales.total) - parseFloat(lastWeekSales.total)) / parseFloat(lastWeekSales.total)) * 100 
        : 0;

      const ordersChange = lastWeekOrders.count > 0 
        ? ((parseInt(todayOrders.count) - parseInt(lastWeekOrders.count)) / parseInt(lastWeekOrders.count)) * 100 
        : 0;

      const prescriptionChange = lastWeekPrescriptionQueue.count > 0 
        ? ((parseInt(prescriptionQueue.count) - parseInt(lastWeekPrescriptionQueue.count)) / parseInt(lastWeekPrescriptionQueue.count)) * 100 
        : 0;

      const lowStockChange = lastWeekLowStockSKUs.count > 0 
        ? ((parseInt(lowStockSKUs.count) - parseInt(lastWeekLowStockSKUs.count)) / parseInt(lastWeekLowStockSKUs.count)) * 100 
        : 0;

      return {
        sales: {
          today: parseFloat(todaySales.total),
          change: salesChange,
          timeframe: '7d'
        },
        orders: {
          today: parseInt(todayOrders.count),
          change: ordersChange,
          timeframe: '7d'
        },
        prescriptionQueue: {
          current: parseInt(prescriptionQueue.count),
          change: prescriptionChange,
          timeframe: '7d'
        },
        lowStockSKUs: {
          current: parseInt(lowStockSKUs.count),
          change: lowStockChange,
          timeframe: '7d'
        }
      };
    } catch (error) {
      console.error('Error getting pharmacy dashboard stats:', error);
      throw new Error('Failed to get pharmacy dashboard stats');
    }
  }

  // Get top-selling products for pharmacy
  async getTopSellingProducts(pharmacyId: string | number, limit: number = 5) {
    try {
      let pharmacy;

      // If pharmacyId is a string (UUID), we need to find by user relationship
      if (typeof pharmacyId === 'string') {
        // For now, let's create a mock pharmacy for testing
        pharmacy = {
          pharmacy_id: 1, // Mock pharmacy ID
          branches: [
            { branch_id: 1 },
            { branch_id: 2 }
          ]
        };
      } else {
        // Find pharmacy by pharmacy_id
        pharmacy = await this.pharmacyRepository.findOne({
          where: { pharmacy_id: pharmacyId },
          relations: ['branches'],
        });
      }

      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      const branchIds = pharmacy.branches.map(branch => branch.branch_id);

      // Get top-selling products from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const topProducts = await this.orderItemRepository
        .createQueryBuilder('orderItem')
        .leftJoin('orderItem.order', 'order')
        .leftJoin('orderItem.item', 'item')
        .leftJoin('order.pharmacy_branch', 'branch')
        .leftJoin('branch.stock', 'stock')
        .select([
          'item.item_id',
          'item.name',
          'SUM(orderItem.quantity) as "unitsSold"',
          'SUM(orderItem.quantity * stock.sold_price) as "revenue"'
        ])
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .andWhere('order.order_date >= :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere('order.status != :cancelled', { cancelled: 'cancelled' })
        .andWhere('stock.item_id = item.item_id')
        .groupBy('item.item_id, item.name')
        .orderBy('"unitsSold"', 'DESC')
        .limit(limit)
        .getRawMany();

      return topProducts.map(product => ({
        product_id: product.item_item_id,
        name: product.item_name,
        units_sold: parseInt(product.unitsSold),
        revenue: parseFloat(product.revenue)
      }));
    } catch (error) {
      console.error('Error getting top-selling products:', error);
      throw new Error('Failed to get top-selling products');
    }
  }

  // Get recent activity (orders and reservations)
  async getRecentActivity(pharmacyId: string | number, limit: number = 10) {
    try {
      let pharmacy;

      // If pharmacyId is a string (UUID), we need to find by user relationship
      if (typeof pharmacyId === 'string') {
        // For now, let's create a mock pharmacy for testing
        pharmacy = {
          pharmacy_id: 1, // Mock pharmacy ID
          branches: [
            { branch_id: 1 },
            { branch_id: 2 }
          ]
        };
      } else {
        // Find pharmacy by pharmacy_id
        pharmacy = await this.pharmacyRepository.findOne({
          where: { pharmacy_id: pharmacyId },
          relations: ['branches'],
        });
      }

      if (!pharmacy) {
        throw new Error('Pharmacy not found');
      }

      const branchIds = pharmacy.branches.map(branch => branch.branch_id);

      // Get recent orders
      const recentOrders = await this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.pharmacy_branch', 'branch')
        .leftJoin('order.deliveries', 'delivery')
        .select([
          'order.order_id',
          'order.patient_id',
          'order.status',
          'order.total_amount',
          'order.order_date',
          'delivery.delivery_method'
        ])
        .where('order.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .orderBy('order.order_date', 'DESC')
        .limit(limit)
        .getMany();

      // Get recent reservations
      const recentReservations = await this.reservationRepository
        .createQueryBuilder('reservation')
        .leftJoin('reservation.pharmacy_branch', 'branch')
        .leftJoin('reservation.medicine', 'medicine')
        .leftJoin('medicine.item', 'item')
        .select([
          'reservation.reservation_id',
          'reservation.patient_id',
          'reservation.status',
          'reservation.quantity_reserved',
          'reservation.reserved_date',
          'item.name'
        ])
        .where('reservation.pharmacy_branch_id IN (:...branchIds)', { branchIds })
        .orderBy('reservation.reserved_date', 'DESC')
        .limit(limit)
        .getMany();

      // Combine and format the results
      const activities = [];

      // Add orders
      recentOrders.forEach(order => {
        activities.push({
          id: `ORD-${order.order_id}`,
          type: 'order',
          patient_id: order.patient_id,
          status: order.status,
          total: order.total_amount,
          date: order.order_date,
          delivery_method: order.deliveries?.[0]?.delivery_method || 'pickup'
        });
      });

      // Add reservations
      recentReservations.forEach(reservation => {
        activities.push({
          id: `RES-${reservation.reservation_id}`,
          type: 'reservation',
          patient_id: reservation.patient_id,
          status: reservation.status,
          quantity: reservation.quantity_reserved,
          date: reservation.reserved_date,
          medicine_name: reservation.medicine?.item?.name
        });
      });

      // Sort by date (most recent first) and limit
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent activity:', error);
      throw new Error('Failed to get recent activity');
    }
  }
}




