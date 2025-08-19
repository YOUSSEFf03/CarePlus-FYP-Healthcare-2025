-- -- Database schema for WhatsApp Medical Appointment System
-- CREATE DATABASE whatsapp_bot_db;

-- Regions table
CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'patient',
    profile_picture_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    doctor_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending',
    region_id INTEGER REFERENCES regions(region_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinics/Workplaces table
CREATE TABLE doctor_workplaces (
    workplace_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    region_id INTEGER REFERENCES regions(region_id),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Patients table
CREATE TABLE patients (
    patient_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    medical_history TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointment slots table
CREATE TABLE appointment_slots (
    slot_id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    workplace_id INTEGER REFERENCES doctor_workplaces(workplace_id),
    date DATE NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(patient_id) ON DELETE CASCADE,
    doctor_workplace_id INTEGER REFERENCES doctor_workplaces(workplace_id),
    slot_id INTEGER REFERENCES appointment_slots(slot_id),
    appointment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'booked',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User states for conversation flow (optional, can be handled in memory)
CREATE TABLE user_states (
    user_phone VARCHAR(20) PRIMARY KEY,
    step VARCHAR(100),
    state_data JSONB,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_appointment_slots_doctor_date ON appointment_slots(doctor_id, date);
CREATE INDEX idx_appointment_slots_available ON appointment_slots(is_available);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_doctors_region ON doctors(region_id);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);