USE lifekey_db;

-- Alter existing patients table
ALTER TABLE patients ADD COLUMN last_status VARCHAR(50) DEFAULT 'Not Admitted';
ALTER TABLE patients ADD COLUMN discharge_notes TEXT;

-- Create medication_logs table
CREATE TABLE IF NOT EXISTS medication_logs (
    id              INT           AUTO_INCREMENT PRIMARY KEY,
    patient_id      VARCHAR(20),
    changed_by      VARCHAR(20),
    old_medications JSON,
    new_medications JSON,
    reason          TEXT,
    changed_at      DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- Create treatment_history table for discharge workflow
CREATE TABLE IF NOT EXISTS treatment_history (
    id                INT           AUTO_INCREMENT PRIMARY KEY,
    patient_id        VARCHAR(20),
    admitted_at       DATETIME,
    discharged_at     DATETIME      DEFAULT CURRENT_TIMESTAMP,
    diagnosis         TEXT,
    treatment_given   TEXT,
    medications_added JSON,
    new_conditions    JSON,
    new_surgeries     JSON,
    doctor_id         VARCHAR(20),
    notes             TEXT
);

-- Create status_logs table for patient timeline display
CREATE TABLE IF NOT EXISTS status_logs (
    id            INT           AUTO_INCREMENT PRIMARY KEY,
    patient_id    VARCHAR(20),
    admission_id  INT,
    status        VARCHAR(50),
    changed_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);
