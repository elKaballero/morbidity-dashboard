require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function initDB() {

    console.log('Iniciando configuración de la base de datos...');
    
    // Aiven requiere SSL. Forzamos bypass de validación para el script de inicialización.
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });


    try {
        console.log('Conectando a Aiven PostgreSQL...');
        await client.connect();

        console.log('Leyendo archivo schema.sql...');
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('Ejecutando sentencias SQL para crear tablas...');
        await client.query(schema);

        const sampleDataPath = path.join(__dirname, 'sample_data.sql');
        if (fs.existsSync(sampleDataPath)) {
            console.log('Leyendo archivo sample_data.sql...');
            const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
            console.log('Insertando datos de prueba...');
            await client.query(sampleData);
            console.log('✅ ¡Tablas creadas y datos de prueba insertados correctamente!');
        } else {
            console.log('✅ ¡Las tablas se crearon correctamente!');
        }

    } catch (err) {
        console.error('❌ Error al inicializar la base de datos:', err);
    } finally {
        await client.end();
        console.log('Conexión cerrada.');
    }
}

initDB();
