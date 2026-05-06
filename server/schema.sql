-- schema.sql
-- In PostgreSQL, you usually connect directly to the target database.
-- Create the database manually if needed, e.g.: CREATE DATABASE gersalud_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- For future bcrypt integration
    role VARCHAR(20) NOT NULL DEFAULT 'branch',
    branch_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Morbidity Reports Table
-- Design: We will store the nested objects as JSON columns for flexibility and easy passing to the frontend
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    branch VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format YYYY-MM
    "workDays" INT DEFAULT 0,
    "workHours" INT DEFAULT 0,
    workers JSONB NOT NULL, -- {monthly, daily, interns, total}
    preventive JSONB NOT NULL, -- {preEmployment... etc}
    curative JSONB NOT NULL, -- {orl... etc}
    referrals JSONB NOT NULL, -- {ivss, privateLab... etc}
    activities JSONB NOT NULL, -- {workshops... etc}
    comments TEXT,
    absences JSONB DEFAULT NULL,
    demographics JSONB DEFAULT NULL,
    inventory JSONB DEFAULT NULL,
    "topDiagnoses" JSONB DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (branch, month)
);

-- Daily Logs Table for Tracking and History
CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL,
    data_payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Mock Admin User
-- Password placeholder for demonstration. We recommend bcrypt hashing in prod.
INSERT INTO users (username, password_hash, role, branch_name) 
VALUES ('admin', 'hashed_pw_here', 'master', 'Administración Global')
ON CONFLICT (username) DO NOTHING;
