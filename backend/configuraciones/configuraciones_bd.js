const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Variables de entorno para la base de datos
const dbHost     = process.env.DB_HOST;
const dbPort     = process.env.DB_PORT;
const dbUser     = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName     = process.env.DB_NAME;

// Mostrar info en desarrollo (sin exponer la contraseña)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Configuración de BD Postgres:');
  console.log(`   Host: ${dbHost}`);
  console.log(`   Puerto: ${dbPort}`);
  console.log(`   Usuario: ${dbUser}`);
  console.log(`   Base de datos: ${dbName}`);
}

// Determinar si usar SSL (solo si se especifica en DB_SSL o si no es localhost en producción)
const useSSL = process.env.DB_SSL === 'true' || (process.env.NODE_ENV === 'production' && dbHost !== 'localhost' && dbHost !== '127.0.0.1');

// Crear pool de conexiones Postgres
const pool = new Pool({
  host:     dbHost,
  port:     dbPort,
  user:     dbUser,
  password: dbPassword,
  database: dbName,
  ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {})
});

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