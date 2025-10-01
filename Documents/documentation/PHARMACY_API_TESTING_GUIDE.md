# Pharmacy API Testing Guide

## Setup Instructions

### 1. Database Setup
First, you need to set up your PostgreSQL database:

```sql
-- Create the pharmacy service database
CREATE DATABASE pharmacy_service;

-- Connect to the database
\c pharmacy_service;
```

### 2. Environment Variables
Create a `.env` file in the root directory with:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password
DB_NAME=pharmacy_service

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672

# Node Environment
NODE_ENV=development
```

### 3. Start Services
```bash
# Install dependencies
npm install

# Start all services
npm run start:backend

# Or start individual services
npm run start:gateway
npm run start:pharmacy
```

## API Endpoints for Testing

**Base URL**: `http://localhost:3000`

### Public APIs (No Authentication Required)

#### 1. Get Top Pharmacies
```http
GET /pharmacy?page=1&limit=10&sortBy=rating&sortOrder=DESC
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort by 'rating', 'total_sales', or 'name' (default: 'rating')
- `sortOrder` (optional): 'ASC' or 'DESC' (default: 'DESC')

**Example Response:**
```json
{
  "success": true,
  "data": {
    "pharmacies": [...],
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "message": "Operation successful"
}
```

#### 2. Search Pharmacies and Products
```http
GET /pharmacy/search?query=aspirin&category=medicine&minPrice=10&maxPrice=50&page=1&limit=10
```

**Query Parameters:**
- `query` (optional): Search term for pharmacy names or product names
- `category` (optional): Filter by product category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `page` (optional): Page number
- `limit` (optional): Items per page

#### 3. Get Non-Prescription Products
```http
GET /pharmacy/products?page=1&limit=10
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

#### 4. Get Product Categories
```http
GET /pharmacy/categories
```

#### 5. Get Pharmacy by ID
```http
GET /pharmacy/1
```

### Protected APIs (Authentication Required)

**Note**: For protected APIs, you need to include the Authorization header:
```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### 6. Get Current Orders Count
```http
GET /pharmacy/orders/current-count
```

#### 7. Get Patient Prescriptions
```http
GET /pharmacy/prescriptions?page=1&limit=10&sortBy=date_issued&sortOrder=DESC
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `sortBy` (optional): Sort field (default: 'date_issued')
- `sortOrder` (optional): 'ASC' or 'DESC' (default: 'DESC')

#### 8. Search Medicines by Prescription
```http
POST /pharmacy/search/prescription
Content-Type: application/json

{
  "prescriptionId": 1,
  "page": 1,
  "limit": 10
}
```

#### 9. Create Reservation (Prescription Medicines)
```http
POST /pharmacy/reservations
Content-Type: application/json

{
  "pharmacy_branch_id": 1,
  "medicine_id": 1,
  "quantity_reserved": 2,
  "prescription_id": 1,
  "pickup_deadline": "2024-01-15",
  "notes": "Please prepare for pickup"
}
```

#### 10. Create Order (Non-Prescription Items)
```http
POST /pharmacy/orders
Content-Type: application/json

{
  "pharmacy_branch_id": 1,
  "items": [
    {
      "item_id": 1,
      "quantity": 2,
      "instructions": "Handle with care"
    },
    {
      "item_id": 2,
      "quantity": 1
    }
  ],
  "delivery_method": "delivery",
  "address_id": 1,
  "payment_method": "credit_card",
  "notes": "Please deliver in the morning"
}
```

#### 11. Get Patient Orders
```http
GET /pharmacy/orders/my-orders?status=pending&page=1&limit=10
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `page` (optional): Page number
- `limit` (optional): Items per page

#### 12. Update Order Status
```http
PUT /pharmacy/orders/1/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

#### 13. Cancel Reservation
```http
PUT /pharmacy/reservations/1/cancel
```

## Testing with cURL

### Public APIs
```bash
# Get pharmacies
curl -X GET "http://localhost:3000/pharmacy?page=1&limit=5"

# Search products
curl -X GET "http://localhost:3000/pharmacy/search?query=aspirin"

# Get categories
curl -X GET "http://localhost:3000/pharmacy/categories"
```

### Protected APIs (with token)
```bash
# Get current orders count
curl -X GET "http://localhost:3000/pharmacy/orders/current-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create order
curl -X POST "http://localhost:3000/pharmacy/orders" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pharmacy_branch_id": 1,
    "items": [{"item_id": 1, "quantity": 2}],
    "delivery_method": "pickup",
    "payment_method": "cash"
  }'
```

## Testing with Postman

1. **Import Collection**: Use the provided Postman collection
2. **Set Environment Variables**:
   - `base_url`: `http://localhost:3000`
   - `auth_token`: Your JWT token
3. **Test Public APIs**: No authentication needed
4. **Test Protected APIs**: Include `Authorization: Bearer {{auth_token}}` header

## Sample Data for Testing

### Create Sample Categories
```sql
INSERT INTO categories (category_name) VALUES 
('Pain Relief'),
('Antibiotics'),
('Vitamins'),
('First Aid'),
('Cold & Flu');
```

### Create Sample Items
```sql
INSERT INTO items (category_id, name, manufacturer, description) VALUES 
(1, 'Aspirin 500mg', 'Bayer', 'Pain relief medication'),
(2, 'Amoxicillin 250mg', 'Generic', 'Antibiotic medication'),
(3, 'Vitamin C 1000mg', 'Nature Made', 'Immune system support');
```

### Create Sample Pharmacies
```sql
INSERT INTO pharmacies (user_id, pharmacy_owner, pharmacy_name) VALUES 
(1, 'John Smith', 'City Pharmacy'),
(2, 'Jane Doe', 'Health Plus Pharmacy');
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "status": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Status Codes

- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Notes

1. **Database**: Make sure PostgreSQL is running and the `pharmacy_service` database exists
2. **RabbitMQ**: Ensure RabbitMQ is running for microservice communication
3. **Authentication**: Get a valid JWT token from the auth service for protected endpoints
4. **CORS**: The gateway should handle CORS for frontend integration
5. **Rate Limiting**: Consider implementing rate limiting for production use
