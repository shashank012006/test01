CREATE DATABASE IF NOT EXISTS lifekey_db;
USE lifekey_db;

CREATE TABLE IF NOT EXISTS patients (
    id                VARCHAR(20)   PRIMARY KEY,
    name              VARCHAR(100)  NOT NULL,
    age               INT,
    blood_group       VARCHAR(5),
    fingerprint_id    VARCHAR(20)   UNIQUE,
    allergies         JSON,
    conditions        JSON,
    medications       JSON,
    surgeries         JSON,
    emergency_contact VARCHAR(20),
    contact_name      VARCHAR(100),
    is_critical       TINYINT(1)    DEFAULT 0
);

CREATE TABLE IF NOT EXISTS doctors (
    id        VARCHAR(20)   PRIMARY KEY,
    name      VARCHAR(100)  NOT NULL,
    email     VARCHAR(100)  UNIQUE,
    password  VARCHAR(255),
    dept      VARCHAR(50)   DEFAULT 'ED'
);

CREATE TABLE IF NOT EXISTS emergency_ids (
    emergency_id  VARCHAR(20)   PRIMARY KEY,
    created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
    linked_to     VARCHAR(20)   DEFAULT NULL,
    notes         TEXT,
    qr_code       LONGTEXT,
    status        VARCHAR(20)   DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS active_admissions (
    id          INT           AUTO_INCREMENT PRIMARY KEY,
    patient_id  VARCHAR(20),
    admitted_at DATETIME      DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20)   DEFAULT 'active',
    doctor_id   VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS notifications (
    id          INT           AUTO_INCREMENT PRIMARY KEY,
    patient_id  VARCHAR(20),
    sent_to     VARCHAR(20),
    message     TEXT,
    sent_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    status      VARCHAR(20)   DEFAULT 'sent'
);

-- Sample Data
INSERT INTO patients VALUES
('PT-10245', 'Ravi Kumar',   34, 'O+',  'FP-SIM-001', '["Penicillin"]',   '["Diabetes"]',        '["Metformin 500mg"]',      '["Appendectomy 2019"]', '9876543210', 'Anita Kumar',  1),
('PT-10246', 'Priya Sharma', 28, 'A+',  'FP-SIM-002', '["None"]',         '["Asthma"]',          '["Salbutamol Inhaler"]',   '["None"]',              '9876543211', 'Rohit Sharma', 0),
('PT-10247', 'Arjun Mehta',  52, 'B-',  'FP-SIM-003', '["Aspirin"]',      '["Heart Disease"]',   '["Atorvastatin 10mg"]',    '["Angioplasty 2021"]',  '9876543212', 'Meena Mehta',  1),
('PT-10248', 'Sunita Rao',   41, 'AB+', 'FP-SIM-004', '["Sulfa Drugs"]',  '["Hypertension"]',    '["Amlodipine 5mg"]',       '["None"]',              '9876543213', 'Kiran Rao',    0),
('PT-10249', 'Vikram Das',   19, 'O-',  'FP-SIM-005', '["None"]',         '["Hemophilia"]',      '["Factor VIII"]',          '["None"]',              '9876543214', 'Suresh Das',   1)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO doctors VALUES
('DR-001', 'Dr. Anil Kapoor', 'doctor@lifekey.com', 'demo123', 'ED'),
('DR-002', 'Nurse Priya',     'nurse@lifekey.com',  'demo123', 'ED')
ON DUPLICATE KEY UPDATE id=id;
