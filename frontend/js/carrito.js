document.addEventListener('DOMContentLoaded', function () {
    Inicializar_Historial_Global();

    // Asegur que el objeto global Carrito esté disponible
    if (!window.Carrito) {
        console.error('El objeto Carrito no está disponible. Verifique que se cargue antes que este script.');
        return;
    }

    // Verificar que los elementos existan antes de asignarlos
    const Lista_Productos_Carrito = document.getElementById('Lista_Productos_Carrito');

    // Inicializar el carrito
    Inicializar_Carrito();

    // Función para cargar productos del carrito
    function Cargar_Productos_Carrito() {
        console.log('Cargando productos del carrito...');

        // Ahora se puede buscar el elemento nuevamente, ya que podría haberse creado
        const Carrito_Vacío = document.getElementById('Carrito_Vacío');

        // Cargar desde localStorage usando el objeto Carrito
        if (window.Carrito) {
            // Asegurarse de cargar los elementos más recientes
            window.Carrito.Cargar_Elementos();

            // Asegurarse de que artículos sea un array
            let Artículos = window.Carrito.Artículos;
            // Convertir a array si es un objeto (no array)
            if (Artículos && typeof Artículos === 'object' && !Array.isArray(Artículos)) {
                Artículos = Object.values(Artículos);
                // Actualizar Carrito.Artículos con el array
                window.Carrito.Artículos = Artículos;
            }

            console.log('Productos cargados:', Artículos);

            if (!Artículos || Artículos.length === 0) {
                if (Carrito_Vacío) Carrito_Vacío.style.display = 'flex';
                if (Lista_Productos_Carrito) Lista_Productos_Carrito.style.display = 'none';
                return;
            }

            // Ocultar mensaje de carrito vacío y mostrar lista
            if (Carrito_Vacío) Carrito_Vacío.style.display = 'none';
            if (Lista_Productos_Carrito) Lista_Productos_Carrito.style.display = 'block';

            // Limpiar la lista antes de repoblar
            if (Lista_Productos_Carrito) {
                // Conservar solo la plantilla
                const Plantilla = Lista_Productos_Carrito.querySelector('#Plantilla_Producto_Carrito');
                Lista_Productos_Carrito.innerHTML = '';
                if (Plantilla) Lista_Productos_Carrito.appendChild(Plantilla);
            }

            // Obtener la plantilla
            const Plantilla = document.getElementById('Plantilla_Producto_Carrito');
            if (!Plantilla) {
                console.error('Plantilla de producto no encontrada');
                return;
            }

            // Añadir cada producto al DOM
            Artículos.forEach((Elemento, Índice) => {
                const Clon_Producto = Plantilla.content.cloneNode(true);

                // Asignar ID único para referencia
                Clon_Producto.querySelector('.Producto_Carrito').dataset.id = Índice;

                // Llenar datos del producto
                const Imagen_Elemento = Clon_Producto.querySelector('.Imagen_Producto_Carrito img');
                if (Imagen_Elemento) {
                    Imagen_Elemento.src = Elemento.Imagen || '';
                    Imagen_Elemento.alt = Elemento.Nombre || 'Producto';
                }

                const Nombre_Elemento = Clon_Producto.querySelector('.Nombre_Producto_Carrito');
                if (Nombre_Elemento) Nombre_Elemento.textContent = Elemento.Nombre || 'Producto sin nombre';

                const Precio_Elemento = Clon_Producto.querySelector('.Valor_Precio');
                if (Precio_Elemento) Precio_Elemento.textContent = `$${(Elemento.Precio || 0).toFixed(2)}`;

                const Campo_Cantidad = Clon_Producto.querySelector('.Campo_Cantidad');
                if (Campo_Cantidad) Campo_Cantidad.value = Elemento.Cantidad || 1;

                // Calcular y mostrar subtotal
                const Subtotal = (Elemento.Precio || 0) * (Elemento.Cantidad || 1);
                const Subtotal_Elemento = Clon_Producto.querySelector('.Valor_Subtotal');
                if (Subtotal_Elemento) Subtotal_Elemento.textContent = `$${Subtotal.toFixed(2)}`;

                // Agregar al contenedor
                Lista_Productos_Carrito.appendChild(Clon_Producto);
            });

            // Configurar eventos para los nuevos elementos
            Configurar_Eventos_Productos();

            // Actualizar resumen
            Actualizar_Resumen_Compra();
        } else {
            console.error('El objeto Carrito no está disponible');
            if (Carrito_Vacío) Carrito_Vacío.style.display = 'flex';
            if (Lista_Productos_Carrito) Lista_Productos_Carrito.style.display = 'none';
        }
    }

    // Configurar eventos para botones de cantidad y eliminar
    function Configurar_Eventos_Productos() {
        // Botones de aumentar cantidad
        document.querySelectorAll('.Botón_Aumentar').forEach(Botón => {
            Botón.addEventListener('click', function () {
                const Producto = this.closest('.Producto_Carrito');
                const Índice = Producto.dataset.id;
                const Campo_Cantidad = Producto.querySelector('.Campo_Cantidad');
                let Cantidad = parseInt(Campo_Cantidad.value) + 1;

                Actualizar_Cantidad_Producto(Índice, Cantidad);
            });
        });

        // Botones de disminuir cantidad
        document.querySelectorAll('.Botón_Disminuir').forEach(Botón => {
            Botón.addEventListener('click', function () {
                const Producto = this.closest('.Producto_Carrito');
                const Índice = Producto.dataset.id;
                const Campo_Cantidad = Producto.querySelector('.Campo_Cantidad');
                let Cantidad = parseInt(Campo_Cantidad.value) - 1;

                if (Cantidad < 1) Cantidad = 1;
                Actualizar_Cantidad_Producto(Índice, Cantidad);
            });
        });

        // Campos de cantidad
        document.querySelectorAll('.Campo_Cantidad').forEach(Campo => {
            Campo.addEventListener('change', function () {
                const Producto = this.closest('.Producto_Carrito');
                const Índice = Producto.dataset.id;
                let Cantidad = parseInt(this.value);

                if (isNaN(Cantidad) || Cantidad < 1) {
                    Cantidad = 1;
                    this.value = 1;
                }

                Actualizar_Cantidad_Producto(Índice, Cantidad);
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.Botón_Eliminar_Producto').forEach(Botón => {
            Botón.addEventListener('click', function () {
                const Producto = this.closest('.Producto_Carrito');
                const Índice = Producto.dataset.id;

                if (window.Carrito && window.Carrito.Artículos[Índice]) {
                    const Nombre_Producto = window.Carrito.Artículos[Índice].Nombre;
                    // Mostrar modal de confirmación en lugar de eliminar directamente
                    Mostrar_Modal_Eliminar_Producto(Índice, Nombre_Producto);
                }
            });
        });
    }

    // Función para mostrar el modal de confirmación para eliminar un producto
    function Mostrar_Modal_Eliminar_Producto(Índice, Nombre_Producto) {
        const Modal_Confirmación = document.getElementById('Modal_Confirmación');
        if (!Modal_Confirmación) return;

        // Personalizar mensaje si es necesario
        const Mensaje_Elemento = Modal_Confirmación.querySelector('.Cuerpo_Modal p');
        if (Mensaje_Elemento) {
            Mensaje_Elemento.textContent = `¿Está seguro de que desea eliminar ${Nombre_Producto} del carrito?`;
        }

        // Mostrar el modal con la clase correcta
        Modal_Confirmación.classList.add('Mostrar');

        // Configurar botones del modal
        const Botón_Confirmar = document.getElementById('Confirmar_Eliminar');
        const Botón_Cancelar = document.getElementById('Cancelar_Eliminar');
        const Botón_Cerrar = Modal_Confirmación.querySelector('.Cerrar_Modal');

        // Eliminar eventos anteriores si existen
        if (Botón_Confirmar) {
            const Nuevo_Botón_Confirmar = Botón_Confirmar.cloneNode(true);
            Botón_Confirmar.parentNode.replaceChild(Nuevo_Botón_Confirmar, Botón_Confirmar);

            Nuevo_Botón_Confirmar.addEventListener('click', function () {
                Eliminar_Producto(Índice);
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        if (Botón_Cancelar) {
            const Nuevo_Botón_Cancelar = Botón_Cancelar.cloneNode(true);
            Botón_Cancelar.parentNode.replaceChild(Nuevo_Botón_Cancelar, Botón_Cancelar);

            Nuevo_Botón_Cancelar.addEventListener('click', function () {
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        if (Botón_Cerrar) {
            const Nuevo_Botón_Cerrar = Botón_Cerrar.cloneNode(true);
            Botón_Cerrar.parentNode.replaceChild(Nuevo_Botón_Cerrar, Botón_Cerrar);

            Nuevo_Botón_Cerrar.addEventListener('click', function () {
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        // Cerrar al hacer clic fuera del modal
        window.addEventListener('click', function Cerrar_Modal_Fuera(e) {
            if (e.target === Modal_Confirmación) {
                Modal_Confirmación.classList.remove('Mostrar');
                window.removeEventListener('click', Cerrar_Modal_Fuera);
            }
        });
    }

    // Función para mostrar el modal de confirmación para vaciar el carrito
    function Mostrar_Modal_Vaciar_Carrito() {
        const Modal_Confirmación = document.getElementById('Modal_Vaciar_Carrito');
        if (!Modal_Confirmación) return;

        // Mostrar el modal con la clase correcta
        Modal_Confirmación.classList.add('Mostrar');

        // Configurar botones del modal
        const Botón_Confirmar = document.getElementById('Confirmar_Vaciar');
        const Botón_Cancelar = document.getElementById('Cancelar_Vaciar');
        const Botón_Cerrar = Modal_Confirmación.querySelector('.Cerrar_Modal');

        // Eliminar eventos anteriores si existen
        if (Botón_Confirmar) {
            const Nuevo_Botón_Confirmar = Botón_Confirmar.cloneNode(true);
            Botón_Confirmar.parentNode.replaceChild(Nuevo_Botón_Confirmar, Botón_Confirmar);

            Nuevo_Botón_Confirmar.addEventListener('click', function () {
                Vaciar_Carrito();
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        if (Botón_Cancelar) {
            const Nuevo_Botón_Cancelar = Botón_Cancelar.cloneNode(true);
            Botón_Cancelar.parentNode.replaceChild(Nuevo_Botón_Cancelar, Botón_Cancelar);

            Nuevo_Botón_Cancelar.addEventListener('click', function () {
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        if (Botón_Cerrar) {
            const Nuevo_Botón_Cerrar = Botón_Cerrar.cloneNode(true);
            Botón_Cerrar.parentNode.replaceChild(Nuevo_Botón_Cerrar, Botón_Cerrar);

            Nuevo_Botón_Cerrar.addEventListener('click', function () {
                Modal_Confirmación.classList.remove('Mostrar');
            });
        }

        // Cerrar al hacer clic fuera del modal
        window.addEventListener('click', function Cerrar_Modal_Fuera(e) {
            if (e.target === Modal_Confirmación) {
                Modal_Confirmación.classList.remove('Mostrar');
                window.removeEventListener('click', Cerrar_Modal_Fuera);
            }
        });
    }

    // Actualizar cantidad de un producto
    function Actualizar_Cantidad_Producto(Índice, Nueva_Cantidad) {
        if (window.Carrito && window.Carrito.Artículos[Índice]) {
            // Actualizar en el objeto Carrito
            const Nombre_Producto = window.Carrito.Artículos[Índice].Nombre;
            window.Carrito.Actualizar_Cantidad(Nombre_Producto, Nueva_Cantidad);

            // Actualizar la UI
            const Producto = document.querySelector(`.Producto_Carrito[data-id="${Índice}"]`);
            if (!Producto) return;

            const Precio = window.Carrito.Artículos[Índice].Precio;
            const Subtotal = Precio * Nueva_Cantidad;

            const Campo_Cantidad = Producto.querySelector('.Campo_Cantidad');
            if (Campo_Cantidad) Campo_Cantidad.value = Nueva_Cantidad;

            const Subtotal_Elemento = Producto.querySelector('.Valor_Subtotal');
            if (Subtotal_Elemento) Subtotal_Elemento.textContent = `$${Subtotal.toFixed(2)}`;

            // Actualizar resumen del carrito
            Actualizar_Resumen_Compra();
        }
    }

    // Eliminar un producto del carrito
    function Eliminar_Producto(Índice) {
        if (window.Carrito && window.Carrito.Artículos[Índice]) {
            const Nombre_Producto = window.Carrito.Artículos[Índice].Nombre;

            // Eliminar del objeto Carrito
            window.Carrito.Eliminar_Elemento(Nombre_Producto);

            // Recargar la interfaz del carrito
            Cargar_Productos_Carrito();

            // Mostrar notificación si existe la función
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación(`${Nombre_Producto} eliminado del carrito`, 'Información');
            } else {
                console.log(`${Nombre_Producto} eliminado del carrito`);
            }
        }
    }

    // Vaciar todo el carrito
    function Vaciar_Carrito() {
        if (window.Carrito) {
            window.Carrito.Vaciar();
            Cargar_Productos_Carrito();
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('Carrito vaciado correctamente', 'Información');
            } else {
                console.log('Carrito vaciado correctamente');
            }
        }
    }

    // Actualizar resumen de compra - versión simplificada
    function Actualizar_Resumen_Compra() {
        if (!window.Carrito) return;

        // 1) Calcular Subtotal del carrito
        const Subtotal = window.Carrito.Calcular_Total();

        // 2) AUTOSELECCIÓN DE ENVÍO:
        const radioEstandar = document.getElementById('Envío_Estándar');
        const radioGratis = document.getElementById('Envío_Gratis');
        if (Subtotal > 30) {
            radioGratis.checked = true;
        } else {
            radioEstandar.checked = true;
        }

        // 3) Determinar coste de envío según la opción marcada
        let Valor_Costo_Envío = 0;
        if (radioEstandar.checked) {
            Valor_Costo_Envío = 1.50;
        } else if (radioGratis.checked) {
            Valor_Costo_Envío = 0;
        }

        // 4) Actualizar el DOM
        document.getElementById('Subtotal_Carrito').textContent = `$${Subtotal.toFixed(2)}`;
        document.getElementById('Costo_Envío').textContent = `$${Valor_Costo_Envío.toFixed(2)}`;

        const Total = Subtotal + Valor_Costo_Envío;
        document.getElementById('Total_Carrito').textContent = `$${Total.toFixed(2)}`;

        // 5) (opcional) Si quieres que al cambiar manualmente la opción
        //    también se recalcule el resumen, engancha este listener una vez:
        document.querySelectorAll('input[name="Opción_Envío"]').forEach(radio => {
            radio.onchange = Actualizar_Resumen_Compra;
        });

        // 6) Habilita/deshabilita botón de pago
        document.getElementById('Botón_Proceder_Pago').disabled = Subtotal <= 0;
    }

    // Inicialización del carrito y configuración de eventos
    function Inicializar_Carrito() {
        console.log('Inicializando página de carrito simplificada...');

        // Cargar productos del carrito
        Cargar_Productos_Carrito();

        // Configurar otros eventos básicos si existen
        const Botón_Seguir_Comprando = document.getElementById('Botón_Seguir_Comprando');
        if (Botón_Seguir_Comprando) {
            Botón_Seguir_Comprando.addEventListener('click', function () {
                // Redirige a la página de productos (ruta estática)
                window.location.href = '/html/productos.html';
            });
        }

        function Cargar_Modal(URL, Mostrar_Inicio_Sesión = false) {
            // Verificar si ya existe un modal con ese ID en la página actual
            const Modal_Existente = document.getElementById('Modal_Login');
            if (Modal_Existente) {
                // Si ya existe, solo lo muestra
                Modal_Existente.classList.add('show');

                if (Mostrar_Inicio_Sesión) {
                    const Interruptor_Login = document.getElementById('Interruptor_Login');
                    if (Interruptor_Login) {
                        Interruptor_Login.checked = true;
                    }
                }
                return;
            }

            // Continuar con la carga del modal...
            Cargar_Estilo('global.css');
            Cargar_Estilo('login.css');

            fetch(URL)
                .then(Respuesta => {
                    if (!Respuesta.ok) {
                        throw new Error('Error al cargar el modal');
                    }
                    return Respuesta.text();
                })
                .then(html => {
                    // Crear un contenedor temporal para analizar el HTML
                    const Analizador = new DOMParser();
                    const Documento = Analizador.parseFromString(html, 'text/html');

                    // Obtener solo el modal del documento cargado
                    const Modal_Confirmación = Documento.getElementById('Modal_Login');
                    const Sistema_Notificaciones = Documento.getElementById('Sistema_Notificaciones');

                    if (!Modal_Confirmación) {
                        throw new Error('No se encontró el modal en el HTML cargado');
                    }

                    // Añadir el modal y el sistema de notificaciones al DOM
                    document.body.appendChild(Modal_Confirmación);

                    // Añadir el sistema de notificaciones si no existe
                    if (Sistema_Notificaciones && !document.getElementById('Sistema_Notificaciones')) {
                        document.body.appendChild(Sistema_Notificaciones);
                    }

                    // Mostrar el modal
                    setTimeout(() => {
                        Modal_Confirmación.classList.add('show');

                        // Si se solicita mostrar directamente la sección de inicio de sesión
                        if (Mostrar_Inicio_Sesión) {
                            const Interruptor_Login = document.getElementById('Interruptor_Login');
                            if (Interruptor_Login) {
                                Interruptor_Login.checked = true;
                            }
                        }
                    }, 10);

                    // Configurar eventos del modal
                    Configurar_Eventos_Modal();

                    // Cargar scripts necesarios
                    if (typeof Mostrar_Notificación !== 'function') {
                        Cargar_Script('../global/global.js', () => {
                            Cargar_Script('../login/login.js');
                        });
                    } else {
                        Cargar_Script('../login/login.js');
                    }
                })
                .catch(Error => {
                    console.error('Error:', Error);
                    // Fallback: redireccionar a la página de login si hay error
                    window.location.href = '../login/login.html';
                });
        }

        // Función para cargar estilos de forma dinámica
        function Cargar_Estilo(Ruta) {
            // Si la ruta NO empieza por '/' entonces la "normaliza"
            let rutaFinal = Ruta;
            if (!Ruta.startsWith('/')) {
                // Aquí puedes decidir la raíz real de tus estilos
                // Por ejemplo: si todos tus CSS están en /activos/global/ o /páginas/login/
                if (Ruta.includes('global.css')) rutaFinal = '/activos/global/global.css';
                if (Ruta.includes('login.css')) rutaFinal = '/páginas/login/login.css';
                // Agrega más reglas si tienes más rutas
            }

            // Verifica si ya está cargado
            const Estilos_Existentes = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
                .map(Enlace => Enlace.href);

            const URL_Completa = new URL(rutaFinal, window.location.origin).href;

            if (Estilos_Existentes.some(href => href === URL_Completa)) {
                return;
            }

            // Crear y añadir el elemento Enlace
            const Enlace = document.createElement('link');
            Enlace.rel = 'stylesheet';
            Enlace.href = rutaFinal;
            document.head.appendChild(Enlace);
        }

        // Función para cargar scripts de forma dinámica
        function Cargar_Script(Ruta_Script, Llamada_Retorno) {
            // Verificar si el script ya está cargado
            const Scripts_Existentes = Array.from(document.querySelectorAll('script'))
                .map(Script => Script.src);

            const Script_Completo = new URL(Ruta_Script, window.location.origin).href;

            if (Scripts_Existentes.some(src => src === Script_Completo)) {
                if (Llamada_Retorno) Llamada_Retorno();
                return;
            }

            // Crear y añadir el elemento script
            const Script = document.createElement('script');
            Script.src = Ruta_Script;

            if (Llamada_Retorno) {
                Script.onload = Llamada_Retorno;
            }

            document.body.appendChild(Script);
        }

        // Configurar eventos del modal cargado dinámicamente
        function Configurar_Eventos_Modal() {
            const Modal_Confirmación = document.getElementById('Modal_Login');

            if (!Modal_Confirmación) return;

            // Cerrar al hacer clic afuera
            window.addEventListener('click', (e) => {
                if (e.target === Modal_Confirmación) {
                    Modal_Confirmación.classList.remove('show');
                }
            });

            // Configurar botón de cierre si existe
            const Cerrar_Modal = Modal_Confirmación.querySelector('.Cerrar_Modal');
            if (Cerrar_Modal) {
                Cerrar_Modal.addEventListener('click', () => {
                    Modal_Confirmación.classList.remove('show');
                });
            }

            // Configurar formularios
            const Formulario_Registro = Modal_Confirmación.querySelector('#Formulario_Registro');
            if (Formulario_Registro) {
                Formulario_Registro.addEventListener('submit', function (e) {
                    e.preventDefault();

                    // Lógica de registro...
                    if (typeof Mostrar_Notificación === 'function') {
                        Mostrar_Notificación("Su cuenta ha sido creada correctamente.", "Éxito");
                    }

                    // Cerrar modal
                    Modal_Confirmación.classList.remove('show');
                });
            }

            const Formulario_Inicio_Sesión = Modal_Confirmación.querySelector('#Formulario_Inicio_Sesión');
            if (Formulario_Inicio_Sesión) {
                Formulario_Inicio_Sesión.addEventListener('submit', function (e) {
                    e.preventDefault();

                    // Lógica de login...
                    if (typeof Mostrar_Notificación === 'function') {
                        Mostrar_Notificación("Ha iniciado sesión correctamente.", "Éxito");
                    }

                    // Cerrar modal
                    Modal_Confirmación.classList.remove('show');
                });
            }
        }

        // Configurar botón de vaciar carrito con modal de confirmación
        const Botón_Vaciar_Carrito = document.getElementById('Botón_Vaciar_Carrito');
        if (Botón_Vaciar_Carrito) {
            Botón_Vaciar_Carrito.addEventListener('click', function () {
                if (window.Carrito && window.Carrito.Artículos.length > 0) {
                    Mostrar_Modal_Vaciar_Carrito();
                } else {
                    if (typeof Mostrar_Notificación === 'function') {
                        Mostrar_Notificación('El carrito ya está vacío', 'Información');
                    } else {
                        console.log('El carrito ya está vacío');
                    }
                }
            });
        }

        const btnPagar = document.getElementById('Botón_Proceder_Pago');
        if (btnPagar) {
            // Deshabilitar inicialmente si no hay token
            const token = localStorage.getItem('token');
            btnPagar.disabled = !token;

            btnPagar.addEventListener('click', () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    // Sin token: no hace nada
                    return;
                }
                // Con token: redirige al checkout
                window.location.href = '/html/checkout.html';
            });
        }
    }
});

// Opcional: detectar cambios en el localStorage para actualizar la UI
window.addEventListener('storage', function (e) {
    if (e.key === 'carrito') {
        if (window.Carrito) {
            window.Carrito.Cargar_Elementos();
            // Si existe una función para actualizar la UI, la llama
            if (typeof Cargar_Productos_Carrito === 'function') {
                Cargar_Productos_Carrito();
            }
        }
    }
});