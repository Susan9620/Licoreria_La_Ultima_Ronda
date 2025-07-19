// global.js
const baseUrl = 'https://licoreria-la-ultima-ronda.onrender.com';

// —————————————————————————————————————————————————————————
// 1) INYECCIÓN DEL MODAL Y REGISTRO DE EVENTOS AL CARGAR EL DOM
// —————————————————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', () => {
    // 1.1) Inyectar el modal si no existe
    if (!document.getElementById('Modal_Confirmación_Logout')) {
        document.body.insertAdjacentHTML('beforeend', `
      <div class="Modal_Confirmación_Login" id="Modal_Confirmación_Logout">
        <div class="Contenido_Modal_Login">
          <h2>¿Estás seguro que deseas cerrar sesión?</h2>
          <div class="Controles_Modal" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
            <button id="Cancelar_Cierre_Sesión" class="Botón_Cancelar">Cancelar</button>
            <button id="Confirmar_Cierre_Sesión" class="Botón_Confirmar">Sí, cerrar sesión</button>
          </div>
        </div>
      </div>
    `);
    }

    // 1.2) Registrar los listeners
    setupLogoutModalEvents();

    // 1.3) Refrescar estado de usuario en caliente
    window.actualizarUsuarioLogueado();
});

// —————————————————————————————————————————————————————————
// 2) FUNCIONES Y REGISTRO ORIGINAL
// —————————————————————————————————————————————————————————
function setupLogoutModalEvents() {
    // 2.1) abrir el modal
    document.getElementById('Cerrar_Sesión')?.addEventListener('click', e => {
        console.log('Cerrar_Sesión listener registrado');
        e.preventDefault();
        abrirModalLogout();
    });

    // 2.2) cancelar
    document.getElementById('Cancelar_Cierre_Sesión')?.addEventListener('click', cerrarModalLogout);

    // 2.3) confirmar
    document.getElementById('Confirmar_Cierre_Sesión')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('carrito');
        localStorage.removeItem('listaDeseos');
        cerrarModalLogout();
        window.location.href = '/html/index.html';
    });
}

// ── Delegación centralizada para los botones del modal de Logout ──
document.body.addEventListener('click', function (e) {
    if (e.target.id === 'Cancelar_Cierre_Sesión') {
        cerrarModalLogout();
    }
    else if (e.target.id === 'Confirmar_Cierre_Sesión') {
        localStorage.removeItem('token');
        localStorage.removeItem('carrito');
        localStorage.removeItem('listaDeseos');
        cerrarModalLogout();
        window.location.href = '/html/index.html';
    }
});

function abrirModalLogout() {
    const modal = document.getElementById('Modal_Confirmación_Logout');
    if (!modal) return console.error('Modal de Cerrar_Sesión no encontrado');
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function cerrarModalLogout() {
    const modal = document.getElementById('Modal_Confirmación_Logout');
    if (!modal) return console.error('Modal de Cerrar_Sesión no encontrado');
    modal.classList.remove('show');
    document.body.style.overflow = '';
}

/**
 * Comprueba si hay token; si no, abre login y devuelve false
 * @returns {boolean}
 */
function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        abrirModalLogin();
        return false;
    }
    return true;
}

