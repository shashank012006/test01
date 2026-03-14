-- New Patient Data Generation
USE lifekey_db;

-- 1. Maya Patel
INSERT INTO patients (id, name, age, blood_group, fingerprint_id, allergies, conditions, medications, surgeries, emergency_contact, contact_name, is_critical, last_status)
VALUES (
    'PT-10250', 'Maya Patel', 45, 'A-', 'FP-SIM-006', 
    '["Latex"]', '["Hyperthyroidism"]', '["Levothyroxine 50mcg"]', '["Gallbladder Removal 2018"]', 
    '9876543215', 'Raj Patel', 0, 'Under Treatment'
);
INSERT INTO active_admissions (patient_id, status) VALUES ('PT-10250', 'Under Treatment');
SET @last_admin_id = LAST_INSERT_ID();
INSERT INTO status_logs (patient_id, admission_id, status) VALUES ('PT-10250', @last_admin_id, 'Under Treatment');

-- 2. James Chen
INSERT INTO patients (id, name, age, blood_group, fingerprint_id, allergies, conditions, medications, surgeries, emergency_contact, contact_name, is_critical, last_status)
VALUES (
    'PT-10251', 'James Chen', 62, 'O+', 'FP-SIM-007', 
    '["Ibuprofen"]', '["Type 2 Diabetes", "High Cholesterol"]', '["Metformin 1000mg", "Rosuvastatin 20mg"]', '["None"]', 
    '9876543216', 'Linda Chen', 1, 'Critical'
);
INSERT INTO active_admissions (patient_id, status) VALUES ('PT-10251', 'Critical');
SET @last_admin_id = LAST_INSERT_ID();
INSERT INTO status_logs (patient_id, admission_id, status) VALUES ('PT-10251', @last_admin_id, 'Critical');

-- 3. Sophia Williams
INSERT INTO patients (id, name, age, blood_group, fingerprint_id, allergies, conditions, medications, surgeries, emergency_contact, contact_name, is_critical, last_status)
VALUES (
    'PT-10252', 'Sophia Williams', 29, 'B+', 'FP-SIM-008', 
    '["None"]', '["Migraines"]', '["Sumatriptan 50mg"]', '["Tonsillectomy 2005"]', 
    '9876543217', 'Emma Williams', 0, 'Not Admitted'
);

-- 4. Ahmed Hassan
INSERT INTO patients (id, name, age, blood_group, fingerprint_id, allergies, conditions, medications, surgeries, emergency_contact, contact_name, is_critical, last_status)
VALUES (
    'PT-10253', 'Ahmed Hassan', 51, 'AB-', 'FP-SIM-009', 
    '["Peanuts"]', '["Atrial Fibrillation"]', '["Apixaban 5mg"]', '["Pacemaker Implantation 2023"]', 
    '9876543218', 'Fatima Hassan', 1, 'Critical'
);
INSERT INTO active_admissions (patient_id, status) VALUES ('PT-10253', 'Critical');
SET @last_admin_id = LAST_INSERT_ID();
INSERT INTO status_logs (patient_id, admission_id, status) VALUES ('PT-10253', @last_admin_id, 'Critical');

-- 5. Elena Rodriguez
INSERT INTO patients (id, name, age, blood_group, fingerprint_id, allergies, conditions, medications, surgeries, emergency_contact, contact_name, is_critical, last_status)
VALUES (
    'PT-10254', 'Elena Rodriguez', 38, 'A+', 'FP-SIM-010', 
    '["Amoxicillin"]', '["None"]', '["None"]', '["C-Section 2020"]', 
    '9876543219', 'Carlos Rodriguez', 0, 'Under Treatment'
);
INSERT INTO active_admissions (patient_id, status) VALUES ('PT-10254', 'Under Treatment');
SET @last_admin_id = LAST_INSERT_ID();
INSERT INTO status_logs (patient_id, admission_id, status) VALUES ('PT-10254', @last_admin_id, 'Under Treatment');
