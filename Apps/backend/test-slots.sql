-- Test appointment slots for the workplace
INSERT INTO appointment_slots (id, doctor_id, workplace_id, slot_date, day_of_week, start_time, end_time, is_available, appointment_id, created_at, updated_at)
VALUES 
  -- Monday slots
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '09:00:00', '09:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '09:30:00', '10:00:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '10:00:00', '10:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '13:30:00', '14:00:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '14:00:00', '14:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '15:00:00', '15:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-06', 'Monday', '16:00:00', '16:30:00', true, null, NOW(), NOW()),
  
  -- Friday slots
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '09:00:00', '09:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '09:30:00', '10:00:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '10:00:00', '10:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '13:30:00', '14:00:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '14:00:00', '14:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '15:00:00', '15:30:00', true, null, NOW(), NOW()),
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-03', 'Friday', '16:00:00', '16:30:00', true, null, NOW(), NOW()),
  
  -- Thursday slot (the one that was missing)
  (gen_random_uuid(), 'db2a4b06-ba91-4626-8ae4-21d77163da3c', '8a1f22e3-9d86-4228-9b19-16d6f876554f', '2025-10-02', 'Thursday', '12:00:00', '12:30:00', true, null, NOW(), NOW());