//---------------------------------------Funciones para el Navbar---------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const Navbar = document.querySelector('.Navbar');
    const Menú_Oculto = document.getElementById('Menú_Oculto');
    const Enlaces_Navegación = document.querySelectorAll('.Enlaces_Navegación');

    // Cambio de estilo al hacer scroll
    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            Navbar.classList.add('scrolled');
        } else {
            Navbar.classList.remove('scrolled');
        }
    });

    // Funcionalidad del menú hamburguesa para móviles
    if (Menú_Oculto) {
        Menú_Oculto.addEventListener('click', function () {
            // Alternar la clase 'Activo' para el menú hamburguesa
            this.classList.toggle('Activo');

            // Transformar las barras en una X cuando está activo
            const Barras = this.querySelectorAll('.Barra');
            if (this.classList.contains('Activo')) {
                Barras[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                Barras[1].style.opacity = '0';
                Barras[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';

                // Mostrar los enlaces de navegación en versión móvil
                Enlaces_Navegación.forEach(Enlaces => {
                    Enlaces.classList.add('Mostrar');
                });
            } else {
                Barras[0].style.transform = 'none';
                Barras[1].style.opacity = '1';
                Barras[2].style.transform = 'none';

                // Ocultar los enlaces de navegación en versión móvil
                Enlaces_Navegación.forEach(Enlaces => {
                    Enlaces.classList.remove('Mostrar');
                });
            }
        });
    }

    // Funcionalidad para marcar el enlace activo
    const Enlaces = document.querySelectorAll('.Enlaces_Navegación a');
    Enlaces.forEach(Enlace => {
        Enlace.addEventListener('click', function () {
            // Remover la clase 'Activo' de todos los enlaces
            Enlaces.forEach(link => link.classList.remove('Activo'));
            // Añadir la clase 'Activo' al enlace actual
            this.classList.add('Activo');
        });
    });

    // Detectar la sección actual al hacer scroll
    function Actualizar_Navegación_Scroll() {
        const Secciones = document.querySelectorAll('section[id]');
        Secciones.forEach(Sección => {
            const Alto_Sección = Sección.offsetHeight;
            const Distancia_Top = Sección.offsetTop - 100;
            const ID_Sección = Sección.getAttribute('id');

            if (window.scrollY >= Distancia_Top && window.scrollY < Distancia_Top + Alto_Sección) {
                Enlaces.forEach(link => {
                    link.classList.remove('Activo');
                    if (link.getAttribute('href') === `#${ID_Sección}`) {
                        link.classList.add('Activo');
                    }
                });
            }
        });
    }

    // Escuchar el evento de scroll para actualizar la navegación
    window.addEventListener('scroll', Actualizar_Navegación_Scroll);

    // Animación suave al hacer clic en los enlaces de navegación
    Enlaces.forEach(Enlace => {
        Enlace.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Solo para enlaces internos con #
            if (href.startsWith('#') && href.length > 1) {
                e.preventDefault();

                const Sección_Objetivo = document.querySelector(href);
                if (Sección_Objetivo) {
                    // Cerrar menú móvil si está abierto
                    if (Menú_Oculto.classList.contains('Activo')) {
                        Menú_Oculto.click();
                    }

                    // Scroll suave a la sección
                    window.scrollTo({
                        top: Sección_Objetivo.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Menú desplegable
    const Ícono_Usuario = document.getElementById('Ícono_Usuario');
    const Menú_Desplegable_Usuario = document.getElementById('Menú_Desplegable_Usuario');
    const menuUsuario = document.querySelector('.Menú_Usuario');

    // Toggle del menú 
    if (Ícono_Usuario && menuUsuario) {
        Ícono_Usuario.addEventListener('click', function (e) {
            e.stopPropagation();
            menuUsuario.classList.toggle('activo');
        });
    }

    // Cerrar menú al hacer clic fuera
    if (menuUsuario) {
        document.addEventListener('click', function (e) {
            if (!menuUsuario.contains(e.target)) {
                menuUsuario.classList.remove('activo');
            }
        });
    }

    // Prevenir que el menú se cierre al hacer clic dentro
    if (Menú_Desplegable_Usuario) {
        Menú_Desplegable_Usuario.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }
});

//---------------------------------------Funciones para el Carrito de Compras---------------------------------------
const Reinicio_Forzado = false; // Cambiar a true para reiniciar

const Carrito = {
    Artículos: [],

    Inicializar: function () {
        console.log('Inicializando carrito desde localStorage únicamente');
        this.Cargar_Elementos();
        this.Actualizar_Contador();
        this.Inicializar_Botones();
    },

    Cargar_Elementos: function () {
        const Artículos_Guardados = localStorage.getItem('carrito');
        this.Artículos = Artículos_Guardados ? JSON.parse(Artículos_Guardados) : [];
        console.log('Artículos cargados desde localStorage:', this.Artículos);
    },

    Guardar_Artículos: function () {
        localStorage.setItem('carrito', JSON.stringify(this.Artículos));
        console.log('Artículos guardados en localStorage');
    },

    // Añadir producto al carrito
    Agregar_Elemento: function (Nombre, Precio, Imagen, Cantidad = 1) {
        console.log('Agregando Elemento:', Nombre, Precio, Imagen, Cantidad);

        // Normalizar el precio (remover $ y convertir a número)
        const Precio_Numérico = typeof Precio === 'string'
            ? parseFloat(Precio.replace(/[^\d.,]/g, '').replace(',', '.'))
            : parseFloat(Precio);

        if (isNaN(Precio_Numérico)) {
            console.error('Error al convertir precio:', Precio);
            return;
        }

        // Verificar si el producto ya está en el carrito
        const Producto_Existente = this.Artículos.find(Elemento => Elemento.Nombre === Nombre);

        if (Producto_Existente) {
            // Si existe, aumentar cantidad
            Producto_Existente.Cantidad += Cantidad;
            console.log('Producto existente actualizado:', Producto_Existente);
        } else {
            // Si no existe, añadir como nuevo
            this.Artículos.push({
                Nombre: Nombre,
                Precio: Precio_Numérico,
                Imagen: Imagen,
                Cantidad: Cantidad
            });
            console.log('Nuevo producto añadido al carrito');
        }

        // Guardar en localStorage
        this.Guardar_Artículos();

        // Actualizar contador
        this.Actualizar_Contador();

        // Mostrar notificación si la función existe
        if (typeof Mostrar_Notificación === 'function') {
            Mostrar_Notificación(`${Nombre} añadido al carrito`, 'Éxito');
        } else {
            console.log('Notificación: producto añadido al carrito');
        }
    },

    // Eliminar producto del carrito
    Eliminar_Elemento: function (Nombre) {
        this.Artículos = this.Artículos.filter(Elemento => Elemento.Nombre !== Nombre);
        this.Guardar_Artículos();
        this.Actualizar_Contador();
        console.log('Producto eliminado:', Nombre);
    },

    // Actualizar cantidad de un producto
    Actualizar_Cantidad: function (Nombre, Cantidad) {
        const Producto = this.Artículos.find(Elemento => Elemento.Nombre === Nombre);
        if (Producto) {
            Producto.Cantidad = Cantidad;
            if (Producto.Cantidad <= 0) {
                this.Eliminar_Elemento(Nombre);
            } else {
                this.Guardar_Artículos();
                this.Actualizar_Contador();
            }
            console.log('Cantidad actualizada para:', Nombre, 'Nueva cantidad:', Cantidad);
        }
    },

    // Calcular total del carrito
    Calcular_Total: function () {
        return this.Artículos.reduce((Total, Elemento) => Total + (Elemento.Precio * Elemento.Cantidad), 0);
    },

    // Actualizar contador visual
    Actualizar_Contador: function () {
        // Asegurarnos de que this.Artículos sea un array
        if (!Array.isArray(this.Artículos)) {
            // Si es un objeto, convertirlo a array
            if (this.Artículos && typeof this.Artículos === 'object') {
                this.Artículos = Object.values(this.Artículos);
            } else {
                // Si no es un objeto, inicializarlo como array vacío
                this.Artículos = [];
            }
        }

        // Ahora que se sabe que this.Artículos es un array, se puede usar reduce
        const Cantidad_Total = this.Artículos.reduce((Total, Elemento) => Total + (Elemento.Cantidad || 1), 0);
        const Contador_Carrito = document.getElementById('Contador_Carrito');

        if (Contador_Carrito) {
            Contador_Carrito.textContent = Cantidad_Total;

            // Mostrar u ocultar según si hay Artículos
            if (Cantidad_Total > 0) {
                Contador_Carrito.classList.add('Visible');
            } else {
                Contador_Carrito.classList.remove('Visible');
            }

            // Animación de actualización
            Contador_Carrito.classList.add('Actualizado');
            setTimeout(() => {
                Contador_Carrito.classList.remove('Actualizado');
            }, 300);

            console.log('Contador actualizado:', Cantidad_Total);
        } else {
            console.warn('Elemento Contador_Carrito no encontrado en el DOM');
        }
    },

    // Inicializar botones de agregar al carrito
    Inicializar_Botones: function () {
        console.log('Inicializando botones del carrito');

        // DIAGNÓSTICO: Verificar qué botones existen en la página
        console.log('Botones Botón_Agregar:', document.querySelectorAll('.Botón_Agregar').length);
        console.log('Botones Botón_Tarjeta:', document.querySelectorAll('.Botón_Tarjeta').length);
        console.log('Botones "Agregar Todo":', document.querySelectorAll('button.Botones.Botón_Primario').length);

        // Botones "Agregar al Carrito" (Botón_Agregar)
        document.querySelectorAll('.Botón_Agregar:not([data-cart])').forEach(Botón => {
            Botón.setAttribute('data-cart', 'true');
            console.log('Configurando botón Botón_Agregar');
            Botón.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!tuJwt) {
                    const modal = document.getElementById('Modal_Login');
                    if (modal) modal.classList.add('show');
                    return;
                }

                // 1) Obtener contenedor
                const Contenedor_Producto = Botón.closest('.Producto') ||
                    Botón.closest('.Detalle_Producto') ||
                    Botón.closest('Artículo') ||
                    Botón.closest('Sección');
                if (!Contenedor_Producto) {
                    console.error('No se encontró el contenedor del producto para Botón_Agregar');
                    return;
                }

                // 2) Precio e imagen
                const Precio_Elemento = Contenedor_Producto.querySelector('.Precio');
                const Precio_Texto = Precio_Elemento
                    ? Precio_Elemento.textContent.trim()
                    : '0';
                const Imagen_Elemento = Contenedor_Producto.querySelector('img');
                const URL_Imagen = Imagen_Elemento
                    ? Imagen_Elemento.src
                    : '';

                // 3) Cantidad
                const Campo_Cantidad = Contenedor_Producto.querySelector('input[type="number"]');
                const Cantidad = Campo_Cantidad
                    ? parseInt(Campo_Cantidad.value, 10) || 1
                    : 1;

                // 4) Nombre base
                const nombreBase = window.productoActual?.Nombre ||
                    Contenedor_Producto.querySelector('h1, h2, h3')?.textContent.trim() ||
                    'Producto';

                // 5) Variante actual (detalle.js)
                const variante = typeof obtenerVarianteActual === 'function'
                    ? obtenerVarianteActual()
                    : null;
                const nombreVariante = variante?.Nombre_Variante || '';

                // 6) Nombre completo
                const nombreCompleto = nombreVariante
                    ? `${nombreBase} – ${nombreVariante}`
                    : nombreBase;

                // 7) Log para verificar
                console.log(
                    'Datos del producto a agregar (Botón_Agregar):',
                    nombreCompleto,
                    Precio_Texto,
                    URL_Imagen,
                    Cantidad
                );

                // 8) Envío al carrito
                this.Agregar_Elemento(
                    nombreCompleto,
                    Precio_Texto,
                    URL_Imagen,
                    Cantidad
                );
            });
        });

        // Botones "Agregar" en tarjetas (Botón_Tarjeta)
        document.querySelectorAll('.Botón_Tarjeta:not([data-cart])').forEach(Botón => {
            Botón.setAttribute('data-cart', 'true');
            console.log('Configurando botón Botón_Tarjeta');
            Botón.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!tuJwt) {
                    const modal = document.getElementById('Modal_Login');
                    if (modal) modal.classList.add('show');
                    return;
                }

                // Obtener información del producto
                const Tarjeta = Botón.closest('.Tarjeta') ||
                    Botón.closest('.Tarjeta_Producto') ||
                    Botón.closest('Artículo');

                if (!Tarjeta) {
                    console.error('No se encontró la tarjeta del producto para Botón_Tarjeta');
                    return;
                }

                const Nombre_Producto = Tarjeta.querySelector('h3, h4')?.textContent.trim() || 'Producto';
                const Precio_Elemento = Tarjeta.querySelector('.Precio');
                const Precio_Texto = Precio_Elemento ? Precio_Elemento.textContent.trim() : '0';
                const Imagen_Elemento = Tarjeta.querySelector('img');
                const URL_Imagen = Imagen_Elemento ? Imagen_Elemento.src : '';

                console.log('Datos del producto a agregar (Botón_Tarjeta):', Nombre_Producto, Precio_Texto, URL_Imagen);

                // Añadir al carrito
                this.Agregar_Elemento(Nombre_Producto, Precio_Texto, URL_Imagen, 1);
            });
        });

        // Botón "Agregar Todo al Carrito" en la sección "Frecuentemente Comprados Juntos"
        document.querySelectorAll('button.Botones.Botón_Primario:not([data-cart])').forEach(Botón => {
            Botón.setAttribute('data-cart', 'true');
            if (Botón.textContent.includes('Agregar Todo')) {
                console.log('Configurando botones Agregar Todo con variante');
                Botón.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // Verificar si se está en la sección de Productos Comprados Juntos
                    const Sección_Paquete = Botón.closest('.Comprados_Juntos');
                    if (Sección_Paquete) {
                        console.log('Botón en sección Productos_Conjunto');

                        // Obtener todos los productos del paquete
                        const Productos_Paquete = Sección_Paquete.querySelectorAll('.Producto_Paquete');
                        console.log('Productos encontrados en paquete:', Productos_Paquete.length);

                        if (Productos_Paquete.length === 0) {
                            console.warn('No se encontraron productos en el paquete');
                            return;
                        }

                        // Agregar cada producto del paquete al carrito, incluyendo variante
                        Productos_Paquete.forEach(Producto => {
                            // Nombre base
                            const nombreBase = Producto.querySelector('.Nombre_Paquete')?.textContent.trim() || 'Producto';
                            // Variante (dataset.volumen o fallback a etiqueta Valor_Característica)
                            const nombreVariante = Producto.dataset.volumen
                                || Producto.querySelector('.Valor_Característica')?.textContent.trim()
                                || '';
                            // Nombre completo
                            const nombreCompleto = nombreVariante
                                ? `${nombreBase} – ${nombreVariante}`
                                : nombreBase;
                            // Precio e imagen
                            const precioTexto = Producto.querySelector('.Precio_Paquete')?.textContent.trim() || '0';
                            const urlImagen = Producto.querySelector('.Imagen_Paquete img')?.src || '';
                            // Cantidad fija
                            const Cantidad = 1;

                            console.log(
                                'Agregando producto del paquete:',
                                nombreCompleto,
                                precioTexto,
                                urlImagen,
                                Cantidad
                            );
                            this.Agregar_Elemento(
                                nombreCompleto,
                                precioTexto,
                                urlImagen,
                                Cantidad
                            );
                        });

                        // Mostrar notificación de éxito
                        if (typeof Mostrar_Notificación === 'function') {
                            Mostrar_Notificación('Todos los productos del paquete han sido agregados al carrito', 'Éxito');
                        } else {
                            console.log('Notificación: Todos los productos del paquete agregados al carrito');
                        }

                    } else {
                        // Si no es la sección de paquete, usar el comportamiento genérico
                        console.log('Botón fuera de la sección Productos_Conjunto');

                        const Contenedor = Botón.closest('Sección')
                            || Botón.closest('.Lista_Productos')
                            || Botón.closest('.Sección_Productos')
                            || document.body;
                        const Productos = Contenedor.querySelectorAll('.Tarjeta_Producto, .Producto');
                        console.log('Productos genéricos encontrados:', Productos.length);

                        if (Productos.length === 0) {
                            console.warn('No se encontraron productos para agregar');
                            return;
                        }

                        Productos.forEach(Producto => {
                            const nombreBase = Producto.querySelector('h3, h4')?.textContent.trim() || 'Producto';
                            const nombreVariante = Producto.dataset.volumen || '';
                            const nombreCompleto = nombreVariante
                                ? `${nombreBase} – ${nombreVariante}`
                                : nombreBase;
                            const precioTexto = Producto.querySelector('.Precio')?.textContent.trim() || '0';
                            const urlImagen = Producto.querySelector('img')?.src || '';
                            const Cantidad = 1;

                            console.log(
                                'Agregando producto genérico:',
                                nombreCompleto,
                                precioTexto,
                                urlImagen,
                                Cantidad
                            );
                            this.Agregar_Elemento(
                                nombreCompleto,
                                precioTexto,
                                urlImagen,
                                Cantidad
                            );
                        });

                        if (typeof Mostrar_Notificación === 'function') {
                            Mostrar_Notificación('Todos los productos han sido agregados al carrito', 'Éxito');
                        } else {
                            console.log('Notificación: Todos los productos agregados al carrito');
                        }
                    }
                });
            }
        });

        // Botones estándar de la funcionalidad existente
        document.querySelectorAll('.Botón_Añadir_Al_Carrito:not([data-cart])').forEach(Botón => {
            Botón.setAttribute('data-cart', 'true');
            console.log('Configurando botones Botón_Añadir_Al_Carrito');
            Botón.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!tuJwt) {
                    const modal = document.getElementById('Modal_Login');
                    if (modal) modal.classList.add('show');
                    return;
                }

                // 1) Ubicamos la tarjeta de producto y validamos
                const Tarjeta_Producto = Botón.closest('.Tarjeta_Producto');
                if (!Tarjeta_Producto) {
                    console.error('No se encontró el elemento padre .Tarjeta_Producto');
                    return;
                }

                // 2) Nombre base
                const nombreBase = Tarjeta_Producto
                    .querySelector('h3')
                    .textContent.trim();

                // 3) Variante predeterminada (viene en data-volumen desde productos.js)
                const nombreVariante = Tarjeta_Producto.dataset.volumen || '';

                // 4) Componemos el nombre completo
                const nombreCompleto = nombreVariante
                    ? `${nombreBase} – ${nombreVariante}`
                    : nombreBase;

                // 5) Precio e imagen
                const precioTexto = Tarjeta_Producto
                    .querySelector('.Precio')
                    .textContent.trim();
                const urlImagen = Tarjeta_Producto
                    .querySelector('.Imagen_Producto img')
                    .src;

                // 6) Cantidad fija (1)
                const Cantidad = 1;

                // 7) Log para verificar
                console.log(
                    'Datos del producto a agregar (Botón_Añadir_Al_Carrito):',
                    nombreCompleto,
                    precioTexto,
                    urlImagen,
                    Cantidad
                );

                // 8) Llamada a Agregar_Elemento con variante incluida
                this.Agregar_Elemento(
                    nombreCompleto,
                    precioTexto,
                    urlImagen,
                    Cantidad
                );
            });
        });
    },

    // Vaciar carrito
    Vaciar: function () {
        this.Artículos = [];
        this.Guardar_Artículos();
        this.Actualizar_Contador();
        console.log('Carrito vaciado');
    }
};

