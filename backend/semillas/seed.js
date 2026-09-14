const { pool } = require('../configuraciones/configuraciones_bd');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
  try {
    console.log('🌱 Inicializando / verificando tablas de base de datos...');

    // Crear tablas si no existen
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CATEGORÍAS" (
        "ID_Categoría" SERIAL PRIMARY KEY,
        "Nombre" VARCHAR(100) NOT NULL,
        "Descripción" TEXT,
        "Ícono" VARCHAR(100),
        "Slug" VARCHAR(150),
        "Activo" BOOLEAN DEFAULT TRUE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "IMÁGENES_CARRUSEL" (
        "ID_Imagen" SERIAL PRIMARY KEY,
        "Título" VARCHAR(200) NOT NULL,
        "Subtítulo" TEXT,
        "URL_Imagen" TEXT NOT NULL,
        "Enlace_Principal" TEXT,
        "Orden" INTEGER DEFAULT 1,
        "Activo" BOOLEAN DEFAULT TRUE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "PRODUCTOS" (
        "ID_Producto" SERIAL PRIMARY KEY,
        "ID_Categoría" INTEGER REFERENCES "CATEGORÍAS"("ID_Categoría") ON DELETE SET NULL,
        "Nombre" VARCHAR(200) NOT NULL,
        "Descripción_Corta" TEXT,
        "Slug" VARCHAR(250),
        "Descripción" TEXT,
        "Calificación" NUMERIC(3,1) DEFAULT 0.0,
        "Cómo_Disfrutarlo" TEXT,
        "Origen" VARCHAR(100),
        "Destacado" BOOLEAN DEFAULT FALSE,
        "Etiqueta" VARCHAR(50),
        "Activo" BOOLEAN DEFAULT TRUE,
        "TotalReseñas" INTEGER DEFAULT 0,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "VARIANTES_PRODUCTO" (
        "ID_Variante_Producto" SERIAL PRIMARY KEY,
        "ID_Producto" INTEGER REFERENCES "PRODUCTOS"("ID_Producto") ON DELETE CASCADE,
        "Nombre_Variante" VARCHAR(100),
        "Graduación" NUMERIC(5,2),
        "Precio" NUMERIC(10,2) NOT NULL,
        "Precio_Oferta" NUMERIC(10,2),
        "Stock" INTEGER DEFAULT 0,
        "Predeterminada" BOOLEAN DEFAULT FALSE,
        "Activo" BOOLEAN DEFAULT TRUE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "IMÁGENES_PRODUCTO" (
        "ID_Imagen" SERIAL PRIMARY KEY,
        "ID_Producto" INTEGER REFERENCES "PRODUCTOS"("ID_Producto") ON DELETE CASCADE,
        "ID_Variante" INTEGER REFERENCES "VARIANTES_PRODUCTO"("ID_Variante_Producto") ON DELETE SET NULL,
        "URL" TEXT NOT NULL,
        "Alt" VARCHAR(200),
        "Principal" BOOLEAN DEFAULT FALSE,
        "Orden" INTEGER DEFAULT 1,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "PROMOCIONES" (
        "ID_Promoción" SERIAL PRIMARY KEY,
        "Título" VARCHAR(200) NOT NULL,
        "Descripción" TEXT,
        "Fecha_Inicio" TIMESTAMP,
        "Fecha_Fin" TIMESTAMP,
        "Activo" BOOLEAN DEFAULT TRUE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "USUARIOS" (
        "ID_Usuario" SERIAL PRIMARY KEY,
        "Nombre_Completo" VARCHAR(200) NOT NULL,
        "Correo_Electrónico" VARCHAR(200) UNIQUE NOT NULL,
        "Contraseña" VARCHAR(255) NOT NULL,
        "Rol" VARCHAR(50) DEFAULT 'Cliente',
        "Teléfono" VARCHAR(50),
        "Dirección" TEXT,
        "Activo" BOOLEAN DEFAULT TRUE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "PEDIDOS" (
        "ID_Pedido" SERIAL PRIMARY KEY,
        "ID_Usuario" INTEGER REFERENCES "USUARIOS"("ID_Usuario") ON DELETE SET NULL,
        "Número_Orden" VARCHAR(100) UNIQUE,
        "Total" NUMERIC(10,2) NOT NULL,
        "Estado" VARCHAR(50) DEFAULT 'Pendiente',
        "Método_Pago" VARCHAR(50),
        "Dirección_Envío" TEXT,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "Fecha_Actualización" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "DETALLE_PEDIDO" (
        "ID_Detalle" SERIAL PRIMARY KEY,
        "ID_Pedido" INTEGER REFERENCES "PEDIDOS"("ID_Pedido") ON DELETE CASCADE,
        "ID_Producto" INTEGER REFERENCES "PRODUCTOS"("ID_Producto") ON DELETE SET NULL,
        "ID_Variante" INTEGER REFERENCES "VARIANTES_PRODUCTO"("ID_Variante_Producto") ON DELETE SET NULL,
        "Cantidad" INTEGER NOT NULL,
        "Precio_Unitario" NUMERIC(10,2) NOT NULL,
        "Subtotal" NUMERIC(10,2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "RESEÑAS" (
        "ID_Reseña" SERIAL PRIMARY KEY,
        "ID_Producto" INTEGER REFERENCES "PRODUCTOS"("ID_Producto") ON DELETE CASCADE,
        "ID_Usuario" INTEGER REFERENCES "USUARIOS"("ID_Usuario") ON DELETE SET NULL,
        "Valoración" NUMERIC(3,1) NOT NULL,
        "Comentario" TEXT,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "LISTA_DESEOS" (
        "ID_Deseo" SERIAL PRIMARY KEY,
        "ID_Usuario" INTEGER REFERENCES "USUARIOS"("ID_Usuario") ON DELETE CASCADE,
        "ID_Producto" INTEGER REFERENCES "PRODUCTOS"("ID_Producto") ON DELETE CASCADE,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("ID_Usuario", "ID_Producto")
      );

      CREATE TABLE IF NOT EXISTS "CONTACTO" (
        "ID_Contacto" SERIAL PRIMARY KEY,
        "Nombre" VARCHAR(200) NOT NULL,
        "Correo" VARCHAR(200) NOT NULL,
        "Mensaje" TEXT NOT NULL,
        "Fecha_Creación" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Leer datos iniciales
    const jsonPath = path.join(__dirname, 'datos_iniciales.json');
    if (!fs.existsSync(jsonPath)) {
      console.warn('⚠️ No se encontró datos_iniciales.json para poblar la base de datos');
      return;
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 1. Categorías
    for (const c of data.categorias || []) {
      const exists = await pool.query('SELECT "ID_Categoría" FROM "CATEGORÍAS" WHERE "ID_Categoría" = $1', [c.ID_Categoría]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "CATEGORÍAS" ("ID_Categoría", "Nombre", "Descripción", "Ícono", "Slug", "Activo")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [c.ID_Categoría, c.Nombre, c.Descripción, c.Ícono, c.Slug, c.Activo]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"CATEGORÍAS"', 'ID_Categoría'), COALESCE(max("ID_Categoría"), 1)) FROM "CATEGORÍAS"`);

    // 2. Carrusel
    for (const car of data.carrusel || []) {
      const exists = await pool.query('SELECT "ID_Imagen" FROM "IMÁGENES_CARRUSEL" WHERE "ID_Imagen" = $1', [car.ID_Imagen]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "IMÁGENES_CARRUSEL" ("ID_Imagen", "Título", "Subtítulo", "URL_Imagen", "Enlace_Principal", "Orden", "Activo")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [car.ID_Imagen, car.Título, car.Subtítulo, car.URL_Imagen, car.Enlace_Principal, car.Orden, car.Activo]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"IMÁGENES_CARRUSEL"', 'ID_Imagen'), COALESCE(max("ID_Imagen"), 1)) FROM "IMÁGENES_CARRUSEL"`);

    // 3. Productos
    for (const p of data.productos || []) {
      const exists = await pool.query('SELECT "ID_Producto" FROM "PRODUCTOS" WHERE "ID_Producto" = $1', [p.ID_Producto]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "PRODUCTOS" ("ID_Producto", "ID_Categoría", "Nombre", "Descripción_Corta", "Slug", "Descripción", "Calificación", "Cómo_Disfrutarlo", "Origen", "Destacado", "Etiqueta", "Activo")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [p.ID_Producto, p.ID_Categoría, p.Nombre, p.Descripción_Corta, p.Slug, p.Descripción, p.Calificación || 0, p.Cómo_Disfrutarlo, p.Origen, p.Destacado, p.Etiqueta, p.Activo]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"PRODUCTOS"', 'ID_Producto'), COALESCE(max("ID_Producto"), 1)) FROM "PRODUCTOS"`);

    // 4. Variantes
    for (const v of data.variantes || []) {
      const exists = await pool.query('SELECT "ID_Variante_Producto" FROM "VARIANTES_PRODUCTO" WHERE "ID_Variante_Producto" = $1', [v.ID_Variante_Producto]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "VARIANTES_PRODUCTO" ("ID_Variante_Producto", "ID_Producto", "Nombre_Variante", "Graduación", "Precio", "Precio_Oferta", "Stock", "Predeterminada", "Activo")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [v.ID_Variante_Producto, v.ID_Producto, v.Nombre_Variante, v.Graduación, v.Precio, v.Precio_Oferta, v.Stock, v.Predeterminada, v.Activo]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"VARIANTES_PRODUCTO"', 'ID_Variante_Producto'), COALESCE(max("ID_Variante_Producto"), 1)) FROM "VARIANTES_PRODUCTO"`);

    // 5. Imágenes
    for (const img of data.imagenes || []) {
      const exists = await pool.query('SELECT "ID_Imagen" FROM "IMÁGENES_PRODUCTO" WHERE "ID_Imagen" = $1', [img.ID_Imagen]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "IMÁGENES_PRODUCTO" ("ID_Imagen", "ID_Producto", "ID_Variante", "URL", "Alt", "Principal", "Orden")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [img.ID_Imagen, img.ID_Producto, img.ID_Variante, img.URL, img.Alt, img.Principal, img.Orden]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"IMÁGENES_PRODUCTO"', 'ID_Imagen'), COALESCE(max("ID_Imagen"), 1)) FROM "IMÁGENES_PRODUCTO"`);

    // 6. Promociones
    for (const promo of data.promociones || []) {
      const exists = await pool.query('SELECT "ID_Promoción" FROM "PROMOCIONES" WHERE "ID_Promoción" = $1', [promo.ID_Promoción]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO "PROMOCIONES" ("ID_Promoción", "Título", "Descripción", "Activo")
           VALUES ($1, $2, $3, $4)`,
          [promo.ID_Promoción, promo.Título, promo.Descripción, promo.Activo]
        );
      }
    }
    await pool.query(`SELECT setval(pg_get_serial_sequence('"PROMOCIONES"', 'ID_Promoción'), COALESCE(max("ID_Promoción"), 1)) FROM "PROMOCIONES"`);

    console.log('✅ Base de datos poblada / verificada exitosamente.');
  } catch (err) {
    console.error('Error durante la inicialización de la base de datos:', err);
  }
}

module.exports = { seedDatabase };

if (require.main === module) {
  seedDatabase().then(() => pool.end());
}
