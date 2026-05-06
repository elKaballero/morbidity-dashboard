-- Connect to the correct database before running these commands or use psql/pgAdmin

ALTER TABLE reports
ADD COLUMN absences JSONB DEFAULT NULL,
ADD COLUMN demographics JSONB DEFAULT NULL,
ADD COLUMN inventory JSONB DEFAULT NULL,
ADD COLUMN "topDiagnoses" JSONB DEFAULT NULL;

UPDATE reports
SET absences = '{"commonEvents": 0, "commonDays": 0, "occupationalEvents": 0, "occupationalDays": 0, "totalEvents": 0, "totalDays": 0}'::jsonb,
    demographics = '{"male": 0, "female": 0, "age18_30": 0, "age31_45": 0, "age46_plus": 0}'::jsonb,
    inventory = '{"analgesics": 0, "antiallergics": 0, "bandages": 0, "syringes": 0, "others": 0}'::jsonb,
    "topDiagnoses" = '[]'::jsonb
WHERE absences IS NULL;

CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL,
    data_payload JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
