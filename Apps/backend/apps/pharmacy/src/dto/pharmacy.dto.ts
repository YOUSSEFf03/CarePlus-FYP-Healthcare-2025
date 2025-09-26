export class GetPharmaciesDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: 'rating' | 'total_sales' | 'name' = 'rating';
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class SearchPharmaciesDto {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number = 1;
  limit?: number = 10;
}

export class SearchByPrescriptionDto {
  prescriptionId: number;
  page?: number = 1;
  limit?: number = 10;
}

export class CreateReservationDto {
  pharmacy_branch_id: number;
  medicine_id: number;
  quantity_reserved: number;
  prescription_id?: number;
  pickup_deadline?: Date;
  notes?: string;
}

export class CreateOrderDto {
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
}

export class GetOrdersDto {
  status?: string;
  page?: number = 1;
  limit?: number = 10;
}

export class GetPrescriptionsDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: 'date_issued' = 'date_issued';
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}


