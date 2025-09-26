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
}



