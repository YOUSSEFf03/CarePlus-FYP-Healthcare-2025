-- Seed data for MediBook WhatsApp Bot Database
\c medibook;

-- Clear existing data (optional, but good for reset)
TRUNCATE TABLE appointments, appointment_slots, patients, doctor_workplaces, doctors, users, regions RESTART IDENTITY CASCADE;

-- Insert regions
INSERT INTO regions (region_id, name) VALUES
(1, 'Downtown'),
(2, 'Westside'),
(3, 'East District'),
(4, 'North Quarter'),
(5, 'South District');

-- Insert admin user
INSERT INTO users (user_id, phone, name, email, role, profile_picture_url) VALUES
(1, '+96171522745', 'Admin User', 'admin@medibook.com', 'admin', ''),
(2, '+12345678901', 'System Bot', 'bot@medibook.com', 'admin', '');

-- Insert doctor users
INSERT INTO users (user_id, phone, name, email, role, profile_picture_url) VALUES
(3, '+96170123456', 'Dr. Sarah Smith', 'dr.smith@cardiology.com', 'doctor', ''),
(4, '+96170234567', 'Dr. Michael Johnson', 'dr.johnson@pediatrics.com', 'doctor', ''),
(5, '+96170345678', 'Dr. Emily Lee', 'dr.lee@orthopedics.com', 'doctor', ''),
(6, '+96170456789', 'Dr. Robert Brown', 'dr.brown@dermatology.com', 'doctor', ''),
(7, '+96170567890', 'Dr. Maria Garcia', 'dr.garcia@neurology.com', 'doctor', '');

-- Insert doctors
INSERT INTO doctors (doctor_id, user_id, name, specialization, license_number, verification_status, region_id) VALUES
(1, 3, 'Dr. Sarah Smith', 'Cardiology', 'MD12345', 'verified', 1),
(2, 4, 'Dr. Michael Johnson', 'Pediatrics', 'MD67890', 'verified', 1),
(3, 5, 'Dr. Emily Lee', 'Orthopedics', 'MD54321', 'verified', 2),
(4, 6, 'Dr. Robert Brown', 'Dermatology', 'MD13579', 'verified', 3),
(5, 7, 'Dr. Maria Garcia', 'Neurology', 'MD24680', 'verified', 4);

-- Insert clinics/workplaces
INSERT INTO doctor_workplaces (workplace_id, doctor_id, name, type, region_id, phone, address) VALUES
(1, 1, 'City Heart Center', 'clinic', 1, '+9611123456', '123 Main Street, Downtown'),
(2, 2, 'Pediatric Care Clinic', 'clinic', 1, '+9611123457', '456 Oak Avenue, Downtown'),
(3, 3, 'Westside Orthopedics', 'hospital', 2, '+9611123458', '789 Pine Road, Westside'),
(4, 4, 'Skin Health Clinic', 'clinic', 3, '+9611123459', '321 Elm Street, East District'),
(5, 5, 'NeuroCare Center', 'hospital', 4, '+9611123460', '654 Maple Avenue, North Quarter'),
(6, 1, 'Cardiac Specialists', 'hospital', 1, '+9611123461', '987 Cedar Lane, Downtown'),
(7, 3, 'Bone & Joint Institute', 'clinic', 2, '+9611123462', '159 Birch Street, Westside');

-- Insert sample patients (these would be created via WhatsApp registration)
INSERT INTO users (user_id, phone, name, email, role, profile_picture_url) VALUES
(8, '+96170987654', 'John Doe', 'john.doe@email.com', 'patient', ''),
(9, '+96170876543', 'Jane Smith', 'jane.smith@email.com', 'patient', ''),
(10, '+96170765432', 'Alice Johnson', 'alice.johnson@email.com', 'patient', '');

INSERT INTO patients (patient_id, user_id, date_of_birth, gender, medical_history) VALUES
(1, 8, '1985-03-15', 'male', 'No significant medical history'),
(2, 9, '1990-07-22', 'female', 'Asthma, allergic to penicillin'),
(3, 10, '1978-11-30', 'female', 'Hypertension, diabetes type 2');