// Inicializar carrito cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function () {
    // 0) Obtener token
    const tuJwt = localStorage.getItem('token');
    const menuUsuario = document.querySelector('.Menú_Usuario');
    const nombreElem = document.querySelector('.Nombre_Usuario');
    const emailElem = document.querySelector('.Email_Usuario');

    if (!tuJwt) {
        // Si no hay token, ocultar todo el menú de usuario
        if (menuUsuario) menuUsuario.style.display = 'none';
    } else {
        // Si hay token, asegurarse de que el menú esté visible
        if (menuUsuario) menuUsuario.style.display = '';
        // 1) Cargar datos del perfil
        try {
            const resp = await fetch(`${baseUrl}/api/usuarios/me`, {
                headers: { 'Authorization': `Bearer ${tuJwt}` }
            });
            const json = await resp.json();
            if (resp.ok && json.Éxito) {
                if (nombreElem) nombreElem.textContent = json.Datos.Nombre_Completo;
                if (emailElem) emailElem.textContent = json.Datos.Correo_Electrónico;
            } else {
                throw new Error(json.Mensaje || 'Error al cargar perfil');
            }
        } catch (e) {
            console.error('Perfil:', e);
        }
    }
    console.log('DOM cargado, inicializando Carrito, Lista_Deseos e Historial...');
    await Carrito.Inicializar();
    await Lista_Deseos.Inicializar();
    Historial.Inicializar();

    // ── Eventos abrir/cerrar panel de Lista de Deseos ──
    const btnAbrir = document.querySelector('.Botón_Lista_Deseos');
    if (btnAbrir) {
        btnAbrir.addEventListener('click', () => {
            const panel = document.querySelector('.Lista_Deseos');
            if (panel) panel.classList.toggle('Activo');
        });
    }
    const btnCerrar = document.querySelector('.Cerrar_Lista_Deseos');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            const panel = document.querySelector('.Lista_Deseos');
            if (panel) panel.classList.remove('Activo');
        });
    }
});

