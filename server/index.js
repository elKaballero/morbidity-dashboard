const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// 1. Authentication (Basic Mock -> SQL)
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const { rows } = await pool.query('SELECT username, role, branch_name as "branchName" FROM users WHERE username = $1', [username]);
        
        if (rows.length > 0) {
            // Found in DB. Ignoring password check for now as requested by demonstration scope
            // Use bcrypt.compare in production
            return res.json({ success: true, user: rows[0] });
        } else {
            // Fallback mock logic for testing unseeded branches
            let role = 'branch';
            let branchName = `Sucursal ${username}`;
            if (username === 'admin') {
                role = 'master';
                branchName = 'Administración Global';
            }
            return res.json({ success: true, user: { username, role, branchName } });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. Fetch Reports
app.get('/api/reports', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM reports ORDER BY month DESC, created_at DESC');
        
        // Helper to handle both stringified and object-type JSON from PG
        const parseJSON = (val) => {
            if (typeof val === 'string') {
                try { return JSON.parse(val); } catch (e) { return {}; }
            }
            return val || {};
        };

        const formattedReports = rows.map(r => ({
            ...r,
            workDays: parseInt(r.workDays, 10) || 0,
            workHours: parseInt(r.workHours, 10) || 0,
            workers: parseJSON(r.workers),
            preventive: parseJSON(r.preventive),
            curative: parseJSON(r.curative),
            referrals: parseJSON(r.referrals),
            activities: parseJSON(r.activities),
            absences: parseJSON(r.absences),
            demographics: parseJSON(r.demographics),
            inventory: parseJSON(r.inventory),
            topDiagnoses: parseJSON(r.topDiagnoses)
        }));
        res.json(formattedReports);
    } catch (error) {
        console.error('Fetch Reports Error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching reports', detail: error.message });
    }
});


// 3. Create Report
app.post('/api/reports', async (req, res) => {
    const { 
        branch, month, workDays, workHours, 
        workers, preventive, curative, referrals, activities, comments,
        absences, demographics, inventory, topDiagnoses
    } = req.body;

    try {
        const query = `
            INSERT INTO reports 
            (branch, month, "workDays", "workHours", workers, preventive, curative, referrals, activities, comments, absences, demographics, inventory, "topDiagnoses")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (branch, month) DO UPDATE SET
            "workDays" = EXCLUDED."workDays",
            "workHours" = EXCLUDED."workHours",
            workers = EXCLUDED.workers,
            preventive = EXCLUDED.preventive,
            curative = EXCLUDED.curative,
            referrals = EXCLUDED.referrals,
            activities = EXCLUDED.activities,
            comments = EXCLUDED.comments,
            absences = EXCLUDED.absences,
            demographics = EXCLUDED.demographics,
            inventory = EXCLUDED.inventory,
            "topDiagnoses" = EXCLUDED."topDiagnoses"
        `;
        
        const values = [
            branch, month, workDays, workHours,
            JSON.stringify(workers), JSON.stringify(preventive),
            JSON.stringify(curative), JSON.stringify(referrals),
            JSON.stringify(activities), comments,
            JSON.stringify(absences), JSON.stringify(demographics),
            JSON.stringify(inventory), JSON.stringify(topDiagnoses)
        ];

        await pool.query(query, values);
        res.json({ success: true, message: 'Report saved directly to SQL Database' });
    } catch (error) {
        console.error('Save Report Error:', error);
        res.status(500).json({ success: false, message: 'Server error saving report' });
    }
});

// 4. Daily Logs
app.post('/api/daily-logs', async (req, res) => {
    const { branch_name, month, data_payload } = req.body;
    try {
        await pool.query(
            'INSERT INTO daily_logs (branch_name, month, data_payload) VALUES ($1, $2, $3)',
            [branch_name, month, JSON.stringify(data_payload)]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Daily log save error:', error);
        res.status(500).json({ success: false });
    }
});

app.get('/api/daily-logs', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM daily_logs ORDER BY created_at DESC');
        res.json(rows.map(r => ({
            ...r,
            data_payload: typeof r.data_payload === 'string' ? JSON.parse(r.data_payload) : r.data_payload
        })));
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Standard listen for standard hosts (Render, Railway, VPS, etc.)
// Vercel/Serverless will ignore this and use the exported 'app'
app.listen(PORT, () => {
    console.log(`Exo Morb Server running on port ${PORT}`);
});


module.exports = app;