-- Generate appointment slots for the next 14 days
INSERT INTO appointment_slots (slot_id, doctor_id, workplace_id, date, start_time, end_time, is_available) VALUES
-- Day 1 - Dr. Smith (Cardiology)
(1, 1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '09:00', CURRENT_DATE + INTERVAL '1 day' + TIME '09:30', true),
(2, 1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '09:30', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', true),
(3, 1, 1, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '10:00', CURRENT_DATE + INTERVAL '1 day' + TIME '10:30', true),

-- Day 1 - Dr. Johnson (Pediatrics)
(4, 2, 2, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '14:00', CURRENT_DATE + INTERVAL '1 day' + TIME '14:30', true),
(5, 2, 2, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '14:30', CURRENT_DATE + INTERVAL '1 day' + TIME '15:00', true),
(6, 2, 2, CURRENT_DATE + INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day' + TIME '15:00', CURRENT_DATE + INTERVAL '1 day' + TIME '15:30', true),

-- Day 2 - Dr. Lee (Orthopedics)
(7, 3, 3, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days' + TIME '10:00', CURRENT_DATE + INTERVAL '2 days' + TIME '10:30', true),
(8, 3, 3, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days' + TIME '10:30', CURRENT_DATE + INTERVAL '2 days' + TIME '11:00', true),
(9, 3, 3, CURRENT_DATE + INTERVAL '2 days', CURRENT_DATE + INTERVAL '2 days' + TIME '11:00', CURRENT_DATE + INTERVAL '2 days' + TIME '11:30', true),

-- Day 3 - Dr. Brown (Dermatology)
(10, 4, 4, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days' + TIME '13:00', CURRENT_DATE + INTERVAL '3 days' + TIME '13:30', true),
(11, 4, 4, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days' + TIME '13:30', CURRENT_DATE + INTERVAL '3 days' + TIME '14:00', true),
(12, 4, 4, CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '3 days' + TIME '14:00', CURRENT_DATE + INTERVAL '3 days' + TIME '14:30', true),

-- Day 4 - Dr. Garcia (Neurology)
(13, 5, 5, CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE + INTERVAL '4 days' + TIME '09:00', CURRENT_DATE + INTERVAL '4 days' + TIME '09:30', true),
(14, 5, 5, CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE + INTERVAL '4 days' + TIME '09:30', CURRENT_DATE + INTERVAL '4 days' + TIME '10:00', true),
(15, 5, 5, CURRENT_DATE + INTERVAL '4 days', CURRENT_DATE + INTERVAL '4 days' + TIME '10:00', CURRENT_DATE + INTERVAL '4 days' + TIME '10:30', true);

-- Insert sample appointments
INSERT INTO appointments (appointment_id, patient_id, doctor_workplace_id, slot_id, status, notes) VALUES
(1, 1, 1, 1, 'CONFIRMED', 'Routine heart checkup'),
(2, 2, 2, 5, 'CONFIRMED', 'Child vaccination'),
(3, 3, 3, 8, 'completed', 'Knee pain consultation');

-- Mark the booked slots as unavailable
UPDATE appointment_slots SET is_available = false WHERE slot_id IN (1, 5, 8);

-- Reset all sequences to avoid conflicts
SELECT setval('regions_region_id_seq', (SELECT MAX(region_id) FROM regions));
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));
SELECT setval('doctors_doctor_id_seq', (SELECT MAX(doctor_id) FROM doctors));
SELECT setval('doctor_workplaces_workplace_id_seq', (SELECT MAX(workplace_id) FROM doctor_workplaces));
SELECT setval('patients_patient_id_seq', (SELECT MAX(patient_id) FROM patients));
SELECT setval('appointment_slots_slot_id_seq', (SELECT MAX(slot_id) FROM appointment_slots));
SELECT setval('appointments_appointment_id_seq', (SELECT MAX(appointment_id) FROM appointments));

-- Display summary of inserted data
SELECT 
  (SELECT COUNT(*) FROM regions) as regions_count,
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM doctors) as doctors_count,
  (SELECT COUNT(*) FROM doctor_workplaces) as workplaces_count,
  (SELECT COUNT(*) FROM patients) as patients_count,
  (SELECT COUNT(*) FROM appointment_slots) as slots_count,
  (SELECT COUNT(*) FROM appointments) as appointments_count;