// Exportar el objeto Carrito para que sea accesible globalmente
window.Carrito = Carrito;

//---------------------------------------Funciones para la Lista de Deseos---------------------------------------

const tuJwt = localStorage.getItem('token');
console.log('JWT cargado:', tuJwt);

const Lista_Deseos = {
    Artículos: [],

    Inicializar: async function () {
        try {
            const resp = await fetch(`${baseUrl}/api/deseos`, {
                headers: { 'Authorization': 'Bearer ' + tuJwt }
            });
            const json = await resp.json();

            if (json.Éxito) {
                const Datos = json.Datos;  // array de variantes

                // 1) Agrupar variantes por productoId
                const grupos = Datos.reduce((acc, item) => {
                    const pid = item.productoId;
                    if (!acc[pid]) acc[pid] = [];
                    acc[pid].push(item);
                    return acc;
                }, {});

                // 2) Para cada grupo, elige la predeterminada o, si no existe, la primera
                Lista_Deseos.Artículos = Object.values(grupos).map(variants => {
                    const variantePred = variants.find(v => v.Predeterminada == 1) || variants[0];
                    return {
                        ID: variantePred.productoId,
                        Nombre: variantePred.Nombre,
                        Imagen: variantePred.imagen,
                        Precio: variantePred.Precio
                    };
                });
            } else {
                Lista_Deseos.Artículos = [];
            }

            // 3) Refresca contador y UI
            Lista_Deseos.Actualizar_Contador();
            Lista_Deseos.Actualizar_UI();
            Lista_Deseos.Configurar_Delegación_Eventos();
            console.log('Lista de Deseos inicializada desde API');
        } catch (e) {
            console.error('Error cargando lista de deseos:', e);
        }
    },

    Cargar_Elementos: function () {
        const Artículos_Guardados = localStorage.getItem('Lista_Deseos_Artículos');
        Lista_Deseos.Artículos = Artículos_Guardados ? JSON.parse(Artículos_Guardados) : [];
        console.log('Artículos de Lista de Deseos cargados desde localStorage:', Lista_Deseos.Artículos);
    },

    Guardar_Artículos: function () {
        localStorage.setItem('Lista_Deseos_Artículos', JSON.stringify(Lista_Deseos.Artículos));
        console.log('Artículos de Lista de Deseos guardados en localStorage');
    },

    Alternar_Favorito: async function (ID, nombre, imagen, precio) {
        try {
            const existe = Lista_Deseos.Artículos.some(x => x.ID == ID);

            if (!existe) {
                // Añadir a BD
                await fetch(`${baseUrl}/api/deseos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + tuJwt
                    },
                    body: JSON.stringify({ productoId: parseInt(ID, 10) })
                });
                // Actualiza local
                Lista_Deseos.Artículos.push({ ID: ID, Nombre: nombre, Imagen: imagen, Precio: precio });
            } else {
                // Eliminar de BD
                await fetch(`${baseUrl}/api/deseos/${ID}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + tuJwt
                    }
                });
                // Actualiza local
                Lista_Deseos.Artículos = this.Artículos.filter(x => x.ID != ID);
            }

            Lista_Deseos.Actualizar_Contador();
            Lista_Deseos.Actualizar_UI();
            return !existe;
        } catch (e) {
            console.error('Error actualizando lista de deseos:', e);
            return false;
        }
    },

    Actualizar_Contador: function () {
        const Contador_Lista_Deseos = document.querySelector('.Contador_Lista_Deseos');
        if (Contador_Lista_Deseos) {
            Contador_Lista_Deseos.textContent = Lista_Deseos.Artículos.length;
            console.log('Contador de Lista de Deseos actualizado:', Lista_Deseos.Artículos.length);
        }
    },

    Actualizar_UI: function () {
        // 1) Actualizar botones de favoritos en las tarjetas existentes
        const Tarjetas = document.querySelectorAll('.Tarjeta_Producto');
        Tarjetas.forEach(tarjeta => {
            const id = tarjeta.dataset.id;
            if (id) {
                const btnFav = tarjeta.querySelector('.Botón_Favorito');
                if (btnFav) {
                    const estaEnFavoritos = Lista_Deseos.Artículos.some(item => item.ID == id);
                    if (estaEnFavoritos) {
                        btnFav.classList.add('Activo');
                    } else {
                        btnFav.classList.remove('Activo');
                    }
                }
            }
        });

        // 2) Actualizar el panel de lista de deseos si existe
        const Elementos_Lista_Deseos = document.querySelector('.Elementos_Lista_Deseos');
        if (Elementos_Lista_Deseos) {
            // Limpiar el contenedor
            Elementos_Lista_Deseos.innerHTML = '';

            // Si está vacía, mostrar mensaje
            if (Lista_Deseos.Artículos.length === 0) {
                Elementos_Lista_Deseos.innerHTML = `
                <div class="Lista_Deseos_Vacía">
                    <i class="fas fa-heart-broken"></i>
                    <p>Su lista de deseos está vacía</p>
                </div>`;
                return;
            }

            // Por cada elemento, clona y rellena template si existe
            const template = document.getElementById('Plantilla_Elemento_Deseo');
            if (template) {
                Lista_Deseos.Artículos.forEach((item, idx) => {
                    const tpl = template.content.cloneNode(true);
                    const root = tpl.querySelector('.Elemento_Lista_Deseos');
                    root.dataset.index = idx;
                    tpl.querySelector('.Imagen_Lista_Deseos img').src = item.Imagen;
                    tpl.querySelector('.Imagen_Lista_Deseos img').alt = item.Nombre;
                    tpl.querySelector('h3').textContent = item.Nombre;
                    tpl.querySelector('.Precio_Lista_Deseos').textContent = item.Precio;
                    Elementos_Lista_Deseos.appendChild(tpl);
                });
            } else {
                // Si no hay template, crear elementos manualmente
                Lista_Deseos.Artículos.forEach((item, idx) => {
                    const div = document.createElement('div');
                    div.className = 'Elemento_Lista_Deseos';
                    div.dataset.index = idx;
                    div.innerHTML = `
                        <div class="Imagen_Lista_Deseos">
                            <img src="${item.Imagen}" alt="${item.Nombre}">
                        </div>
                        <div class="Info_Lista_Deseos">
                            <h3>${item.Nombre}</h3>
                            <div class="Precio_Lista_Deseos">${item.Precio}</div>
                            <button class="Agregar_Carrito">Añadir al Carrito</button>
                        </div>
                        <button class="Eliminar_Deseo">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `;
                    Elementos_Lista_Deseos.appendChild(div);
                });
            }
        }
    },

    Configurar_Delegación_Eventos: function () {
        if (window._listaDeseosEventsAttached) return;
        window._listaDeseosEventsAttached = true;

        // Para la lista de deseos si existe en el DOM
        const Elementos_Lista_Deseos = document.querySelector('.Elementos_Lista_Deseos');
        if (Elementos_Lista_Deseos) {
            Elementos_Lista_Deseos.addEventListener('click', async (e) => {
                // --- Botón eliminar ---
                const btnEliminar = e.target.closest('.Eliminar_Deseo');
                if (btnEliminar) {
                    const elemento = btnEliminar.closest('.Elemento_Lista_Deseos');
                    const idx = parseInt(elemento.dataset.index, 10);
                    if (!isNaN(idx) && idx >= 0 && idx < Lista_Deseos.Artículos.length) {
                        const item = Lista_Deseos.Artículos[idx];          // aquí tus props: item.ID, item.Nombre, etc.
                        const token = localStorage.getItem('token');
                        const url = `${baseUrl}/api/deseos/${item.ID}`;     // <— usa item.ID, no productoId
                        console.log('🗑️ Llamando a DELETE en:', url);

                        try {
                            const resp = await fetch(url, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            console.log('🗒️ Status:', resp.status);

                            const body = await resp.json();                   // parsea como JSON
                            console.log('🗒️ Body:', body);

                            // comprueba tanto el status HTTP como tu campo "Éxito"
                            if (!resp.ok || !body.Éxito) {
                                throw new Error(body.Mensaje || `HTTP ${resp.status}`);
                            }

                            // si todo OK, elimina localmente y refresca UI
                            Lista_Deseos.Artículos = Lista_Deseos.Artículos.filter(x => x.ID !== item.ID);
                            Lista_Deseos.Guardar_Artículos();
                            Lista_Deseos.Actualizar_Contador();
                            Lista_Deseos.Actualizar_UI();
                        } catch (err) {
                            console.error('💥 Error borrando en servidor:', err);
                            alert(`No se pudo eliminar: ${err.message}`);
                        }
                    }
                    return;  // evita que el click “caiga” al handler de agregar al carrito
                }

                // --- Botón añadir al carrito (sin cambios) ---
                const btnAgregar = e.target.closest('.Agregar_Carrito');
                if (btnAgregar && window.Carrito) {
                    const elemento = btnAgregar.closest('.Elemento_Lista_Deseos');
                    const idx = parseInt(elemento.dataset.index, 10);
                    if (!isNaN(idx) && idx >= 0 && idx < Lista_Deseos.Artículos.length) {
                        const item = Lista_Deseos.Artículos[idx];
                        window.Carrito.Agregar_Elemento(item.Nombre, item.Precio, item.Imagen, 1);
                    }
                }
            });
        }

        if (!window._deseosListenerAttached) {
            window._deseosListenerAttached = true;

            // Para botones de favoritos en productos
            document.addEventListener('click', (e) => {
                const btnFav = e.target.closest('.Botón_Favorito');
                if (btnFav) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!tuJwt) {
                        const modal = document.getElementById('Modal_Login');
                        if (modal) modal.classList.add('show');
                        return;
                    }

                    const tarjeta = btnFav.closest('.Tarjeta_Producto');
                    if (tarjeta) {
                        const id = tarjeta.dataset.id;
                        const nombreBase = tarjeta.querySelector('h3')?.textContent.trim() || '';
                        const nombreVariante = tarjeta.dataset.volumen || '';
                        const nombre = nombreVariante
                            ? `${nombreBase} – ${nombreVariante}`
                            : nombreBase;

                        const img = tarjeta.querySelector('img')?.src || '';
                        const precio = tarjeta.querySelector('.Precio')?.textContent.trim() || '';

                        if (id && nombre && img && precio) {
                            const añadido = Lista_Deseos.Alternar_Favorito(id, nombre, img, precio);
                            btnFav.classList.toggle('Activo', añadido);
                        }
                    }
                }
            });
        }

        // Para el botón que alterna visibilidad del panel
        const Botón_Lista_Deseos = document.querySelector('.Botón_Lista_Deseos');
        if (Botón_Lista_Deseos) {
            Botón_Lista_Deseos.addEventListener('click', () => {
                const panel = document.querySelector('.Lista_Deseos');
                if (panel) {
                    panel.classList.toggle('Activo');
                }
            });
        }

        // Para cerrar el panel
        const Botón_Cerrar_Lista_Deseos = document.querySelector('.Cerrar_Lista_Deseos');
        if (Botón_Cerrar_Lista_Deseos) {
            Botón_Cerrar_Lista_Deseos.addEventListener('click', () => {
                const panel = document.querySelector('.Lista_Deseos');
                if (panel) {
                    panel.classList.remove('Activo');
                }
            });
        }
    }
};

