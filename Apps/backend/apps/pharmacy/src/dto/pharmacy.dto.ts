import { IsOptional, IsNumber, IsString, IsBoolean, IsDate, IsArray, ValidateNested, Min, Max, Length, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPharmaciesDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'rating' | 'total_sales' | 'name' = 'rating';

  @IsOptional()
  @IsString()
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

// ==================== ITEM MANAGEMENT DTOs ====================

export class CreateItemDto {
  @IsNumber()
  @IsPositive()
  category_id: number;

  @IsString()
  @Length(1, 150)
  name: string;

  @IsString()
  @Length(1, 150)
  manufacturer: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}

export class UpdateItemDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  category_id?: number;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image_url?: string;
}

export class CreateMedicineDto {
  @IsNumber()
  @IsPositive()
  item_id: number;

  @IsBoolean()
  prescription_required: boolean;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsString()
  @Length(1, 50)
  type: string;

  @IsString()
  @Length(1, 50)
  dosage: string;
}

export class UpdateMedicineDto {
  @IsOptional()
  @IsBoolean()
  prescription_required?: boolean;

  @IsOptional()
  @IsBoolean()
  requires_approval?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  type?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  dosage?: string;
}

export class AddStockDto {
  @IsNumber()
  @IsPositive()
  pharmacy_branch_id: number;

  @IsNumber()
  @IsPositive()
  item_id: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @IsPositive()
  initial_price: number;

  @IsNumber()
  @IsPositive()
  sold_price: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry_date?: Date;
}

export class UpdateStockDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  initial_price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  sold_price?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiry_date?: Date;
}

export class CreateCategoryDto {
  @IsString()
  @Length(1, 100)
  category_name: string;
}

export class UpdateCategoryDto {
  @IsString()
  @Length(1, 100)
  category_name: string;
}




