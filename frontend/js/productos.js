const API_BASE = 'https://licoreria-la-ultima-ronda.onrender.com';

/**
 * Devuelve HTML con estrellas llenas, medias o vacías según la calificación (0–5).
 */
function Generar_Estrellas(calificacion) {
    const valor = Math.round(parseFloat(calificacion) * 2) / 2; // a .0 o .5
    let html = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= valor) {
            html += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === valor) {
            html += '<i class="fas fa-star-half-alt"></i>';
        } else {
            html += '<i class="far fa-star"></i>';
        }
    }
    return html;
}

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos del DOM
    const Campo_Búsqueda = document.getElementById('Búsqueda_Campo');
    const Botones_Filtro = document.querySelectorAll('.Botón_Filtro');
    const Ordenar_Selección = document.getElementById('Ordenar_Selección');
    const Contenedor = document.querySelector('.Cuadrícula_Productos');
    const Template = document.querySelector('#Plantilla_Producto');
    const Modal_Vista_Rápida = document.getElementById('Modal_Vista_Rápida');
    const Botón_Cerrar_Modal = document.querySelector('.Cerrar_Modal');
    const Botón_Lista_Deseos = document.querySelector('.Botón_Lista_Deseos');
    const Lista_Deseos = document.querySelector('.Lista_Deseos');
    const Botón_Cerrar_Lista_Deseos = document.querySelector('.Cerrar_Lista_Deseos');
    const Elementos_Lista_Deseos = document.querySelector('.Elementos_Lista_Deseos');
    const Contador_Lista_Deseos = document.querySelector('.Contador_Lista_Deseos');
    const Contenedor_Paginación = document.querySelector('.Contenedor_Paginación');
    const Historial_Carrusel = document.querySelector('.Carrusel_Historial');
    const Botón_Anterior = document.querySelector('.Botón_Anterior');
    const Botón_Siguiente = document.querySelector('.Botón_Siguiente');
    const Control_Cantidad = document.querySelector('.Control_Cantidad');
    const Productos_Por_Pagina = 20;

    // Estado de la aplicación
    let Productos = [];
    let Productos_Filtrados = []; // Ahora mantenemos un array de productos filtrados
    let Filtro_Actual = 'Todos';
    let Orden_Actual = 'Destacados';
    let Pagina_Actual = 1;

    // — Carga dinámica de productos —
    (async function Cargar_Productos() {
        try {
            const resp = await fetch(`${API_BASE}/api/productos/all`);
            const json = await resp.json();
            if (!json.Éxito) throw new Error(json.Mensaje || 'Error al cargar productos');

            // Vacía el contenedor
            Contenedor.innerHTML = '';

            const fragment = document.createDocumentFragment();

            json.Datos.forEach(p => {
                const clon = Template.content.cloneNode(true);
                const tarjeta = clon.querySelector('.Tarjeta_Producto');

                // 1) data-attributes
                tarjeta.dataset.category = p.Categoría;
                tarjeta.dataset.id = p.ID_Producto;
                tarjeta.dataset.calificacionMedia = p.CalificaciónMedia;
                tarjeta.dataset.numReseñas = p.NumReseñas;
                tarjeta.dataset.volumen = p.Nombre_Variante || '';
                tarjeta.dataset.graduacion = p.Graduacion || '';
                tarjeta.dataset.stock = p.Stock;

                // 2) etiqueta
                const etiquetaEl = clon.querySelector('.Etiqueta');
                if (p.Etiqueta) {
                    etiquetaEl.textContent = p.Etiqueta;
                    etiquetaEl.classList.add(
                        p.Etiqueta === 'Oferta' ? 'Etiqueta_Oferta' :
                            p.Etiqueta === 'Nuevo' ? 'Etiqueta_Nuevo' :
                                p.Etiqueta === 'Popular' ? 'Etiqueta_Popular' : ''
                    );
                } else {
                    etiquetaEl.remove();
                }

                // 3) datos básicos
                const imgEl = clon.querySelector('img');
                imgEl.src = p.Imagen_URL;
                imgEl.alt = p.Nombre;
                clon.querySelector('h3').textContent = p.Nombre;
                clon.querySelector('.Descripción').textContent = p.Descripción_Corta;
                clon.querySelector('.Precio').innerHTML =
                    p.Precio_Oferta
                        ? `<span class="Precio_Anterior">$${parseFloat(p.Precio).toFixed(2)}</span> $${parseFloat(p.Precio_Oferta).toFixed(2)}`
                        : `$${parseFloat(p.Precio).toFixed(2)}`;

                // 4) estrellas + número de reseñas
                const contCalif = clon.querySelector('.Clasificación');
                contCalif.innerHTML = Generar_Estrellas(parseFloat(p.CalificaciónMedia) || 0);

                // 5.1) Aplicar estado "Activo" si ya está en la lista de deseos
                const btnFav = clon.querySelector('.Botón_Favorito');
                if (window.Lista_Deseos && window.Lista_Deseos.Artículos.some(item => item.ID == p.ID_Producto)) {
                    btnFav.classList.add('Activo');
                }

                fragment.appendChild(clon);
            });

            Contenedor.appendChild(fragment);

            // Actualizamos el array de Productos ya inyectados
            Productos = Array.from(document.querySelectorAll('.Tarjeta_Producto'));
            Filtrar_Productos();
            Mostrar_Pagina_Actual();
            Actualizar_Paginación();

            if (window.Carrito?.Inicializar_Botones) {
                window.Carrito.Inicializar_Botones();
            }

            // Configurar enlaces a detalle y localStorage para cada tarjeta
            Productos.forEach(tarjeta => {
                const ID = tarjeta.dataset.id;
                tarjeta.querySelectorAll('.Enlace_Detalle').forEach(link => {
                    link.href = `/html/detalle.html?id=${encodeURIComponent(ID)}`;
                    link.addEventListener('click', () => {
                        const nombre = tarjeta.querySelector('h3').textContent.trim();
                        const precioTexto = tarjeta.querySelector('.Precio').textContent.trim();
                        const precio = parseFloat(precioTexto.replace(/[^0-9.,-]+/g, '').replace(',', '.')) || 0;
                        const descripcion = tarjeta.querySelector('.Descripción').textContent.trim();
                        const imagen = tarjeta.querySelector('img').src;
                        localStorage.setItem('Producto_Detalle', JSON.stringify({
                            ID: ID,
                            Nombre: nombre,
                            Precio: precio,
                            Descripción: descripcion,
                            Imágenes: [imagen]
                        }));
                    });
                });
            });

            // 1) Capturamos los botones sobre los productos recién inyectados
            const Botones_Vista_Rápida = document.querySelectorAll('.Botón_Vista_Rápida');

            // 2) Volvemos a ejecutar la configuración de eventos
            Botones_Vista_Rápida.forEach(btn => {
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    const tarjeta = this.closest('.Tarjeta_Producto');
                    Abrir_Modal(tarjeta);
                });
            });

            // 3) Al cargar se apliquen filtros/orden inmediatamente:
            Filtrar_Productos();

            // 4) Reconfigurar los botones de carrito para las tarjetas recién inyectadas
            if (window.Carrito && typeof window.Carrito.Inicializar_Botones === 'function') {
                window.Carrito.Inicializar_Botones();
            }
        } catch (e) {
            console.error(e);
        }
    })();

    // Función para filtrar productos
    function Filtrar_Productos() {
        // Primero filtramos por categoría y búsqueda
        Productos_Filtrados = Array.from(Productos).filter(Producto => {
            const Categoría_Producto = Producto.dataset.category;
            const Nombre_Producto = Producto.querySelector('h3').textContent.toLowerCase();
            const Texto_Búsqueda = Campo_Búsqueda.value.toLowerCase();

            // Filtro por categoría
            if (Filtro_Actual !== 'Todos' && Categoría_Producto !== Filtro_Actual) {
                return false;
            }

            // Filtro por búsqueda
            if (Texto_Búsqueda && !Nombre_Producto.includes(Texto_Búsqueda)) {
                return false;
            }

            return true;
        });

        // Luego ordenamos los productos filtrados
        Ordenar_Productos();

        // Reseteamos a la página 1 y actualizamos la visualización
        Pagina_Actual = 1;
        Actualizar_Paginación();
        Mostrar_Pagina_Actual();
    }

    // Función para ordenar productos
    function Ordenar_Productos() {
        Productos_Filtrados.sort((a, b) => {
            const precioA = parseFloat(a.querySelector('.Precio').textContent.replace(/[^0-9.,]/g, '').replace(',', '.'));
            const precioB = parseFloat(b.querySelector('.Precio').textContent.replace(/[^0-9.,]/g, '').replace(',', '.'));
            const nombreA = a.querySelector('h3').textContent.toLowerCase();
            const nombreB = b.querySelector('h3').textContent.toLowerCase();

            switch (Orden_Actual) {
                case 'Precio-bajo':
                    return precioA - precioB;
                case 'Precio-alto':
                    return precioB - precioA;
                case 'Nombre-az':
                    return nombreA.localeCompare(nombreB);
                case 'Nombre-za':
                    return nombreB.localeCompare(nombreA);
                default:
                    return 0;
            }
        });
    }

    // ——— Aplicar filtro desde URL y forzar filtrado ———
    const Parámetros = new URLSearchParams(window.location.search);
    // primero busco la versión lowercase, si no existe pruebo uppercase
    const filtroDesdeURL = Parámetros.get('filtro') ?? Parámetros.get('Filtro');
    if (filtroDesdeURL) {
        Filtro_Actual = filtroDesdeURL;

        // marco botón como activo
        Botones_Filtro.forEach(b => {
            b.classList.toggle('Activo', b.dataset.filter === filtroDesdeURL);
        });

        // forzamos el filtrado y refrescamos paginación/UI
        Filtrar_Productos();
        Mostrar_Pagina_Actual();
        Actualizar_Paginación();
    }

    // Función para Abrir el Modal 
    window.Abrir_Modal = function (Producto) {
        // 1) Leer datos del dataset
        const ID = Producto.dataset.id;
        const calif = parseFloat(Producto.dataset.calificacionMedia) || 0;
        const volumen = Producto.dataset.volumen || '—';
        const grad = Producto.dataset.graduacion || '—';

        // 2) Imagen, título, descripción y precio
        const Imagen_Producto = Producto.querySelector('.Imagen_Producto img').src;
        const Nombre_Producto = Producto.querySelector('h3').textContent.trim();
        const Descripción_Producto = Producto.querySelector('p').textContent.trim();
        const Precio_Producto = Producto.querySelector('.Precio').textContent.trim();

        // 3) Generar estrellas y texto de calificaciones
        const estrellasHTML = Generar_Estrellas(calif);
        const numReseñas = parseInt(Producto.dataset.numReseñas, 10) || 0;

        // --- Actualizar el modal ---
        Modal_Vista_Rápida.querySelector('.Imagen_Modal img').src = Imagen_Producto;
        Modal_Vista_Rápida.querySelector('.Título_Producto_Modal').textContent = Nombre_Producto;
        Modal_Vista_Rápida.querySelector('.Descripción_Modal').textContent = Descripción_Producto;
        Modal_Vista_Rápida.querySelector('.Precio_Modal').textContent = Precio_Producto;
        const contClasif = Modal_Vista_Rápida.querySelector('.Clasificación_Modal');
        contClasif.innerHTML = estrellasHTML + ` <span>(${numReseñas} reseñas)</span>`;
        const caracteristicas = Modal_Vista_Rápida.querySelector('.Características_Producto');
        caracteristicas.innerHTML = `
            <div class="Característica">
                <span class="Etiqueta_Característica">Volumen:</span>
                <span class="Valor_Característica">${volumen}</span>
            </div>
            <div class="Característica">
                <span class="Etiqueta_Característica">Graduación:</span>
                <span class="Valor_Característica">${grad}%</span>
            </div>
            `;

        // 4) Ajustar control de cantidad según stock
        const inputCantidad = Modal_Vista_Rápida.querySelector('#Cantidad');
        inputCantidad.value = 1;
        const stock = parseInt(Producto.dataset.stock, 10) || 1;
        inputCantidad.min = 1;
        inputCantidad.max = stock;
        if (inputCantidad.value > stock) inputCantidad.value = stock;

        // Conectar botones + / –
        Modal_Vista_Rápida.querySelector('.Disminuir_Cantidad').onclick = () => {
            let v = parseInt(inputCantidad.value, 10) - 1;
            inputCantidad.value = v < 1 ? 1 : v;
        };
        Modal_Vista_Rápida.querySelector('.Aumentar_Cantidad').onclick = () => {
            let v = parseInt(inputCantidad.value, 10) + 1;
            inputCantidad.value = v > stock ? stock : v;
        };

        // Mostrar modal
        Modal_Vista_Rápida.classList.add('Activo');
        document.body.style.overflow = 'hidden';

        // 5) Listener para añadir desde el modal (con variante)
        let btnAddModal = Modal_Vista_Rápida.querySelector('.Botón_Añadir');
        // eliminamos cualquier listener previo clonando el nodo
        const nuevoBtn = btnAddModal.cloneNode(true);
        btnAddModal.parentNode.replaceChild(nuevoBtn, btnAddModal);
        btnAddModal = nuevoBtn;

        btnAddModal.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            // 5.1) Validar sesión
            if (!tuJwt) {
                const modalLogin = document.getElementById('Modal_Login');
                if (modalLogin) modalLogin.classList.add('show');
                return;
            }

            // 5.2) Cantidad
            const cantidad = parseInt(inputCantidad.value, 10) || 1;

            // 5.3) Nombre completo: Producto – Variante
            // 'volumen' viene definido al principio de Abrir_Modal:
            // const volumen = Producto.dataset.volumen || '—';
            const nombreCompleto = volumen && volumen !== '—'
                ? `${Nombre_Producto} – ${volumen}`
                : Nombre_Producto;

            // 5.4) Llamada al carrito
            Carrito.Agregar_Elemento(
                nombreCompleto,
                Precio_Producto,
                Imagen_Producto,
                cantidad
            );

            // 5.5) Cerrar el modal
            if (typeof Cerrar_Modal === 'function') Cerrar_Modal();
        });

        // 5.6) Listener para 'Comprar Ahora' desde el modal
        let btnComprarModal = Modal_Vista_Rápida.querySelector('.Botón_Comprar');
        // eliminamos cualquier listener previo clonando el nodo
        const nuevoBtnComprar = btnComprarModal.cloneNode(true);
        btnComprarModal.parentNode.replaceChild(nuevoBtnComprar, btnComprarModal);
        btnComprarModal = nuevoBtnComprar;

        btnComprarModal.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            // 5.6.1) Validar sesión
            if (!tuJwt) {
                const modalLogin = document.getElementById('Modal_Login');
                if (modalLogin) modalLogin.classList.add('show');
                return;
            }

            // 5.6.2) Cantidad
            const cantidad = parseInt(inputCantidad.value, 10) || 1;

            // 5.6.3) Nombre completo (producto + variante)
            const nombreCompleto = volumen && volumen !== '—'
                ? `${Nombre_Producto} – ${volumen}`
                : Nombre_Producto;

            // 5.6.4) Agregar al carrito
            Carrito.Agregar_Elemento(
                nombreCompleto,
                Precio_Producto,
                Imagen_Producto,
                cantidad
            );

            // 5.6.5) Redirigir al checkout
            // Si tu checkout está en el mismo folder HTML, basta con:
            window.location.href = 'checkout.html';
            // Si en tu servidor la ruta es distinta:
            // window.location.href = '/html/checkout.html';
        });

        // 6) Añadir al historial **con ID**
        if (window.Historial) {
            window.Historial.Añadir_Producto(Nombre_Producto, Imagen_Producto, Precio_Producto, ID);
        }
    };

    // Función para cerrar modal - también exportada globalmente
    window.Cerrar_Modal = function () {
        Modal_Vista_Rápida.classList.remove('Activo');
        document.body.style.overflow = '';
    };

    // Función para alternar lista de deseos - también exportada globalmente
    window.Alternar_Lista_Deseos = function () {
        const panel = document.querySelector('.Lista_Deseos');
        if (panel) {
            panel.classList.toggle('Activo');
        }
    };

    if (window.Lista_Deseos) {
        window.Lista_Deseos.Actualizar_UI();
    }

    // Función para mostrar la página actual basada en productos filtrados y ordenados
    function Mostrar_Pagina_Actual() {
        // Oculta todos los productos primero
        Productos.forEach(p => p.style.display = 'none');

        // Calcula el rango de productos a mostrar
        const inicio = (Pagina_Actual - 1) * Productos_Por_Pagina;
        const fin = Math.min(inicio + Productos_Por_Pagina, Productos_Filtrados.length);

        // Muestra solo los productos de la página actual
        const productos_a_mostrar = Productos_Filtrados.slice(inicio, fin);

        // Limpia el contenedor
        while (Contenedor.firstChild) {
            Contenedor.removeChild(Contenedor.firstChild);
        }

        // Añade los productos ordenados al contenedor
        productos_a_mostrar.forEach(producto => {
            Contenedor.appendChild(producto);
            producto.style.display = 'block';
        });

        // 4) Reconfigura los botones de carrito y favoritos
        if (window.Carrito && typeof window.Carrito.Inicializar_Botones === 'function') {
            window.Carrito.Inicializar_Botones();
        }

        // Re-bind Quick-View buttons tras cambiar de página
        document.querySelectorAll('.Botón_Vista_Rápida').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                const tarjeta = this.closest('.Tarjeta_Producto');
                Abrir_Modal(tarjeta);
            });
        });
    }

    // Función para crear los botones de paginación de forma dinámica
    function Crear_Botones_Paginación() {
        // Limpiar botones existentes
        Contenedor_Paginación.innerHTML = '';

        const total_paginas = Math.ceil(Productos_Filtrados.length / Productos_Por_Pagina);

        // Si no hay páginas o solo hay 1, no mostrar paginación
        if (total_paginas <= 1) {
            return;
        }

        // Siempre agregamos el botón de anterior
        const boton_anterior = document.createElement('button');
        boton_anterior.className = 'Botón_Paginación';
        boton_anterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
        boton_anterior.addEventListener('click', () => Cambiar_Página(Pagina_Actual - 1));
        Contenedor_Paginación.appendChild(boton_anterior);

        // Lógica para mostrar botones numéricos de forma inteligente
        const mostrar_boton = (numero) => {
            const boton = document.createElement('button');
            boton.className = 'Botón_Paginación';
            if (numero === Pagina_Actual) {
                boton.classList.add('Activo');
            }
            boton.textContent = numero;
            boton.addEventListener('click', () => Cambiar_Página(numero));
            Contenedor_Paginación.appendChild(boton);
        };

        // Mostrar puntos suspensivos
        const mostrar_puntos = () => {
            const span = document.createElement('span');
            span.className = 'Puntos_Suspensivos';
            span.textContent = '...';
            Contenedor_Paginación.appendChild(span);
        };

        // Siempre mostrar la primera página
        mostrar_boton(1);

        // Lógica para páginas intermedias
        if (total_paginas <= 7) {
            // Si hay 7 o menos páginas, mostrar todas
            for (let i = 2; i < total_paginas; i++) {
                mostrar_boton(i);
            }
        } else {
            // Si hay más de 7 páginas, mostrar de forma inteligente
            if (Pagina_Actual <= 3) {
                // Cerca del inicio
                mostrar_boton(2);
                mostrar_boton(3);
                mostrar_boton(4);
                mostrar_puntos();
            } else if (Pagina_Actual >= total_paginas - 2) {
                // Cerca del final
                mostrar_puntos();
                mostrar_boton(total_paginas - 3);
                mostrar_boton(total_paginas - 2);
                mostrar_boton(total_paginas - 1);
            } else {
                // En medio
                mostrar_puntos();
                mostrar_boton(Pagina_Actual - 1);
                mostrar_boton(Pagina_Actual);
                mostrar_boton(Pagina_Actual + 1);
                mostrar_puntos();
            }
        }

        // Siempre mostrar la última página si hay más de 1
        if (total_paginas > 1) {
            mostrar_boton(total_paginas);
        }

        // Siempre agregamos el botón de siguiente
        const boton_siguiente = document.createElement('button');
        boton_siguiente.className = 'Botón_Paginación';
        boton_siguiente.innerHTML = '<i class="fas fa-chevron-right"></i>';
        boton_siguiente.addEventListener('click', () => Cambiar_Página(Pagina_Actual + 1));
        Contenedor_Paginación.appendChild(boton_siguiente);
    }

    // Función para actualizar los botones de paginación
    function Actualizar_Paginación() {
        Crear_Botones_Paginación();
    }

    // Función para cambiar de página
    function Cambiar_Página(nroPagina) {
        const total_paginas = Math.ceil(Productos_Filtrados.length / Productos_Por_Pagina);

        // Validar que la página esté en rango
        if (nroPagina < 1) nroPagina = 1;
        if (nroPagina > total_paginas) nroPagina = total_paginas;

        Pagina_Actual = nroPagina;
        Actualizar_Paginación();
        Mostrar_Pagina_Actual();
    }

    // Función para manejar la cantidad en el modal
    function Cambiar_Cantidad(acción) {
        const Campo_Cantidad = document.getElementById('Cantidad');
        let Valor = parseInt(Campo_Cantidad.value);

        if (acción === 'Aumentar') {
            Valor = Math.min(Valor + 1, parseInt(Campo_Cantidad.max) || 10);
        } else if (acción === 'Disminuir') {
            Valor = Math.max(Valor - 1, parseInt(Campo_Cantidad.min) || 1);
        }

        Campo_Cantidad.value = Valor;
    }

    // Event Listeners

    // Filtros y búsqueda
    Campo_Búsqueda.addEventListener('input', Filtrar_Productos);

    Botones_Filtro.forEach(Botón => {
        Botón.addEventListener('click', function () {
            Botones_Filtro.forEach(b => b.classList.remove('Activo'));
            this.classList.add('Activo');
            Filtro_Actual = this.dataset.filter;
            Filtrar_Productos();
        });
    });

    Ordenar_Selección.addEventListener('change', function () {
        Orden_Actual = this.value;
        Ordenar_Productos();
        Mostrar_Pagina_Actual();
    });

    // Cerrar modal
    Botón_Cerrar_Modal.addEventListener('click', Cerrar_Modal);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function (e) {
        if (e.target === Modal_Vista_Rápida) {
            Cerrar_Modal();
        }
    });

    // Escape para cerrar modal
    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && Modal_Vista_Rápida.classList.contains('Activo')) {
            Cerrar_Modal();
        }
    });

    // Engancha los botones para abrir/cerrar el sidebar
    document.querySelector('.Botón_Lista_Deseos')
        .addEventListener('click', () => {
            document.querySelector('.Lista_Deseos').classList.toggle('Activo');
        });
    document.querySelector('.Cerrar_Lista_Deseos')
        .addEventListener('click', () => {
            document.querySelector('.Lista_Deseos').classList.remove('Activo');
        });

    // ─── Configurar paginación ─────────────────────────────
    const botonesPag = Array.from(document.querySelectorAll('.Paginación .Botón_Paginación'));
    const btnPrev = botonesPag[0];
    const btnNext = botonesPag[botonesPag.length - 1];
    const botonesNum = botonesPag.slice(1, -1);

    // Flecha izquierda: página anterior
    btnPrev.addEventListener('click', () => {
        if (Pagina_Actual > 1) {
            Cambiar_Página(Pagina_Actual - 1);
        }
    });

    // Flecha derecha: página siguiente
    btnNext.addEventListener('click', () => {
        const maxPag = Math.ceil(Productos_Filtrados.length / Productos_Por_Pagina);
        if (Pagina_Actual < maxPag) {
            Cambiar_Página(Pagina_Actual + 1);
        }
    });

    // Botones numéricos
    botonesNum.forEach(btn => {
        btn.addEventListener('click', () => {
            const num = parseInt(btn.textContent, 10);
            if (!isNaN(num)) {
                Cambiar_Página(num);
            }
        });
    });

    window.Abrir_Modal = Abrir_Modal;
});