//---------------------------------------Funciones para el Historial---------------------------------------

const Historial = {
    // ❶ Array puramente en memoria
    Productos: [],

    // ❷ Arranca vacío y engancha el carrusel
    Inicializar: function () {
        this.Productos = [];
        this.Actualizar_UI();
        this.Configurar_Carrusel();
        console.log('Historial inicializado (memoria)');
    },

    // ❸ Sólo guarda en memoria, no en localStorage
    Añadir_Producto: function (nombre, imagen, precio, id) {
        console.log('Añadiendo al historial:', nombre, id);

        // Quita duplicados por ID
        const idx = this.Productos.findIndex(item => item.ID === id);
        if (idx !== -1) this.Productos.splice(idx, 1);

        // Inserta al frente
        this.Productos.unshift({ Nombre: nombre, Imagen: imagen, Precio: precio, ID: id });

        // Máximo 10 items
        if (this.Productos.length > 10) this.Productos.pop();

        this.Actualizar_UI();
    },

    // ❹ Reconstruye el carrusel según this.Productos
    Actualizar_UI: function () {
        const carr = document.querySelector('.Carrusel_Historial');
        if (!carr) return;

        // 1) Limpiar carrusel
        carr.innerHTML = '';

        // 2) Si no hay productos, muestra mensaje
        if (this.Productos.length === 0) {
            carr.innerHTML = `
      <div class="Historial_Vacío">
        <p>No ha visto productos recientemente</p>
      </div>`;
            return;
        }

        // 3) Reconstruir fragmento
        const frag = document.createDocumentFragment();
        this.Productos.forEach(item => {
            const card = document.createElement('div');
            card.className = 'Producto_Historial';
            card.innerHTML = `
      <div class="Imagen_Historial">
        <img src="${item.Imagen}" alt="${item.Nombre}" loading="lazy">
      </div>
      <div class="Información_Historial">
        <h3 title="${item.Nombre}">${item.Nombre}</h3>
        <div class="Precio_Historial">${item.Precio}</div>
      </div>`;

            // 4) Click abre el modal SIEMPRE (no redirige)
            card.addEventListener('click', () => {
                // 1) intenta abrir con la tarjeta si existe
                const selector = `.Tarjeta_Producto[data-id="${item.ID}"]`;
                const origen = document.querySelector(selector);

                if (origen && window.Abrir_Modal) {
                    return window.Abrir_Modal(origen);
                }

                // 2) si no está en el DOM, abrimos modal con los datos de item
                if (window.Abrir_ModalDesdeHistorial) {
                    return window.Abrir_ModalDesdeHistorial(item);
                }
            });

            frag.appendChild(card);
        });

        // 5) Insertar todo de golpe
        carr.appendChild(frag);
    },

    // ❻ Flechas del carrusel
    Configurar_Carrusel: function () {
        const prev = document.querySelector('.Botón_Anterior');
        const next = document.querySelector('.Botón_Siguiente');
        if (prev && next) {
            prev.addEventListener('click', () => this.Desplazar_Carrusel('Anterior'));
            next.addEventListener('click', () => this.Desplazar_Carrusel('Siguiente'));
        }
    },

    Desplazar_Carrusel: function (dir) {
        const carr = document.querySelector('.Carrusel_Historial');
        if (!carr) return;
        carr.scrollLeft += dir === 'Siguiente' ? 300 : -300;
    }
};

