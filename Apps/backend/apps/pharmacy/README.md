# Pharmacy Microservice

This microservice handles all pharmacy-related operations for the FYP Healthcare 2025 system.

## Features

- **Pharmacy Management**: Get top pharmacies, search pharmacies
- **Product Management**: Search products, get non-prescription products
- **Prescription Integration**: Search medicines by prescription
- **Order Management**: Create orders, get patient orders
- **Reservation System**: Reserve prescription medicines
- **Inventory Management**: Track pharmacy branch stock

## Database Schema

The service uses the following main entities:
- Users
- Pharmacies
- Pharmacy Branches
- Items & Medicines
- Categories
- Orders & Order Items
- Reservations
- Deliveries
- Addresses

## API Endpoints

### Message Patterns (RabbitMQ)

1. `get_pharmacies` - Get top pharmacies with pagination and sorting
2. `get_current_orders_count` - Get count of current orders for a patient
3. `search_pharmacies_and_products` - Search pharmacies and products with filters
4. `get_patient_prescriptions` - Get patient prescriptions from doctor service
5. `get_non_prescription_products` - Get products that don't require prescriptions
6. `search_by_prescription` - Search medicines based on a specific prescription
7. `create_reservation` - Create a reservation for prescription medicines
8. `create_order` - Create an order for non-prescription items
9. `get_patient_orders` - Get all orders for a patient
10. `get_categories` - Get all product categories

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username (default: postgres)
- `DB_PASSWORD` - Database password (default: password)
- `DB_NAME` - Database name (default: pharmacy_service)
- `RABBITMQ_URL` - RabbitMQ connection URL (default: amqp://localhost:5672)

## Running the Service

```bash
# Install dependencies
npm install

# Start in development mode
npm run start:dev

# Build the service
npm run build

# Start in production mode
npm run start:prod
```

## Dependencies

- NestJS Framework
- TypeORM for database operations
- PostgreSQL database
- RabbitMQ for microservice communication
- RxJS for reactive programming

## Integration

This service integrates with:
- **Auth Service**: For user authentication and prescription data
- **Doctor Service**: For prescription information
- **Notification Service**: For order and reservation notifications


