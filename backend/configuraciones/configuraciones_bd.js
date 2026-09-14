const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Variables de entorno para la base de datos
const databaseUrl = process.env.DATABASE_URL;
const dbHost      = process.env.DB_HOST || 'localhost';
const dbPort      = process.env.DB_PORT || 5432;
const dbUser      = process.env.DB_USER || 'postgres';
const dbPassword  = process.env.DB_PASSWORD || '12345';
const dbName      = process.env.DB_NAME || 'bd_licoreria';

// Determinar si usar SSL (solo si se especifica en DB_SSL o si no es localhost en producción)
const useSSL = process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && dbHost !== 'localhost' && dbHost !== '127.0.0.1');

// Crear pool de conexiones Postgres
let pool;
if (databaseUrl) {
  pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });
} else {
  pool = new Pool({
    host:     dbHost,
    port:     dbPort,
    user:     dbUser,
    password: dbPassword,
    database: dbName,
    ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {})
  });
}

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a Postgres establecida correctamente');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Error al conectar con Postgres:', err.message);
    return false;
  }
}

module.exports = { pool, testConnection };