// Exportar objetos globalmente
window.Lista_Deseos = Lista_Deseos;
window.Historial = Historial;

//---------------------------------------Funciones para las Notificaciones Globales---------------------------------------
function Mostrar_Notificación(Mensaje, Tipo = 'Información') {
    // Crear el contenedor si no existe
    let Contenedor = document.getElementById('Contenedor_Notificaciones');
    if (!Contenedor) {
        Contenedor = document.createElement('div');
        Contenedor.id = 'Contenedor_Notificaciones';
        document.body.appendChild(Contenedor);
    }

    // Crear el elemento de notificación
    const Notificación = document.createElement('div');
    Notificación.className = 'Notificación';

    // Seleccionar ícono según tipo
    let Ícono_HTML;
    switch (Tipo) {
        case 'Éxito':
            Ícono_HTML = '<i class="fas fa-check-circle"></i>';
            break;
        case 'Error':
            Ícono_HTML = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'Información':
        default:
            Ícono_HTML = '<i class="fas fa-info-circle"></i>';
            break;
    }

    Notificación.innerHTML = `${Ícono_HTML}<p>${Mensaje}</p>`;

    // Agregar la notificación al contenedor
    Contenedor.appendChild(Notificación);

    // Mostrar la notificación con animación
    setTimeout(() => {
        Notificación.classList.add('Mostrar');
    }, 100);

    // Ocultar y eliminar la notificación después de 3 segundos
    setTimeout(() => {
        Notificación.classList.remove('Mostrar');
        setTimeout(() => {
            Notificación.remove();
        }, 300);
    }, 3000);
}

//---------------------------------------Funciones para las Migas de Pan Globales---------------------------------------
document.addEventListener('DOMContentLoaded', function () {
    const Migas_Pan = document.querySelector('.Migas_Pan');
    // Solo si realmente existe, ejecuto TODO lo de migas de pan
    if (Migas_Pan) {
        // Selecciono sus enlaces y agrego listeners
        const Enlaces = Migas_Pan.querySelectorAll('a');
        Enlaces.forEach(Enlace => {
            Enlace.addEventListener('mouseenter', function () {
                this.style.textDecoration = 'underline';
                this.style.color = 'var(--Primario)';
            });
            Enlace.addEventListener('mouseleave', function () {
                this.style.textDecoration = 'none';
                this.style.color = '';
            });
            Enlace.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') {
                    e.preventDefault();
                    console.log('Navegando a:', this.textContent.trim());
                }
            });
        });

        // Lógica de actualización inicial
        function Actualizar_Migas_Pan() {
            const Ruta_Actual = window.location.pathname;
            const Segmentos_Ruta = Ruta_Actual.split('/').filter(Segmento => Segmento !== '');

            if (Segmentos_Ruta.length > 0) {
                // Aquí se podría implementar la lógica para actualizar dinámicamente
                // las migas de pan basadas en la ruta actual
                console.log('Ruta actual:', Segmentos_Ruta);
            }
        }
        Actualizar_Migas_Pan();

        // Defino la función global solo si tiene sentido
        window.Agregar_Miga_Pan = function (texto, Enlace) {
            const Contenedor = document.querySelector('.Contenedor_Migas_Pan');
            if (!Contenedor) return false;               // ← Añade este guard
            const Elemento_Actual = Contenedor.querySelector('.Actual');
            if (Elemento_Actual) {
                // Convertir el elemento actual en un enlace regular
                const Nuevo_Enlace = document.createElement('a');
                Nuevo_Enlace.href = Enlace || '#';
                Nuevo_Enlace.textContent = Elemento_Actual.textContent;

                // Reemplazar el elemento actual con el nuevo enlace
                Contenedor.replaceChild(Nuevo_Enlace, Elemento_Actual);

                // Añadir Separador
                const Separador = document.createElement('span');
                Separador.textContent = '/';
                Contenedor.appendChild(Separador);

                // Añadir nuevo elemento actual
                const Nuevo_Actual = document.createElement('span');
                Nuevo_Actual.className = 'Actual';
                Nuevo_Actual.textContent = texto;
                Contenedor.appendChild(Nuevo_Actual);

                return true;
            }
            return false;
        };
    }
});

//---------------------------------------Funciones para Historial de Compras---------------------------------------
// Variables globales para el historial
window.Historial_Global = {
    Pedidos: [],
    Datos_Usuario: null,
    Modal_Abierto: false
};

