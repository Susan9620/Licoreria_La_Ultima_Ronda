var API_BASE = window.API_BASE || '';

// Objeto principal para el manejo del checkout
const Checkout = {
    // Configuración
    Configuración: {
        Envío: 1.50,
        URLs_API: {
            Deuna: "https://api.deuna.pichincha.com/pagos/v1",
            Transferencia: "https://api.transferencias.pichincha.com/v1",
            PeiGo: "https://api.peigo.guayaquil.com/v1"
        }
    },

    // Estado actual
    Estado: {
        Método_Pago: null,
        Procesando_Pago: false,
        Envío_Gratis: false,
        Descuento_Aplicado: 0
    },

    // Inicialización
    Inicializar: function () {
        console.log("Inicializando checkout...");
        this.Cargar_Carrito();
        this.Inicializar_Eventos();
        console.log("Checkout inicializado correctamente");
    },

    // Cargar información del carrito y actualizar resumen
    Cargar_Carrito: function () {
        // 0) Forzar recarga desde localStorage para que window.Carrito.Artículos esté siempre poblado
        if (window.Carrito && typeof window.Carrito.Cargar_Elementos === 'function') {
            window.Carrito.Cargar_Elementos();
        }

        console.log("Cargando carrito...");
        console.log('Carrito.Artículos cargado en checkout:', window.Carrito.Artículos);

        // Verificar si se tiene acceso al objeto Carrito
        if (!window.Carrito || !window.Carrito.Artículos || window.Carrito.Artículos.length === 0) {
            console.warn("El carrito está vacío o no está disponible");
            this.Redirigir_Carrito();
            return;
        }

        // Generar HTML para cada producto en el carrito
        const Contenedor_Productos = document.getElementById('Resumen_Productos');
        Contenedor_Productos.innerHTML = '';

        window.Carrito.Artículos.forEach(Elemento => {
            const Elemento_Producto = document.createElement('div');
            Elemento_Producto.className = 'Producto_Resumen';
            Elemento_Producto.innerHTML = `
                <div class="Producto_Resumen_Imagen">
                    <img src="${Elemento.Imagen}" alt="${Elemento.Nombre}">
                </div>
                <div class="Producto_Resumen_Detalles">
                    <h4>${Elemento.Nombre}</h4>
                    <div class="Producto_Resumen_Información">
                        <span class="Producto_Resumen_Cantidad">Cantidad: ${Elemento.Cantidad}</span>
                        <span class="Producto_Resumen_Precio">$${(Elemento.Precio * Elemento.Cantidad).toFixed(2)}</span>
                    </div>
                </div>
            `;
            Contenedor_Productos.appendChild(Elemento_Producto);
        });

        this.Actualizar_Totales();
        console.log("Carrito cargado correctamente");
    },

    // Actualizar los totales del resumen
    Actualizar_Totales: function () {
        const Subtotal = window.Carrito.Calcular_Total();
        const Envío = this.Estado.Envío_Gratis ? 0 : this.Configuración.Envío;
        const Descuento = Subtotal * this.Estado.Descuento_Aplicado;
        const SubtotalConDescuento = Subtotal - Descuento;
        const IVA = SubtotalConDescuento * 0.15;
        const Total = SubtotalConDescuento + IVA + Envío;

        // Actualizar los elementos del DOM
        document.getElementById('Subtotal_Resumen').textContent = `$${Subtotal.toFixed(2)}`;
        document.getElementById('Costo_Envío').textContent = this.Estado.Envío_Gratis ? 'Gratis' : `$${Envío.toFixed(2)}`;

        // Línea de IVA
        const Contenedor_Totales = document.querySelector('.Totales_Carrito');
        let Línea_IVA = Contenedor_Totales.querySelector('.Línea_IVA');
        if (!Línea_IVA) {
            Línea_IVA = document.createElement('div');
            Línea_IVA.className = 'Línea_Total Línea_IVA';
            Línea_IVA.innerHTML = `<span>IVA (15%):</span><span>$${IVA.toFixed(2)}</span>`;
            const Línea_Total = Contenedor_Totales.querySelector('.Total_Principal');
            Contenedor_Totales.insertBefore(Línea_IVA, Línea_Total);
        } else {
            Línea_IVA.querySelector('span:last-child').textContent = `$${IVA.toFixed(2)}`;
        }

        document.getElementById('Total_Resumen').textContent = `$${Total.toFixed(2)}`;

        // Línea de descuento (ya existente)
        const Existe_Descuento = Contenedor_Totales.querySelector('.Línea_Descuento');
        if (this.Estado.Descuento_Aplicado > 0) {
            if (Existe_Descuento) {
                Existe_Descuento.querySelector('span:last-child').textContent = `-$${Descuento.toFixed(2)}`;
            } else {
                const Línea_Descuento = document.createElement('div');
                Línea_Descuento.className = 'Línea_Total Línea_Descuento';
                Línea_Descuento.innerHTML = `
                    <span>Descuento (${this.Estado.Descuento_Aplicado * 100}%):</span>
                    <span>-$${Descuento.toFixed(2)}</span>
                `;
                Contenedor_Totales.insertBefore(Línea_Descuento, Línea_IVA);
            }
        } else if (Existe_Descuento) {
            Existe_Descuento.remove();
        }

        console.log(`Totales actualizados: Subtotal $${Subtotal.toFixed(2)}, Descuento $${Descuento.toFixed(2)}, IVA $${IVA.toFixed(2)}, Envío $${Envío.toFixed(2)}, Total $${Total.toFixed(2)}`);
    },

    // Inicializar todos los eventos
    Inicializar_Eventos: function () {
        // Selección de método de pago
        const Opciones_Pago = document.querySelectorAll('.Tarjeta_Opción_Pago');
        const Detalles_Pago = document.querySelectorAll('.Detalles_Método');

        // Función para mostrar los detalles del método seleccionado
        const Mostrar_Detalles_Método = (Método) => {
            // Ocultar todos los detalles primero
            Detalles_Pago.forEach(Detalle => {
                Detalle.style.display = 'none';
            });

            // Mostrar los detalles del método seleccionado
            const Detalles_Activos = document.getElementById(`Detalles_${Método}`);
            if (Detalles_Activos) {
                Detalles_Activos.style.display = 'block';
            }
        };

        // Asignar evento click a cada opción de pago
        Opciones_Pago.forEach(Opción => {
            Opción.addEventListener('click', () => {
                // Quitar selección previa
                Opciones_Pago.forEach(op => op.classList.remove('Seleccionado'));

                // Establecer la nueva selección
                Opción.classList.add('Seleccionado');
                const Método_Pago = Opción.dataset.metodo;
                this.Estado.Método_Pago = Método_Pago;

                // Mostrar los detalles correspondientes
                Mostrar_Detalles_Método(Método_Pago);

                console.log(`Método de pago seleccionado: ${this.Estado.Método_Pago}`);
            });
        });

        // Inicializar con el primer método por defecto
        if (Opciones_Pago.length > 0) {
            const Primer_Método = Opciones_Pago[0];
            Primer_Método.classList.add('Seleccionado');
            this.Estado.Método_Pago = Primer_Método.dataset.metodo;
            Mostrar_Detalles_Método(Primer_Método.dataset.metodo);
        }

        // Volver al carrito
        document.getElementById('Volver_Carrito').addEventListener('click', () => {
            this.Redirigir_Carrito();
        });

        // Confirmar pedido
        document.getElementById('Confirmar_Pedido').addEventListener('click', () => {
            if (this.Validar_Formulario()) {
                this.Procesar_Pago();
            }
        });

        // Eventos del modal de confirmación
        document.querySelector('.Cerrar_Modal').addEventListener('click', () => {
            this.Cerrar_Modal_Confirmación();
        });

        document.getElementById('Botón_Finalizar').addEventListener('click', () => {
            this.Completar_Pedido();
        });

        document.getElementById('Botón_Cerrar_QR').addEventListener('click', () => {
            this.Mostrar_Estado_Pendiente();
        });

        console.log("Eventos inicializados correctamente");
    },

    // Validar el formulario antes de procesar el pago
    Validar_Formulario: function () {
        console.log("Validando formulario...");
        const Campos_Requeridos = document.querySelectorAll('.Formulario_Pago input[required], .Formulario_Pago select[required]');
        let Válido = true;
        let Primer_Inválido = null;

        // Limpiar mensajes de error previos
        document.querySelectorAll('.Error_Validacion').forEach(err => err.remove());

        // Validar campos requeridos
        Campos_Requeridos.forEach(Campo => {
            if (!Campo.value.trim()) {
                this.Mostrar_Error_Validación(Campo, 'Este campo es obligatorio');
                if (!Primer_Inválido) Primer_Inválido = Campo;
                Válido = false;
            } else if (Campo.id === 'Correo_Electrónico' && !this.Validar_Email(Campo.value)) {
                this.Mostrar_Error_Validación(Campo, 'Ingresa un correo electrónico válido');
                if (!Primer_Inválido) Primer_Inválido = Campo;
                Válido = false;
            } else if (Campo.id === 'Teléfono' && !this.Validar_Teléfono(Campo.value)) {
                this.Mostrar_Error_Validación(Campo, 'Ingresa un número de teléfono válido');
                if (!Primer_Inválido) Primer_Inválido = Campo;
                Válido = false;
            }
        });

        // Validar selección de método de pago
        if (!this.Estado.Método_Pago) {
            const Contenedor_Pago = document.querySelector('.Cuadrícula_Opciones_Pago');
            this.Mostrar_Error_Validación(Contenedor_Pago, 'Selecciona un método de pago');
            if (!Primer_Inválido) Primer_Inválido = Contenedor_Pago;
            Válido = false;
        }

        // Hacer scroll al primer campo inválido
        if (Primer_Inválido) {
            Primer_Inválido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        console.log("Validación de formulario:", Válido ? "Exitosa" : "Fallida");
        return Válido;
    },

    // Mostrar mensaje de error de validación
    Mostrar_Error_Validación: function (Campo, Mensaje) {
        const Mensaje_Error = document.createElement('div');
        Mensaje_Error.className = 'Error_Validacion';
        Mensaje_Error.textContent = Mensaje;

        // Si es el contenedor de métodos de pago, agregar el error al final
        if (Campo.classList.contains('Cuadrícula_Opciones_Pago')) {
            Campo.appendChild(Mensaje_Error);
        } else {
            // Para campos normales, insertar después del campo
            Campo.parentNode.insertBefore(Mensaje_Error, Campo.nextSibling);
        }
    },

    // Validación de correo electrónico
    Validar_Email: function (Correo_Electrónico) {
        const Formato_Regular = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return Formato_Regular.test(Correo_Electrónico);
    },

    // Validación de número telefónico
    Validar_Teléfono: function (Teléfono) {
        // Acepta formato ecuatoriano (+593xxxxxxxxx, 09xxxxxxxx, etc.)
        const Formato_Regular = /^(\+593|0)(\d{9})$/;
        return Formato_Regular.test(Teléfono.replace(/\s/g, ''));
    },

    // Procesar el pago según el método seleccionado
    Procesar_Pago: function () {
        if (this.Estado.Procesando_Pago) {
            console.log("Ya hay un proceso de pago en curso");
            return;
        }

        console.log(`Procesando pago con método: ${this.Estado.Método_Pago}`);
        this.Estado.Procesando_Pago = true;

        const Modal_Confirmación = document.getElementById('Modal_Confirmación');
        Modal_Confirmación.style.display = 'flex';

        // Configurar el modal según el método de pago
        this.Configurar_Modal_Según_Método();

        // Simular generación del código QR para métodos que lo necesitan
        if (this.Estado.Método_Pago === 'Deuna' || this.Estado.Método_Pago === 'PeiGo') {
            // Simular generación de QR
            setTimeout(() => {
                // En una implementación real, aquí se mostraría el QR generado
                console.log("QR generado correctamente");

                // Generar ID de transacción simulado
                const ID_Transacción = `${this.Estado.Método_Pago.toUpperCase()}-${Date.now()}`;
                document.getElementById('Número_Pedido').textContent = ID_Transacción;
            }, 1000);
        } else if (this.Estado.Método_Pago === 'Transferencia') {
            // Para transferencia bancaria directamente mostrar "pendiente"
            this.Mostrar_Estado_Pendiente();
        }
    },

    // Configurar el modal según el método de pago seleccionado
    Configurar_Modal_Según_Método: function () {
        const Contenedor_QR = document.querySelector('.Contenedor_QR');
        const Estado_Pendiente = document.getElementById('Estado_Pendiente');
        const Título_Modal = document.querySelector('.Encabezado_Modal h2');
        const Imagen_QR = document.getElementById('Imagen_QR');

        // Ocultar ambos contenedores por defecto
        Contenedor_QR.style.display = 'none';
        Estado_Pendiente.style.display = 'none';

        // Según el método seleccionado, configurar modal
        if (this.Estado.Método_Pago === 'Deuna') {
            Contenedor_QR.style.display = 'block';
            Título_Modal.textContent = 'Escanee el Código QR con Deuna';
            Imagen_QR.src = "https://res.cloudinary.com/dq4yyycio/image/upload/v1745784736/QR_Deuna_ybjzws.jpg";
        } else if (this.Estado.Método_Pago === 'PeiGo') {
            Contenedor_QR.style.display = 'block';
            Título_Modal.textContent = 'Escanee el Código QR con PeiGo';
            Imagen_QR.src = "https://res.cloudinary.com/dq4yyycio/image/upload/v1745784737/QR_PeiGo_fyh5ux.jpg";
        } else if (this.Estado.Método_Pago === 'Transferencia') {
            Estado_Pendiente.style.display = 'block';
            Título_Modal.textContent = 'Transferencia Bancaria';

            // Generar ID de transacción simulado
            const ID_Transacción = `TRF-${Date.now()}`;
            document.getElementById('Número_Pedido').textContent = ID_Transacción;
        }
    },

    // Mostrar estado pendiente (después de escanear QR o para transferencias)
    Mostrar_Estado_Pendiente: function () {
        const Contenedor_QR = document.querySelector('.Contenedor_QR');
        const Estado_Pendiente = document.getElementById('Estado_Pendiente');

        Contenedor_QR.style.display = 'none';
        Estado_Pendiente.style.display = 'block';
    },

    // 1) Carga *todos* los productos (ajusta la URL a tu endpoint real)
    async cargarTodosLosProductos() {
        const res = await fetch(`${API_BASE}/api/Productos/all`);  // <- aquí tu ruta que devuelve TODO el catálogo
        if (!res.ok) throw new Error(`No pude cargar todos los productos: ${res.status}`);
        const json = await res.json();
        // suponemos que vienen en json.Datos
        return Array.isArray(json.Datos) ? json.Datos : [];
    },

    // 3) Prepara items resolviendo ID_Variante en memoria (con fallback al ID_Producto)
    async prepararItemsParaCheckout() {
        const Productos = await this.cargarTodosLosProductos();

        const resultados = await Promise.all(
            window.Carrito.Artículos.map(async Item => {
                // 1) Separamos “Producto – Variante” si existe
                const [nombreBase, Nombre_Variante] = Item.Nombre.split(' – ').map(s => s.trim());

                // 2) Buscamos el producto por su nombre base
                let Producto_Variante = Productos.find(p => p.Nombre === nombreBase);
                if (!Producto_Variante) {
                    console.warn(`Producto no encontrado en catálogo: "${nombreBase}"`);
                    return null;
                }

                // 3) Obtenemos la lista de variantes
                const resVar = await fetch(`${API_BASE}/api/Variantes/Producto/${Producto_Variante.ID_Producto}`);
                const varJson = await resVar.json();
                const Variantes = Array.isArray(varJson.Datos) ? varJson.Datos : [];

                // 4) Intentamos emparejar la variante por nombre, o fallback a la predeterminada
                let varPred = Variantes.find(v => v.Nombre_Variante === Nombre_Variante)
                    || Variantes.find(v => v.Predeterminada)
                    || Variantes[0]
                    || null;

                if (!varPred) {
                    console.warn(`Variante no encontrada para "${Nombre_Variante}" en "${nombreBase}"`);
                    return null;
                }

                // 5) Devolvemos el objeto con ID_Variante garantizado
                return {
                    ID_Variante: varPred.ID_Variante_Producto,
                    Cantidad: Item.Cantidad,
                    Precio_Unitario: Item.Precio,
                    Subtotal: +(Item.Precio * Item.Cantidad).toFixed(2)
                };
            })
        );

        // Filtramos los nulls
        return resultados.filter(r => r !== null);
    },

    // Cerrar modal de confirmación
    Cerrar_Modal_Confirmación: function () {
        document.getElementById('Modal_Confirmación').style.display = 'none';
        this.Estado.Procesando_Pago = false;
        console.log("Modal de confirmación cerrado");
    },

    // Completar el pedido (limpiar carrito y redirigir)
    Completar_Pedido: async function () {
        console.log("Completando pedido…");

        // 4.1) Recopilar datos del formulario
        const Datos = this.Recopilar_Datos_Formulario();

        try {
            // 4.2) Resolver ID_Variante para cada artículo
            console.log('📦 window.Carrito.Artículos en Completar_Pedido:', window.Carrito.Artículos);
            const Items = await this.prepararItemsParaCheckout();
            console.log("📋 Items procesados para enviar:", Items);

            const { direccion, Código_Postal, instrucciones } = Datos;
            const Subtotal = window.Carrito.Calcular_Total();
            const Envío = this.Estado.Envío_Gratis ? 0 : this.Configuración.Envío;
            const Descuento = Subtotal * this.Estado.Descuento_Aplicado;
            const Total = +(
                Subtotal               // base
                - Descuento            // menos descuento
                + Envío                // más envío
                + (Subtotal - Descuento) * 0.15  // más IVA 15%
            ).toFixed(2);

            const Carga_Datos = {
                Items,              // tu array de { ID_Variante, Cantidad, Precio_Unitario, Subtotal }
                Subtotal,           // número
                Envío,              // número
                Descuento,          // número
                Total,              // número
                Método_Pago: this.Estado.Método_Pago, // string
                Dirección_Envío: direccion,           // string
                Código_Postal,      // string
                Instrucciones_Envío: instrucciones     // string
            };

            // 4.4) Enviar el pedido con JWT en Authorization
            const Token = localStorage.getItem('Token');
            if (!Token) {
                throw new Error('No estás autenticada. Por favor inicia sesión.');
            }
            // 👇 Depuración: muestra la carga de datos que vamos a enviar
            console.log('📤 Payload pedido a enviar:', JSON.stringify(Carga_Datos, null, 2));
            const res = await fetch(`${API_BASE}/api/Pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Token}`
                },
                body: JSON.stringify(Carga_Datos)
            });
            // 1) Parseamos la respuesta JSON
            const json = await res.json();
            if (!res.ok || !json.Éxito) throw new Error(json.Mensaje || `Error ${res.status}`);

            // 2) Tomamos el ID del pedido que acaba de crear el backend
            const ID_Pedido = json.Datos.ID_Pedido;

            // 3) Vaciamos el carrito
            window.Carrito.Artículos = [];
            if (typeof window.Carrito.Guardar_Artículos === 'function') {
                window.Carrito.Guardar_Artículos();
            }

            // 4) Redirigimos incluyendo ID_Pedido en la URL
            Mostrar_Notificación('¡Pedido completado con éxito! Redirigiendo...', 'Éxito');
            setTimeout(() => {
                window.location.href = `/html/confirmación.html?ID_Pedido=${ID_Pedido}`;
            }, 1500);

        } catch (err) {
            console.error("Error preparando o enviando el pedido:", err);
            Mostrar_Notificación("Error al procesar el pedido: " + err.message, "Error");
        }
    },

    // Redirigir al carrito
    Redirigir_Carrito: function () {
        // ruta absoluta hacia tu carrito.html
        window.location.href = '/html/carrito.html';
    },

    // Calcular el total final del pedido
    Calcular_Total_Pedido: function () {
        const Subtotal = window.Carrito.Calcular_Total();
        const Envío = this.Estado.Envío_Gratis ? 0 : this.Configuración.Envío;
        const Descuento = Subtotal * this.Estado.Descuento_Aplicado;
        const SubtotalConDescuento = Subtotal - Descuento;
        const IVA = SubtotalConDescuento * 0.15;

        return SubtotalConDescuento + IVA + Envío;
    },

    // Recopilar datos del formulario para el pedido
    Recopilar_Datos_Formulario: function () {
        return {
            direccion: document.getElementById('Direccion').value.trim(),
            Código_Postal: document.getElementById('Código_Postal').value.trim(),
            instrucciones: document.getElementById('Instrucciones_Envío').value.trim()
        };
    },
};

// Cargar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    // Verificar si se está en la página de checkout
    if (document.querySelector('.Encabezado_Checkout')) {
        console.log("Página de checkout detectada");
        Checkout.Inicializar();
    } else {
        console.log("No estamos en la página de checkout");
    }
});