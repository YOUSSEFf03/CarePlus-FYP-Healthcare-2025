-- Pharmacy Service Database Setup Script
-- Run this script to set up the database for the pharmacy microservice

-- Create database (run this as superuser)
-- CREATE DATABASE pharmacy_service;

-- Connect to pharmacy_service database and run the following:

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pharmacies (
    pharmacy_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    pharmacy_owner VARCHAR(100) NOT NULL,
    pharmacy_name VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacies_branches (
    pharmacy_branch_id SERIAL PRIMARY KEY,
    pharmacy_id INTEGER REFERENCES pharmacies(pharmacy_id),
    branch_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    branch_manager VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    pharmacy_branch_id INTEGER REFERENCES pharmacies_branches(pharmacy_branch_id),
    building_name VARCHAR(100),
    building_number VARCHAR(50),
    floor_number VARCHAR(20),
    street VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zipcode VARCHAR(20),
    area_description TEXT,
    maps_link TEXT
);

CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
    item_id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(category_id),
    name VARCHAR(150) NOT NULL,
    manufacturer VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicines (
    medicine_id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES items(item_id),
    prescription_required BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT FALSE,
    type VARCHAR(50) NOT NULL,
    dosage VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS pharmacy_branch_stock (
    pharmacy_branch_stock_id SERIAL PRIMARY KEY,
    pharmacy_branch_id INTEGER REFERENCES pharmacies_branches(pharmacy_branch_id),
    item_id INTEGER REFERENCES items(item_id),
    quantity INTEGER NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    initial_price DECIMAL(10,2) NOT NULL,
    sold_price DECIMAL(10,2) NOT NULL,
    expiry_date DATE
);

CREATE TABLE IF NOT EXISTS reservations (
    reservation_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    pharmacy_branch_id INTEGER REFERENCES pharmacies_branches(pharmacy_branch_id),
    medicine_id INTEGER REFERENCES medicines(medicine_id),
    prescription_id INTEGER,
    quantity_reserved INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'reserved',
    reserved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_deadline DATE,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    pharmacy_branch_id INTEGER REFERENCES pharmacies_branches(pharmacy_branch_id),
    prescription_id INTEGER,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS orders_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    item_id INTEGER REFERENCES items(item_id),
    quantity INTEGER NOT NULL,
    discount_applied DECIMAL(5,2),
    instructions TEXT
);

CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    address_id INTEGER REFERENCES addresses(address_id),
    delivery_method VARCHAR(50) NOT NULL,
    delivery_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    scheduled_date DATE,
    delivered_date DATE,
    tracking_number VARCHAR(100)
);

-- Insert sample data
INSERT INTO categories (category_name) VALUES 
('Pain Relief'),
('Antibiotics'),
('Vitamins'),
('First Aid'),
('Cold & Flu'),
('Digestive Health'),
('Skin Care'),
('Eye Care')
ON CONFLICT DO NOTHING;

-- Insert sample users
INSERT INTO users (name, email, password, phone, role) VALUES 
('John Smith', 'john@citypharmacy.com', '$2b$10$example', '+1234567890', 'pharmacy_owner'),
('Jane Doe', 'jane@healthplus.com', '$2b$10$example', '+1234567891', 'pharmacy_owner'),
('Patient User', 'patient@example.com', '$2b$10$example', '+1234567892', 'patient')
ON CONFLICT (email) DO NOTHING;

-- Insert sample pharmacies
INSERT INTO pharmacies (user_id, pharmacy_owner, pharmacy_name) VALUES 
(1, 'John Smith', 'City Pharmacy'),
(2, 'Jane Doe', 'Health Plus Pharmacy')
ON CONFLICT DO NOTHING;

-- Insert sample pharmacy branches
INSERT INTO pharmacies_branches (pharmacy_id, branch_name, phone, branch_manager) VALUES 
(1, 'City Pharmacy Downtown', '+1234567890', 'John Smith'),
(1, 'City Pharmacy Mall', '+1234567891', 'Mike Johnson'),
(2, 'Health Plus Main', '+1234567892', 'Jane Doe')
ON CONFLICT DO NOTHING;

-- Insert sample addresses
INSERT INTO addresses (pharmacy_branch_id, street, city, state, country, zipcode) VALUES 
(1, '123 Main St', 'New York', 'NY', 'USA', '10001'),
(2, '456 Mall Ave', 'New York', 'NY', 'USA', '10002'),
(3, '789 Health Blvd', 'New York', 'NY', 'USA', '10003')
ON CONFLICT DO NOTHING;

-- Insert sample items
INSERT INTO items (category_id, name, manufacturer, description) VALUES 
(1, 'Aspirin 500mg', 'Bayer', 'Pain relief and anti-inflammatory medication'),
(1, 'Ibuprofen 400mg', 'Advil', 'Non-steroidal anti-inflammatory drug'),
(2, 'Amoxicillin 250mg', 'Generic', 'Broad-spectrum antibiotic'),
(2, 'Ciprofloxacin 500mg', 'Generic', 'Fluoroquinolone antibiotic'),
(3, 'Vitamin C 1000mg', 'Nature Made', 'Immune system support and antioxidant'),
(3, 'Vitamin D3 2000IU', 'Nature Made', 'Bone health and immune support'),
(4, 'Band-Aids', 'Johnson & Johnson', 'Adhesive bandages for minor cuts'),
(4, 'Antiseptic Solution', 'Betadine', 'Topical antiseptic for wound cleaning'),
(5, 'Cold Relief Tablets', 'Tylenol', 'Multi-symptom cold relief'),
(5, 'Cough Syrup', 'Robitussin', 'Cough suppressant and expectorant')
ON CONFLICT DO NOTHING;

-- Insert sample medicines
INSERT INTO medicines (item_id, prescription_required, requires_approval, type, dosage) VALUES 
(1, FALSE, FALSE, 'tablet', '500mg'),
(2, FALSE, FALSE, 'tablet', '400mg'),
(3, TRUE, TRUE, 'capsule', '250mg'),
(4, TRUE, TRUE, 'tablet', '500mg'),
(5, FALSE, FALSE, 'tablet', '1000mg'),
(6, FALSE, FALSE, 'softgel', '2000IU'),
(7, FALSE, FALSE, 'bandage', 'various sizes'),
(8, FALSE, FALSE, 'solution', '10% povidone-iodine'),
(9, FALSE, FALSE, 'tablet', 'multi-symptom'),
(10, FALSE, FALSE, 'syrup', '15ml')
ON CONFLICT DO NOTHING;

-- Insert sample stock
INSERT INTO pharmacy_branch_stock (pharmacy_branch_id, item_id, quantity, initial_price, sold_price, expiry_date) VALUES 
(1, 1, 100, 5.00, 7.50, '2025-12-31'),
(1, 2, 80, 6.00, 9.00, '2025-11-30'),
(1, 3, 50, 15.00, 22.50, '2025-10-31'),
(1, 5, 200, 8.00, 12.00, '2026-01-31'),
(1, 7, 500, 3.00, 4.50, '2026-06-30'),
(2, 1, 75, 5.00, 7.50, '2025-12-31'),
(2, 4, 30, 20.00, 30.00, '2025-09-30'),
(2, 6, 150, 12.00, 18.00, '2026-02-28'),
(2, 9, 100, 10.00, 15.00, '2025-08-31'),
(3, 2, 60, 6.00, 9.00, '2025-11-30'),
(3, 5, 120, 8.00, 12.00, '2026-01-31'),
(3, 8, 80, 5.00, 7.50, '2025-07-31'),
(3, 10, 40, 8.00, 12.00, '2025-12-31')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacies_user_id ON pharmacies(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_branches_pharmacy_id ON pharmacies_branches(pharmacy_id);
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_medicines_item_id ON medicines(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_pharmacy_branch_id ON pharmacy_branch_stock(pharmacy_branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_item_id ON pharmacy_branch_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_orders_patient_id ON orders(patient_id);
CREATE INDEX IF NOT EXISTS idx_orders_pharmacy_branch_id ON orders(pharmacy_branch_id);
CREATE INDEX IF NOT EXISTS idx_reservations_patient_id ON reservations(patient_id);
CREATE INDEX IF NOT EXISTS idx_reservations_pharmacy_branch_id ON reservations(pharmacy_branch_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