// Configuración global para formatos
window.Configuración_Historial = {
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
};

/**
 * Cargar datos del usuario desde la API
 */
async function Cargar_Datos_Usuario_Global() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.Historial_Global.Datos_Usuario = {
            Nombre_Completo: 'Cliente',
            Correo_Electrónico: 'No disponible',
            Teléfono: 'No disponible'
        };
        return;
    }

    try {
        const resp = await fetch(`${baseUrl}/api/usuarios/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await resp.json();

        if (resp.ok && json.Éxito) {
            window.Historial_Global.Datos_Usuario = {
                Nombre_Completo: json.Datos.Nombre_Completo,
                Correo_Electrónico: json.Datos.Correo_Electrónico,
                Teléfono: json.Datos.Teléfono
            };
        } else {
            throw new Error(json.Mensaje || 'No se pudo cargar perfil');
        }
    } catch (e) {
        console.error('Error cargando perfil de usuario:', e);
        window.Historial_Global.Datos_Usuario = {
            Nombre_Completo: 'Cliente',
            Correo_Electrónico: 'No disponible',
            Teléfono: 'No disponible'
        };
    }
}

/**
 * Cargar historial de pedidos desde la API
 */
async function Cargar_Historial_Pedidos_Global() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.warn('No hay token para cargar historial');
        return false;
    }

    try {
        const resp = await fetch(`${baseUrl}/api/pedidos/usuario`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const json = await resp.json();

        if (!resp.ok || !json.Éxito) {
            throw new Error(json.Mensaje || resp.statusText);
        }

        window.Historial_Global.Pedidos = json.Datos;
        return true;
    } catch (e) {
        console.error('❌ Error cargando historial desde API:', e);
        if (typeof Mostrar_Notificación === 'function') {
            Mostrar_Notificación('No se pudo cargar el historial de pedidos', 'Error');
        }
        return false;
    }
}

/**
 * Renderizar la tabla de historial de pedidos
 */
function Renderizar_Historial_Global() {
    const tabla = document.getElementById('Tabla_Historial');
    if (!tabla) {
        console.warn('No se encontró el elemento Tabla_Historial');
        return;
    }

    tabla.innerHTML = '';

    window.Historial_Global.Pedidos.forEach(p => {
        const idOrden = p.ID_Pedido || p.numeroPedido;
        const totalVal = parseFloat(p.Total) || 0;
        const fecha = new Date(p.fecha);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', window.Configuración_Historial.Formato_Fecha_Corta);
        const estadoCapitalizado = p.estadoPedido.charAt(0).toUpperCase() + p.estadoPedido.slice(1);

        // ✓ Solo mostramos el icono de factura si NO está Pendiente ni Cancelado
        const puedeVerFactura = p.estadoPedido !== 'Pendiente' && p.estadoPedido !== 'Cancelado';
        const botonFactura = puedeVerFactura
            ? `<button class="Botones Botón_Accion" onclick="Ver_Factura_Global('${idOrden}')">
                 <i class="fas fa-file-invoice"></i>
               </button>`
            : '';  // cadena vacía en caso contrario

        const fila = document.createElement('div');
        fila.className = 'Fila_Tabla';
        fila.innerHTML = `
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

        tabla.appendChild(fila);
    });
}

/**
 * Ver factura de un pedido específico
 */
