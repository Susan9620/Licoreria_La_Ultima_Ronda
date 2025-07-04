const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Verificar que las variables de entorno estén definidas
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3307;
const dbUser = process.env.DB_USER || 'user_sistema';
const dbPassword = process.env.DB_PASSWORD || "12345";
const dbName = process.env.DB_NAME || 'bd_licoreria';

// Mostrar información de depuración en desarrollo (sin contraseñas)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Configuración de BD:');
  console.log(`   Host: ${dbHost}`);
  console.log(`   Puerto: ${dbPort}`);
  console.log(`   Usuario: ${dbUser}`);
  console.log(`   Base de datos: ${dbName}`);
}

// Configuración de la conexión a la base de datos
const config = {
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(config);

// Comprobar conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    console.error('   Verifique que:');
    console.error('   1. El servidor MySQL esté ejecutándose en el puerto correcto');
    console.error('   2. Las credenciales en el archivo .env sean correctas');
    console.error('   3. La base de datos exista');
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};