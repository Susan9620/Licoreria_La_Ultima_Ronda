var API_BASE = window.API_BASE || '';

// Objeto principal para la página de confirmación y gestión de pedidos
const Gestión_Pedidos = {
    // Configuración
    Configuración: {
        Tiempo_Envío_Estimado: 15,
        Formato_Fecha: {
            Año: 'numeric',
            Mes: 'long',
            Día: 'numeric',
            Hora: '2-digit',
            Minuto: '2-digit'
        },
        Formato_Fecha_Corta: {
            Día: 'numeric',
            Mes: 'short',
            Año: 'numeric'
        }
    },

    // Estado
    Estado: {
        Pedido_Actual: null,
        Historial_Pedidos: [],
        Datos_Sesión: null
    },

    // Inicialización
    Inicializar: async function () {
        console.log("Inicializando página de confirmación...");

        // 1) Cargo datos de usuario
        await this.Cargar_Datos_Sesión();

        // 2) Intento cargar el pedido; si falla (404 u otro), abortamos
        try {
            await this.Cargar_Pedido_Actual();
        } catch (e) {
            console.warn("Abortando inicialización: no hay pedido válido", e);
            return;
        }

        // 3) Sólo si existe Pedido_Actual, cargo historial
        await this.Cargar_Historial_Pedidos();

        // 4) Actualizo estado y eventos
        this.Actualizar_Estado_Pedido();
        this.Inicializar_Eventos();

        console.log("Página de confirmación inicializada correctamente");
    },

    // Cargar datos del usuario de la sesión
    Cargar_Datos_Sesión: async function () {
        const Token = localStorage.getItem('Token');
        if (!Token) {
            this.Estado.Datos_Sesión = {
                Nombre_Completo: 'Cliente',
                Correo_Electrónico: 'No disponible',
                Teléfono: 'No disponible'
            };
            return;
        }

        try {
            const resp = await fetch(`${API_BASE}/api/Usuarios/me`, {
                headers: { 'Authorization': `Bearer ${Token}` }
            });
            const json = await resp.json();
            if (resp.ok && json.Éxito) {
                // Asegúrate que el controller devuelve { Nombre_Completo, Correo_Electrónico, Teléfono }
                this.Estado.Datos_Sesión = {
                    Nombre_Completo: json.Datos.Nombre_Completo,
                    Correo_Electrónico: json.Datos.Correo_Electrónico,
                    Teléfono: json.Datos.Teléfono
                };
            } else {
                throw new Error(json.Mensaje || 'No se pudo cargar perfil');
            }
        } catch (e) {
            console.error('Error cargando perfil de usuario:', e);
            this.Estado.Datos_Sesión = {
                Nombre_Completo: 'Cliente',
                Correo_Electrónico: 'No disponible',
                Teléfono: 'No disponible'
            };
        }

        console.log('Datos de sesión cargados desde API:', this.Estado.Datos_Sesión);
    },

    // Cargar el pedido actual desde localStorage
    async Cargar_Pedido_Actual() {
        const params = new URLSearchParams(window.location.search);
        const ID_Pedido = params.get('ID_Pedido');
        const Token = localStorage.getItem('Token');

        console.log('⏳ Cargar_Pedido_Actual → ID_Pedido:', ID_Pedido, '— Token existe? →', !!Token);

        if (!ID_Pedido || !Token) {
            // si no hay ID o token, redirigimos al login o home
            return window.location.href = '/html/login.html';
        }

        try {
            const resp = await fetch(`${API_BASE}/api/Pedidos/${ID_Pedido}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + Token
                }
            });
            console.log('📡 Fetch /api/Pedidos/:', resp.status);

            const json = await resp.json();
            if (!json.Éxito) throw new Error('Pedido no exitoso');

            // 1️⃣ Asigna el pedido y sus items al estado
            this.Estado.Pedido_Actual = json.Datos.Pedido;
            this.Estado.Pedido_Actual.Items = json.Datos.Items;

            console.log('📝 Datos pedidos completos:', json.Datos);
            console.log('📝 Detalle de items (completo):', JSON.stringify(json.Datos.Items, null, 2));
            console.log('📋 JSON recibido:', json);
            console.log('📝 Pedido completo (campos):', JSON.stringify(json.Datos.Pedido, null, 2));

            if (!resp.ok || !json.Éxito) {
                throw new Error(json.Mensaje || resp.statusText);
            }

            this.Renderizar_Detalles_Pedido();
            this.Renderizar_Productos();
            this.Renderizar_Información_Envío();
        } catch (e) {
            console.error('❌ Error cargando pedido desde API:', e);
            Mostrar_Notificación('No se pudo cargar los datos del pedido', 'Error');
            // redirige tras la notificación
            setTimeout(() => window.location.href = '/html/index.html', 1500);
            throw e;
        }
    },

    // Actualizar estado del pedido en la interfaz
    Actualizar_Estado_Pedido: function () {
        const Pedido = this.Estado.Pedido_Actual;

        if (!Pedido) return;

        const Encabezado_Título = document.querySelector('.Encabezado_Confirmación h2');
        const Encabezado_Subtítulo = document.querySelector('.Encabezado_Confirmación p');

        if (Pedido.Estado_Pedido === 'Pendiente') {
            Encabezado_Título.textContent = '¡Pedido Pendiente!';
            Encabezado_Subtítulo.textContent = 'Su pedido está en proceso de verificación de pago.';

            const Primer_Punto = document.querySelector('.Estado_Punto');
            if (Primer_Punto) {
                const Estado_Título = Primer_Punto.querySelector('.Estado_Titulo');
                if (Estado_Título) Estado_Título.textContent = 'Pedido Pendiente';
            }

            const Estado_Texto = document.querySelector('.Estado_Texto');
            if (Estado_Texto) {
                Estado_Texto.classList.remove('Pagado');
                Estado_Texto.classList.add('Pendiente');
                Estado_Texto.textContent = 'Pendiente';
            }
        } else {
            Encabezado_Título.textContent = '¡Pedido Confirmado!';
            Encabezado_Subtítulo.textContent = 'Gracias por su compra. Hemos recibido su pedido correctamente.';

            const Estado_Texto = document.querySelector('.Estado_Texto');
            if (Estado_Texto) {
                Estado_Texto.classList.remove('Pendiente');
                Estado_Texto.classList.add('Pagado');
                Estado_Texto.textContent = 'Pagado';
            }
        }

        // ——— Bloque para ocultar/mostrar botón de factura ———
        const btnFactura = document.getElementById('Descargar_Factura');
        if (btnFactura) {
            if (Pedido.Estado_Pedido === 'Pendiente' || Pedido.Estado_Pedido === 'Cancelado') {
                btnFactura.style.display = 'none';
            } else {
                btnFactura.style.display = ''; // o 'inline-block' si tu CSS lo necesita
            }
        }
    },

    // Renderizar los detalles del pedido
    Renderizar_Detalles_Pedido: function () {
        const p = this.Estado.Pedido_Actual;
        if (!p) return;

        // Número de pedido
        document.getElementById('Número_Pedido').textContent = p.Número_Pedido;

        // Fecha
        const f = new Date(p.Fecha);
        document.getElementById('Fecha_Pedido').textContent =
            f.toLocaleDateString('es-ES', this.Configuración.Formato_Fecha);

        // Método de pago
        let txtMP = p.Método_Pago;
        if (txtMP === 'Transferencia') txtMP = 'Transferencia Bancaria';
        document.getElementById('Método_Pago').textContent = txtMP;

        // Totales
        const Subtotales = parseFloat(p.Subtotal) || 0;
        const Envíos = parseFloat(p.Envío) || 0;
        const Totales = parseFloat(p.Total) || 0;
        const Descuentos = parseFloat(p.Descuento) || 0;

        document.getElementById('Valor_Subtotal').textContent = `$${Subtotales.toFixed(2)}`;
        document.getElementById('Valor_Envío').textContent = Envíos > 0 ? `$${Envíos.toFixed(2)}` : 'Gratis';
        document.getElementById('Valor_Total').textContent = `$${Totales.toFixed(2)}`;

        if (Descuentos > 0) {
            document.getElementById('Valor_Descuento').textContent = `-$${Descuentos.toFixed(2)}`;
            document.getElementById('Contenedor_Descuento').style.display = 'flex';
        } else {
            document.getElementById('Contenedor_Descuento').style.display = 'none';
        }
    },

    // Renderizar los productos comprados
    Renderizar_Productos: function () {
        const Pedido = this.Estado.Pedido_Actual;
        if (!Pedido || !Pedido.Items) return;

        const cont = document.getElementById('Lista_Productos');
        cont.innerHTML = '';

        Pedido.Items.forEach(Item => {
            const urlImg = Item.URL_Imagen || '/Imágenes/Producto-placeholder.jpg';
            const baseName = Item.Nombre_Producto;
            // ❗️ Este campo debe venir de tu API; aquí probamos distintos nombres
            const Variante = Item.volumen        // si en tu modelo así se llama
                || Item.Nombre_Variante // o con esta clave
                || Item.Variante       // o así
                || '';
            // Si hay variante, la concatenamos
            const nombre = Variante
                ? `${baseName} – ${Variante}`
                : baseName;

            const Cantidad = Item.Cantidad;
            const precio = parseFloat(Item.Precio_Unitario) || 0;

            const el = document.createElement('div');
            el.className = 'Producto_Elemento';
            el.innerHTML = `
                <div class="Imagen_Producto">
                    <img src="${urlImg}" alt="${nombre}"
                        onerror="this.src='/Imágenes/Producto-placeholder.jpg'">
                </div>
                <div class="Información_Producto">
                    <div class="Nombre_Producto">${nombre}</div>
                    <div class="Detalle_Producto">
                    <span class="Cantidad_Producto">Cantidad: ${Cantidad}</span>
                    </div>
                </div>
                <div class="Precio_Producto">
                    $${(precio * Cantidad).toFixed(2)}
                </div>
            `;
            cont.appendChild(el);
        });
    },

    // Renderizar la información de envío
    Renderizar_Información_Envío: function () {
        const p = this.Estado.Pedido_Actual;
        console.log('🛠️ Datos de envío raw:', p.Dirección_Envío, p.Código_Postal, p.Instrucciones_Envío);
        if (!p) return;

        // Montamos la dirección
        let html = `
    <div class="Dirección_Envío">
      <p><strong>Dirección:</strong> ${p.Dirección_Envío || 'No especificada'}</p>
      <p><strong>Código Postal:</strong> ${p.Código_Postal || 'No especificado'}</p>
    </div>`;
        // Agregamos instrucciones si existen
        if (p.Instrucciones_Envío && p.Instrucciones_Envío.trim()) {
            html += `
      <div class="Instrucciones_Envío">
        <p><strong>Instrucciones:</strong> ${p.Instrucciones_Envío}</p>
      </div>`;
        }

        document.getElementById('Información_Envío').innerHTML = html;

        // Tiempo estimado: sólo si ya no está pendiente
        if (p.Estado_Pedido !== 'Pendiente') {
            // Asegúrate de que tu API devuelva también la fecha (p.Fecha o p.fechaPedido)
            const fechaPedido = new Date(p.Fecha);
            fechaPedido.setMinutes(fechaPedido.getMinutes() + this.Configuración.Tiempo_Envío_Estimado);
            const elTiempo = document.getElementById('Tiempo_Estimado');
            if (elTiempo) {
                elTiempo.textContent = this.Formatear_Fecha(fechaPedido.toISOString());
            }
        }
    },

    // Cargar historial de pedidos REAL desde el backend
    async Cargar_Historial_Pedidos() {
        const Token = localStorage.getItem('Token');
        if (!Token) return;  // sin token no podemos

        try {
            const resp = await fetch(`${API_BASE}/api/Pedidos/usuario`, {
                headers: { 'Authorization': 'Bearer ' + Token }
            });
            const json = await resp.json();

            if (!resp.ok || !json.Éxito) {
                throw new Error(json.Mensaje || resp.statusText);
            }

            // aquí tu array de pedidos reales:
            this.Estado.Historial_Pedidos = json.Datos;
            this.Renderizar_Historial_Pedidos();
            console.log("Historial de pedidos cargado:", this.Estado.Historial_Pedidos);

        } catch (e) {
            console.error('❌ Error cargando historial desde API:', e);
            Mostrar_Notificación('No se pudo cargar el historial de pedidos', 'Error');
        }
    },

    // Renderizar la tabla de historial de pedidos
    Renderizar_Historial_Pedidos: function () {
        const tabla = document.getElementById('Tabla_Historial');
        if (!tabla) return;
        tabla.innerHTML = '';

        this.Estado.Historial_Pedidos.forEach(p => {
            const idOrden = p.ID_Pedido || p.Número_Pedido;
            const totalVal = parseFloat(p.Total) || 0;
            const Fecha = new Date(p.Fecha);
            const fechaFormateada = Fecha.toLocaleDateString('es-ES', this.Configuración.Fecha_Corta);
            const estadoCapitalizado = p.Estado_Pedido.charAt(0).toUpperCase() + p.Estado_Pedido.slice(1);

            // ——— Comprobamos si mostrar el icono ———
            const puedeVerFactura = p.Estado_Pedido !== 'Pendiente' && p.Estado_Pedido !== 'Cancelado';
            const botonFactura = puedeVerFactura
                ? `<button class="Botones Botón_Accion" onclick="Gestión_Pedidos.Ver_Factura_Pedido('${idOrden}')">
                     <i class="fas fa-file-invoice"></i>
                   </button>`
                : '';  // cadena vacía si no debe verse

            const Fila = document.createElement('div');
            Fila.className = 'Fila_Tabla';
            Fila.innerHTML = `
              <div class="Celda_Tabla">${idOrden}</div>
              <div class="Celda_Tabla">${fechaFormateada}</div>
              <div class="Celda_Tabla">$${totalVal.toFixed(2)}</div>
              <div class="Celda_Tabla">
                <span class="Estado_Texto ${estadoCapitalizado}">${estadoCapitalizado}</span>
              </div>
              <div class="Celda_Tabla">
                <div class="Tabla_Acciones">
                  ${botonFactura}
                </div>
              </div>
            `;

            tabla.appendChild(Fila);
        });
    },

    // Inicializar eventos de la página
    Inicializar_Eventos: function () {
        // Botón para descargar factura
        const Botón_Descargar_Factura = document.getElementById('Descargar_Factura');
        if (Botón_Descargar_Factura) {
            Botón_Descargar_Factura.addEventListener('click', () => {
                this.Mostrar_Modal_Factura();
            });
        }

        // Cerrar modal
        const Botón_Cerrar_Modal_Factura = document.querySelector('.Cerrar_Modal_Factura');
        if (Botón_Cerrar_Modal_Factura) {
            Botón_Cerrar_Modal_Factura.addEventListener('click', () => {
                document.getElementById('Modal_Factura').style.display = 'none';
            });
        }

        // Cerrar modal al hacer clic fuera del contenido
        window.addEventListener('click', (event) => {
            const Modal_Factura = document.getElementById('Modal_Factura');
            if (Modal_Factura && event.target === Modal_Factura) {
                Modal_Factura.style.display = 'none';
            }
        });

        // Imprimir factura
        const Botón_Imprimir_Factura = document.getElementById('Imprimir_Factura');
        if (Botón_Imprimir_Factura) {
            Botón_Imprimir_Factura.addEventListener('click', () => {
                this.Imprimir_Factura();
            });
        }
    },

    // Mostrar modal con factura del pedido actual
    Mostrar_Modal_Factura: function () {
        if (!this.Estado.Pedido_Actual) {
            Mostrar_Notificación('No hay información del pedido', 'Error');
            return;
        }

        // Actualizar contenido del modal con datos del pedido actual
        this.Actualizar_Datos_Factura(this.Estado.Pedido_Actual);

        // Mostrar el modal
        document.getElementById('Modal_Factura').style.display = 'flex';
    },

    // Actualizar el contenido de la factura con los datos de un pedido
    Actualizar_Datos_Factura: function (p) {
        // Número y fecha
        document.getElementById('Número_Factura').textContent = `F-${p.Número_Pedido}`;
        document.getElementById('Fecha_Factura').textContent = this.Formatear_Fecha(p.Fecha);

        // Datos del cliente
        document.getElementById('Nombre_Cliente').textContent =
            this.Estado.Datos_Sesión.Nombre_Completo || 'Cliente';
        document.getElementById('Dirección_Cliente').textContent =
            p.Dirección_Envío || 'No Disponible';
        document.getElementById('Teléfono_Cliente').textContent =
            this.Estado.Datos_Sesión.Teléfono || 'No Disponible';
        document.getElementById('Correo_Electrónico_Cliente').textContent =
            this.Estado.Datos_Sesión.Correo_Electrónico || 'No Disponible';

        // Productos (Items)
        const tabla = document.getElementById('Factura_Artículos');
        tabla.innerHTML = '';
        p.Items.forEach(Item => {
            const precio = parseFloat(Item.Precio_Unitario) || 0;
            const subtotalProducto = precio * Item.Cantidad;

            // Aquí concatenamos variante si existe
            const nombre = Item.Nombre_Variante
                ? `${Item.Nombre_Producto} – ${Item.Nombre_Variante}`
                : Item.Nombre_Producto;

            const Fila = document.createElement('tr');
            Fila.innerHTML = `
              <td>${nombre}</td>
              <td>${Item.Cantidad}</td>
              <td>$${precio.toFixed(2)}</td>
              <td>$${subtotalProducto.toFixed(2)}</td>
            `;
            tabla.appendChild(Fila);
        });

        // Cálculos de totales
        const Subtotal = parseFloat(p.Subtotal) || 0;
        const Envío = parseFloat(p.Envío) || 0;
        const Descuento = parseFloat(p.Descuento) || 0;
        const iva = Subtotal * 0.15;
        const totalConIVA = Subtotal + iva + Envío - Descuento;

        document.getElementById('Subtotal_Factura').textContent = `$${Subtotal.toFixed(2)}`;
        document.getElementById('IVA_Factura').textContent = `$${iva.toFixed(2)}`;
        document.getElementById('Envío_Factura').textContent = Envío > 0 ? `$${Envío.toFixed(2)}` : 'Gratis';
        document.getElementById('Total_Factura').textContent = `$${totalConIVA.toFixed(2)}`;

        // Descuento
        const filaDesc = document.getElementById('Fila_Descuento_Factura');
        if (Descuento > 0) {
            filaDesc.style.display = 'table-row';
            document.getElementById('Descuento_Factura').textContent = `-$${Descuento.toFixed(2)}`;
        } else {
            filaDesc.style.display = 'none';
        }
    },

    // Ver factura de un pedido del historial
    Ver_Factura_Pedido: async function (orden) {
        try {
            // 1) Si coincide con el pedido actual
            const actual = this.Estado.Pedido_Actual;
            const actualId = actual?.ID_Pedido || actual?.Número_Pedido;
            if (actual && actualId == orden) {
                this.Mostrar_Modal_Factura();
                return;
            }

            // 2) Buscar en el historial
            let p = this.Estado.Historial_Pedidos.find(p => (p.ID_Pedido || p.Número_Pedido) == orden);
            if (!p) {
                Mostrar_Notificación('No se pudo encontrar la factura solicitada', 'Error');
                return;
            }

            // 3) Si no trae Items, cargarlos desde la API
            if (!Array.isArray(p.Items) || p.Items.length === 0) {
                const Token = localStorage.getItem('Token');
                const resp = await fetch(`${API_BASE}/api/Pedidos/${orden}`, {
                    headers: { 'Authorization': `Bearer ${Token}` }
                });
                const json = await resp.json();
                if (!resp.ok || !json.Éxito) {
                    throw new Error(json.Mensaje || 'Error cargando detalles del pedido');
                }
                // json.Datos.pedido  y json.Datos.Items
                p = {
                    ...json.Datos.Pedido,
                    Items: json.Datos.Items,
                    Subtotal: json.Datos.Pedido.Subtotal,
                    Envío: json.Datos.Pedido.Envío,
                    Descuento: json.Datos.Pedido.Descuento
                };
            }

            // 4) Actualizar el modal y mostrarlo
            this.Actualizar_Datos_Factura(p);
            document.getElementById('Modal_Factura').style.display = 'flex';

        } catch (err) {
            console.error('Error al ver factura de pedido histórico:', err);
            Mostrar_Notificación('No se pudo cargar la factura completa', 'Error');
        }
    },

    // Imprimir factura
    Imprimir_Factura: function () {
        // Preparar contenido para imprimir
        const Contenido_Factura = document.getElementById('Contenido_Factura').innerHTML;
        const Ventana_Impresión = window.open('', '_blank', 'width=800,height=600');

        Ventana_Impresión.document.write(`
            <html>
                <head>
                    <title>Factura – ${this.Estado.Pedido_Actual.Número_Pedido}</title>
                    <style>
                        body { font-family: Arial, sans-serif; color: #333; }
                        .Encabezado_Factura { display: flex; justify-content: space-between; margin-bottom: 30px; }
                        .Logo_Factura h2 { color: #ff5a00; }
                        .Información_Factura { text-align: right; }
                        .Información_Factura h3 { color: #16c2d5; }
                        .Factura_Cliente { margin-bottom: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 8px; }
                        .Factura_Cliente h4 { color: #16c2d5; margin-bottom: 10px; }
                        .Factura_Productos table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        .Factura_Productos th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
                        .Factura_Productos td { padding: 10px; border-bottom: 1px solid #ddd; }
                        .Texto_Derecha { text-align: right; }
                        .Fila_Total { font-weight: bold; color: #ff5a00; }
                        .Pie_Factura { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; }
                    </style>
                </head>
                <body>
                    ${Contenido_Factura}
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
            </html>
        `);

        Ventana_Impresión.document.close();
    },

    // Formatear fecha ISO a formato legible
    Formatear_Fecha: function (Fecha_ISO) {
        try {
            const Fecha = new Date(Fecha_ISO);
            return Fecha.toLocaleDateString('es-EC', this.Configuración.Formato_Fecha);
        } catch (Error_Capturado) {
            console.error("Error al formatear Fecha:", Error_Capturado);
            return Fecha_ISO;
        }
    },
};

window.Gestión_Pedidos = Gestión_Pedidos;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    Gestión_Pedidos.Inicializar();
});