async function Ver_Factura_Global(ID_Pedido) {
    try {
        // Buscar el pedido en el historial cargado
        let pedido = window.Historial_Global.Pedidos.find(p =>
            (p.ID_Pedido || p.numeroPedido) == ID_Pedido
        );

        if (!pedido) {
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('No se pudo encontrar la factura solicitada', 'Error');
            }
            return;
        }

        // Si no tiene items, cargarlos desde la API
        if (!Array.isArray(pedido.items) || pedido.items.length === 0) {
            const token = localStorage.getItem('token');
            const resp = await fetch(`${baseUrl}/api/pedidos/${ID_Pedido}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await resp.json();

            if (!resp.ok || !json.Éxito) {
                throw new Error(json.Mensaje || 'Error cargando detalles del pedido');
            }

            pedido = {
                ...json.Datos.pedido,
                items: json.Datos.items
            };
        }

        // Actualizar el modal y mostrarlo
        Actualizar_Modal_Factura_Global(pedido);
        Mostrar_Modal_Factura_Global();

    } catch (err) {
        console.error('Error al ver factura:', err);
        if (typeof Mostrar_Notificación === 'function') {
            Mostrar_Notificación('No se pudo cargar la factura completa', 'Error');
        }
    }
}

/**
 * Actualizar el contenido del modal de factura
 */
function Actualizar_Modal_Factura_Global(pedido) {
    // Número y fecha
    const numeroFactura = document.getElementById('Número_Factura');
    const fechaFactura = document.getElementById('Fecha_Factura');

    if (numeroFactura) numeroFactura.textContent = `F-${pedido.numeroPedido}`;
    if (fechaFactura) fechaFactura.textContent = Formatear_Fecha_Global(pedido.fecha);

    // Datos del cliente
    const nombreCliente = document.getElementById('Nombre_Cliente');
    const direccionCliente = document.getElementById('Dirección_Cliente');
    const telefonoCliente = document.getElementById('Teléfono_Cliente');
    const correoCliente = document.getElementById('Correo_Electrónico_Cliente');

    if (nombreCliente) {
        nombreCliente.textContent = window.Historial_Global.Datos_Usuario?.Nombre_Completo || 'Cliente';
    }
    if (direccionCliente) {
        direccionCliente.textContent = pedido.direccionEnvio || 'No Disponible';
    }
    if (telefonoCliente) {
        telefonoCliente.textContent = window.Historial_Global.Datos_Usuario?.Teléfono || 'No Disponible';
    }
    if (correoCliente) {
        correoCliente.textContent = window.Historial_Global.Datos_Usuario?.Correo_Electrónico || 'No Disponible';
    }

    // Productos
    const tablaItems = document.getElementById('Factura_Artículos');
    if (tablaItems && pedido.items) {
        tablaItems.innerHTML = '';
        pedido.items.forEach(item => {
            const precio = parseFloat(item.Precio_Unitario) || 0;
            const subtotalProducto = precio * item.Cantidad;

            // si existe variante, la concatenamos
            const nombre = item.nombreVariante
                ? `${item.nombreProducto} – ${item.nombreVariante}`
                : item.nombreProducto;

            const fila = document.createElement('tr');
            fila.innerHTML = `
              <td>${nombre}</td>
              <td>${item.Cantidad}</td>
              <td>$${precio.toFixed(2)}</td>
              <td>$${subtotalProducto.toFixed(2)}</td>
            `;
            tablaItems.appendChild(fila);
        });
    }

    // Cálculos de totales
    const Subtotal = parseFloat(pedido.Subtotal) || 0;
    const envio = parseFloat(pedido.envio) || 0;
    const descuento = parseFloat(pedido.descuento) || 0;
    const iva = Subtotal * 0.15;
    const totalConIVA = Subtotal + iva + envio - descuento;

    // Actualizar elementos de totales
    const subtotalFactura = document.getElementById('Subtotal_Factura');
    const ivaFactura = document.getElementById('IVA_Factura');
    const envioFactura = document.getElementById('Envío_Factura');
    const totalFactura = document.getElementById('Total_Factura');
    const descuentoFactura = document.getElementById('Descuento_Factura');
    const filaDescuento = document.getElementById('Fila_Descuento_Factura');

    if (subtotalFactura) subtotalFactura.textContent = `$${Subtotal.toFixed(2)}`;
    if (ivaFactura) ivaFactura.textContent = `$${iva.toFixed(2)}`;
    if (envioFactura) envioFactura.textContent = envio > 0 ? `$${envio.toFixed(2)}` : 'Gratis';
    if (totalFactura) totalFactura.textContent = `$${totalConIVA.toFixed(2)}`;

    // Manejar descuento
    if (descuento > 0) {
        if (filaDescuento) filaDescuento.style.display = 'table-row';
        if (descuentoFactura) descuentoFactura.textContent = `-$${descuento.toFixed(2)}`;
    } else {
        if (filaDescuento) filaDescuento.style.display = 'none';
    }
}

/**
 * Mostrar el modal de factura
 */
function Mostrar_Modal_Factura_Global() {
    const modal = document.getElementById('Modal_Factura');
    if (modal) {
        modal.style.display = 'flex';
        window.Historial_Global.Modal_Abierto = true;
    }
}

/**
 * Cerrar el modal de factura
 */
function Cerrar_Modal_Factura_Global() {
    const modal = document.getElementById('Modal_Factura');
    if (modal) {
        modal.style.display = 'none';
        window.Historial_Global.Modal_Abierto = false;
    }
}

/**
 * Imprimir factura
 */
function Imprimir_Factura_Global() {
    const contenidoFactura = document.getElementById('Contenido_Factura');
    if (!contenidoFactura) {
        console.error('No se encontró el contenido de la factura');
        return;
    }

    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    ventanaImpresion.document.write(`
        <html>
            <head>
                <title>Factura</title>
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
                ${contenidoFactura.innerHTML}
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
        </html>
    `);
    ventanaImpresion.document.close();
}

/**
 * Formatear fecha ISO a formato legible
 */
function Formatear_Fecha_Global(fechaISO) {
    try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-EC', window.Configuración_Historial.Formato_Fecha);
    } catch (error) {
        console.error("Error al formatear fecha:", error);
        return fechaISO;
    }
}

/**
 * Inicializar historial de compras (función principal)
 * Llamar esta función en las páginas que necesiten el historial
 */
async function Inicializar_Historial_Global() {
    console.log("Inicializando historial global...");

    // Cargar datos del usuario
    await Cargar_Datos_Usuario_Global();

    // Cargar historial de pedidos
    const historialCargado = await Cargar_Historial_Pedidos_Global();

    if (historialCargado) {
        // Renderizar la tabla
        Renderizar_Historial_Global();

        // Inicializar eventos del modal
        Inicializar_Eventos_Modal_Global();

        console.log("Historial global inicializado correctamente");
        return true;
    } else {
        console.warn("No se pudo cargar el historial");
        return false;
    }
}

/**
 * Inicializar eventos del modal
 */
function Inicializar_Eventos_Modal_Global() {
    // Cerrar modal con botón X
    const botonCerrar = document.querySelector('.Cerrar_Modal_Factura');
    if (botonCerrar) {
        botonCerrar.addEventListener('click', Cerrar_Modal_Factura_Global);
    }

    // Cerrar modal al hacer clic fuera del contenido
    const modal = document.getElementById('Modal_Factura');
    if (modal) {
        modal.addEventListener('click', function (event) {
            if (event.target === modal) {
                Cerrar_Modal_Factura_Global();
            }
        });
    }

    // Botón de imprimir
    const botonImprimir = document.getElementById('Imprimir_Factura');
    if (botonImprimir) {
        botonImprimir.addEventListener('click', Imprimir_Factura_Global);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Siempre registro el cierre de modal de factura
    const cerrarModalBtn = document.querySelector('#Modal_Factura .Cerrar_Modal_Factura');
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', Cerrar_Modal_Factura_Global);
    }

    // Y también me aseguro de registrar el click fuera del contenido
    const modal = document.getElementById('Modal_Factura');
    if (modal) {
        modal.addEventListener('click', event => {
            if (event.target === modal) {
                Cerrar_Modal_Factura_Global();
            }
        });
    }

    // Botón de imprimir factura
    const imprimirBtn = document.getElementById('Imprimir_Factura');
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', Imprimir_Factura_Global);
    }
});

// ========================================
// FUNCIONES DE UTILIDAD PARA EXPORTAR
// ========================================

/**
 * Actualiza el menú de usuario (mostrar/ocultar + nombre/email)
 * y re-inicializa Carrito, ListaDeseos e Historial
 */
async function actualizarUsuarioLogueado() {
    const tuJwt = localStorage.getItem('token');
    const menuUsuario = document.querySelector('.Menú_Usuario');
    const nombreElem = document.querySelector('.Nombre_Usuario');
    const emailElem = document.querySelector('.Email_Usuario');

    if (!tuJwt) {
        if (menuUsuario) menuUsuario.style.display = 'none';
        return;
    }

    if (menuUsuario) menuUsuario.style.display = '';

    try {
        const resp = await fetch(`${baseUrl}/api/usuarios/me`, {
            headers: { 'Authorization': `Bearer ${tuJwt}` }
        });
        const json = await resp.json();
        if (resp.ok && json.Éxito) {
            if (nombreElem) nombreElem.textContent = json.Datos.Nombre_Completo;
            if (emailElem) emailElem.textContent = json.Datos.Correo_Electrónico;
        } else {
            throw new Error(json.Mensaje || 'Error al cargar perfil');
        }
        // Mostrar opción de Administrador solo si existe el contenedor
        if (menuUsuario) {
            try {
                const payload = JSON.parse(atob(tuJwt.split('.')[1]));
                if (payload.rol === 'Administrador') {
                    const menuItems = menuUsuario.querySelector('.Items_Menú');
                    if (menuItems && !document.getElementById('AdminMenuItem')) {
                        const li = document.createElement('li');
                        li.className = 'Item_Menú';
                        li.id = 'AdminMenuItem';
                        li.innerHTML = `<a href="/html/administrador.html"> 
                            <i class="fas fa-user-shield"></i> Administrador 
                          </a>`;
                        menuItems.appendChild(li);
                    }
                }
            } catch (e) {
                console.error('Error al comprobar rol de usuario:', e);
            }
        }
    } catch (e) {
        console.error('Perfil:', e);
    }

    await Carrito.Inicializar();
    await Lista_Deseos.Inicializar();
    Historial.Inicializar();
}

// Hacemos la función accesible globalmente
window.actualizarUsuarioLogueado = actualizarUsuarioLogueado;

// Exportar funciones principales al objeto global
window.Historial_Funciones = {
    inicializar: Inicializar_Historial_Global,
    cargarHistorial: Cargar_Historial_Pedidos_Global,
    renderizar: Renderizar_Historial_Global,
    verFactura: Ver_Factura_Global,
    cerrarModal: Cerrar_Modal_Factura_Global,
    imprimirFactura: Imprimir_Factura_Global
};

// ——————————————————————————————————————————————
// Auto-login al cargar la página si ya hay token
// ——————————————————————————————————————————————
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('token')) {
        console.log('🔁 Token detectado al cargar → llamando a actualizarUsuarioLogueado()');
        actualizarUsuarioLogueado();
    }
});