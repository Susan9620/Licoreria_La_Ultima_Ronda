const API_BASE = 'https://licoreria-la-ultima-ronda.onrender.com';

document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Mostrar indicador de carga
        mostrarCargando();

        // Obtener todos los datos necesarios para la página de inicio
        const respuesta = await fetch(`${API_BASE}/api/inicio`);
        if (!respuesta.ok) {
            throw new Error(`Error de servidor: ${respuesta.status}`);
        }

        const Datos = await respuesta.json();

        // Ocultar indicador de carga
        ocultarCargando();

        console.log('Respuesta completa:', Datos);

        if (Datos.Éxito) {
            // Inicializar componentes con los datos recibidos
            Inicializar_Carrusel(Datos.carrusel);

            /*
            // Filtrar la primera aparición de cada producto (ID_Producto)
            const destacadosUnicos = Datos.productosDestacados.filter((prod, i, arr) =>
                arr.findIndex(p => p.ID_Producto === prod.ID_Producto) === i
            );
            Inicializar_Productos_Destacados(destacadosUnicos);
            */

            Inicializar_Video_Destacado();
            console.log('Categorías recibidas:', Datos.Categorías);
            Inicializar_Categorías(Datos.Categorías);

            // Cargar promociones desde el API
            const respPromo = await fetch(`${API_BASE}/api/promociones`);
            const promJson = await respPromo.json();
            console.log('Promociones recibidas:', promJson.Datos);
            if (promJson.Éxito) {
                Inicializar_Promociones(promJson.Datos);
            }
        }
        else {
            console.error('Error en la respuesta del servidor:', Datos.Mensaje);
            Mostrar_Error(Datos.Mensaje || 'Error al cargar los datos.');
        }
    } catch (error) {
        console.error('Error al cargar la página de inicio:', error);
        ocultarCargando();
        Mostrar_Error('No se pudieron cargar los datos. Por favor, intente nuevamente más tarde.');
    }
});

// Función para inicializar el carrusel con datos dinámicos
function Inicializar_Carrusel(Datos_carrusel) {
    if (!Datos_carrusel || Datos_carrusel.length === 0) {
        console.warn('No hay imágenes disponibles para el carrusel');
        return;
    }

    // Contenedor de las imágenes del carrusel
    const contenedor_imagenes = document.querySelector('.Imágenes_Carrusel');

    // Contenedor de los indicadores
    const contenedor_indicadores = document.querySelector('.Indicadores_Carrusel');

    // Limpiar el contenido existente
    contenedor_imagenes.innerHTML = '';
    contenedor_indicadores.innerHTML = '';

    // Crear elementos para cada imagen del carrusel
    Datos_carrusel.forEach((imagen, indice) => {
        // Crear el elemento de imagen del carrusel
        const elemento_imagen = document.createElement('div');
        elemento_imagen.className = `Imágen_Carrusel ${indice === 0 ? 'Activo' : ''}`;
        elemento_imagen.style.backgroundImage = `url('${imagen.URL_Imagen}')`;

        // Crear la sombra
        const elemento_sombra = document.createElement('div');
        elemento_sombra.className = 'Sombra_Carrusel';

        // Crear el contenido
        const elemento_contenido = document.createElement('div');
        elemento_contenido.className = 'Contenido_Carrusel';

        // Crear el título con formato HTML para el span
        const titulo_partes = imagen.Título.split(' ');
        const ultima_palabra = titulo_partes.pop();
        const texto_titulo = titulo_partes.length > 0
            ? `${titulo_partes.join(' ')} <span>${ultima_palabra}</span>`
            : `<span>${ultima_palabra}</span>`;

        elemento_contenido.innerHTML = `
            <h1>${texto_titulo}</h1>
            <p>${imagen.Subtítulo || ''}</p>
            <div class="Botones_Carrusel">
                ${imagen.Enlace_Principal ?
                `<a href="${imagen.Enlace_Principal}" class="Botones Botón_Primario">Ver más</a>` : ''}
            </div>
        `;

        // Añadir los elementos al contenedor de la imagen
        elemento_imagen.appendChild(elemento_sombra);
        elemento_imagen.appendChild(elemento_contenido);
        contenedor_imagenes.appendChild(elemento_imagen);

        // Crear el indicador correspondiente
        const elemento_indicador = document.createElement('span');
        elemento_indicador.className = `Indicador ${indice === 0 ? 'Activo' : ''}`;
        contenedor_indicadores.appendChild(elemento_indicador);
    });

    // Configurar la funcionalidad del carrusel
    Configurar_Carrusel();
}

// Configurar eventos del carrusel
function Configurar_Carrusel() {
    const Imágenes_Carrusel = document.querySelectorAll('.Imágen_Carrusel');
    const Indicadores = document.querySelectorAll('.Indicador');
    const Botón_Anterior = document.querySelector('.Control_Carrusel.Anterior');
    const Botón_Siguiente = document.querySelector('.Control_Carrusel.Siguiente');
    let Índice_Actual = 0;
    let Intervalo;

    // Función para mostrar slide específico
    function Mostrar_Imagen(Índice) {
        // Eliminar clase Activo de todas las imágenes del carrusel e indicadores
        Imágenes_Carrusel.forEach(slide => slide.classList.remove('Activo'));
        Indicadores.forEach(Indicador => Indicador.classList.remove('Activo'));

        // Añadir clase Activo al slide actual y su indicador
        Imágenes_Carrusel[Índice].classList.add('Activo');
        Indicadores[Índice].classList.add('Activo');

        Índice_Actual = Índice;
    }

    // Función para ir al siguiente slide
    function Imagen_Siguiente() {
        let Nuevo_Índice = Índice_Actual + 1;
        if (Nuevo_Índice >= Imágenes_Carrusel.length) {
            Nuevo_Índice = 0;
        }
        Mostrar_Imagen(Nuevo_Índice);
    }

    // Función para ir al slide anterior
    function Imagen_Anterior() {
        let Nuevo_Índice = Índice_Actual - 1;
        if (Nuevo_Índice < 0) {
            Nuevo_Índice = Imágenes_Carrusel.length - 1;
        }
        Mostrar_Imagen(Nuevo_Índice);
    }

    // Configurar botones de control
    Botón_Siguiente.addEventListener('click', function () {
        Limpiar_Intervalo(Intervalo);
        Imagen_Siguiente();
        Iniciar_Carrusel_Automático();
    });

    Botón_Anterior.addEventListener('click', function () {
        Limpiar_Intervalo(Intervalo);
        Imagen_Anterior();
        Iniciar_Carrusel_Automático();
    });

    // Configurar indicadores
    Indicadores.forEach((Indicador, Índice) => {
        Indicador.addEventListener('click', function () {
            Limpiar_Intervalo(Intervalo);
            Mostrar_Imagen(Índice);
            Iniciar_Carrusel_Automático();
        });
    });

    // Iniciar carrusel automático
    function Iniciar_Carrusel_Automático() {
        Intervalo = setInterval(Imagen_Siguiente, 5000);
    }

    // Iniciar el carrusel
    Iniciar_Carrusel_Automático();

    // Limpiar intervalo
    function Limpiar_Intervalo(Intervalo) {
        clearInterval(Intervalo);
    }
}

// Función para mostrar errores
function Mostrar_Error(Mensaje) {
    const contenedor = document.querySelector('.Contenedor_Carrusel');
    if (contenedor) {
        const alerta = document.createElement('div');
        alerta.className = 'Alerta Error';
        alerta.textContent = Mensaje;

        // Insertar la alerta antes del contenedor de imágenes
        contenedor.insertBefore(alerta, contenedor.firstChild);

        // Remover la alerta después de 5 segundos
        setTimeout(() => {
            alerta.remove();
        }, 5000);
    }
}

// Función para mostrar indicador de carga
function mostrarCargando() {
    const seccion = document.querySelector('.Carrusel');
    if (seccion) {
        const cargando = document.createElement('div');
        cargando.className = 'Cargando';
        cargando.innerHTML = '<div class="Spinner"></div><p>Cargando...</p>';
        seccion.appendChild(cargando);
    }
}

// Función para ocultar indicador de carga
function ocultarCargando() {
    const cargando = document.querySelector('.Cargando');
    if (cargando) {
        cargando.remove();
    }
}

// Función para inicializar la sección de productos destacados
function Inicializar_Productos_Destacados(productos) {
    if (!productos || productos.length === 0) {
        console.warn('No hay productos destacados disponibles');
        return;
    }

    // Contenedor de productos destacados
    const contenedor_productos = document.querySelector('.Cuadrícula_Productos');
    if (!contenedor_productos) {
        console.error('No se encontró el contenedor de productos destacados');
        return;
    }

    // Limpiar el contenido existente
    contenedor_productos.innerHTML = '';

    // Crear elementos para cada producto destacado
    productos.forEach(producto => {
        // Crear tarjeta de producto
        const tarjeta_producto = document.createElement('div');
        tarjeta_producto.className = 'Tarjeta_Producto';
        tarjeta_producto.setAttribute('data-category', producto.Categoría);

        // Determinar si tiene precio de oferta
        // 1) Parsear precios a número
        const precio = parseFloat(producto.Precio);
        const precioOferta = producto.Precio_Oferta != null
            ? parseFloat(producto.Precio_Oferta)
            : null;

        // 2) Calcular si tiene oferta
        const tiene_oferta = precioOferta != null && precioOferta < precio;

        // 3) Definir precio a mostrar y precio anterior formateado
        const precio_mostrar = tiene_oferta ? precioOferta : precio;
        const precio_anterior = tiene_oferta
            ? `<span class="Precio_Anterior">$${precio.toFixed(2)}</span> `
            : '';

        // Si tiene etiqueta de oferta y no está especificada, asignarla
        let etiqueta = producto.Etiqueta;
        if (tiene_oferta && !etiqueta) {
            etiqueta = 'Oferta';
        }

        // Generar HTML para la etiqueta
        let etiqueta_html = '';
        if (etiqueta) {
            const clase_etiqueta = etiqueta !== 'Oferta' && etiqueta !== 'Popular' ? 'Etiqueta_Nuevo' :
                (etiqueta === 'Oferta' ? 'Etiqueta_Oferta' : '');
            etiqueta_html = `<span class="Etiqueta ${clase_etiqueta}">${etiqueta}</span>`;
        }

        // Generar HTML para la calificación
        const estrellas_html = Generar_Estrellas(producto.Calificación || 0);

        // Estructura de la tarjeta
        tarjeta_producto.innerHTML = `
            <div class="Imagen_Producto">
                ${etiqueta_html}
                <img src="${producto.Imagen_URL}" alt="${producto.Nombre}">
                <div class="Sombra_Producto">
                    <button class="Botón_Añadir_Al_Carrito" data-id="${producto.ID_Producto}" data-variante="${producto.ID_Variante_Producto}">
                        <i class="fas fa-shopping-cart"></i> Agregar
                    </button>
                </div>
            </div>
            <div class="Información_Producto">
                <h3>${producto.Nombre}</h3>
                <p>${producto.Descripción_Corta || ''}</p>
                <div class="Pie_Producto">
                    <span class="Precio">${precio_anterior}$${precio_mostrar.toFixed(2)}</span>
                    <div class="Calificación_Usuario">
                        ${estrellas_html}
                    </div>
                </div>
            </div>
        `;

        // Añadir la tarjeta al contenedor
        contenedor_productos.appendChild(tarjeta_producto);
    });

    // Configurar eventos para productos destacados
    Configurar_Productos_Destacados();
}

// Función para generar estrellas según calificación
function Generar_Estrellas(Calificación) {
    let HTML_Estrellas = '';
    const Calificación_Redondeada = Math.round(Calificación * 2) / 2; // Redondear a .0 o .5

    for (let i = 1; i <= 5; i++) {
        if (i <= Calificación_Redondeada) {
            HTML_Estrellas += '<i class="fas fa-star"></i>';
        } else if (i - 0.5 === Calificación_Redondeada) {
            HTML_Estrellas += '<i class="fas fa-star-half-alt"></i>';
        } else {
            HTML_Estrellas += '<i class="far fa-star"></i>';
        }
    }

    return HTML_Estrellas;
}

/*
// Configurar eventos para productos destacados
function Configurar_Productos_Destacados() {
    const Tarjetas_Producto = document.querySelectorAll('.Tarjeta_Producto');

    // Añadir efectos interactivos
    Tarjetas_Producto.forEach(Tarjeta => {
        // Efecto de zoom en hover para las imágenes
        Tarjeta.addEventListener('mouseenter', function () {
            const Imagen = this.querySelector('.Imagen_Producto img');
            if (Imagen) {
                Imagen.style.transform = 'scale(1.05)';
                Imagen.style.transition = 'transform 0.3s ease';
            }
        });

        Tarjeta.addEventListener('mouseleave', function () {
            const Imagen = this.querySelector('.Imagen_Producto img');
            if (Imagen) {
                Imagen.style.transform = 'scale(1)';
                Imagen.style.transition = 'transform 0.3s ease';
            }
        });

        // Configurar botones de agregar al carrito
        const Botón_Agregar = Tarjeta.querySelector('.Botón_Añadir_Al_Carrito');
        if (Botón_Agregar) {
            Botón_Agregar.addEventListener('click', function () {
                const ID_Producto = this.getAttribute('data-id');
                const ID_Variante = this.getAttribute('data-variante');

                Agregar_Al_Carrito(ID_Producto, ID_Variante, 1);
            });
        }
    });
}
*/

// Configurar eventos para productos destacados
function Inicializar_Video_Destacado() {
    // Verificar si existe el contenedor de video
    const contenedor_video = document.querySelector('.Contenedor_Video');
    if (!contenedor_video) {
        console.warn('No se encontró el contenedor de video');
        return;
    }

    const video = document.getElementById('videoPrincipal');
    const btnPlay = document.getElementById('btnPlay');
    const btnMute = document.getElementById('btnMute');

    if (!video || !btnPlay || !btnMute) {
        console.error('No se encontraron los elementos del video');
        return;
    }

    // Auto-reproducir cuando está en vista
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                video.play().catch(e => console.log('Error al reproducir:', e));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(video);

    // Control de reproducción/pausa
    btnPlay.addEventListener('click', function() {
        if (video.paused) {
            video.play();
            btnPlay.textContent = '⏸';
        } else {
            video.pause();
            btnPlay.textContent = '▶';
        }
    });

    // Control de sonido
    btnMute.addEventListener('click', function() {
        if (video.muted) {
            video.muted = false;
            btnMute.textContent = '🔊';
        } else {
            video.muted = true;
            btnMute.textContent = '🔇';
        }
    });

    // Actualizar botón cuando el video cambia de estado
    video.addEventListener('play', function() {
        btnPlay.textContent = '⏸';
    });

    video.addEventListener('pause', function() {
        btnPlay.textContent = '▶';
    });

    // Reiniciar cuando termine
    video.addEventListener('ended', function() {
        btnPlay.textContent = '▶';
    });

    console.log('Video inicializado correctamente');
}

// Función para inicializar la sección de categorías
function Inicializar_Categorías(Datos_Categorías) {
    const Contenedor_Categorías = document.querySelector('.Categorías .Contenedor_Categorías');
    const Template_Categoría = document.querySelector('#Plantilla_Categoría');

    // Limpiar contenedor
    Contenedor_Categorías.innerHTML = '';

    // Añadir cada categoría
    Datos_Categorías.forEach(c => {
        const Clon = Template_Categoría.content.cloneNode(true);
        const Tarjeta = Clon.querySelector('.Tarjeta_Categoría');
        const Icono = Clon.querySelector('.Ícono_Categoría i');
        const Nombre = Clon.querySelector('.Nombre_Categoría');
        const Desc = Clon.querySelector('.Descripción_Categoría');
        const Boton = Clon.querySelector('.Botón_Categoría');

        // Rellenar campos
        Icono.className = c.Ícono;
        Nombre.textContent = c.Nombre;
        Desc.textContent = c.Descripción;
        Boton.href = `/html/productos.html?Filtro=${encodeURIComponent(c.Nombre)}`;

        Contenedor_Categorías.appendChild(Clon);
    });

    // (Opcional) Configura eventos si tuvieras algún listener adicional
}

// Función para inicializar la sección de promociones
function Inicializar_Promociones(Datos_Promociones) {
    const Contenedor = document.querySelector('.Contenedor_Promociones');
    const Template = document.querySelector('#Plantilla_Promociones');

    // Limpiar
    Contenedor.innerHTML = '';

    Datos_Promociones.forEach(p => {
        const Clon = Template.content.cloneNode(true);
        Clon.querySelector('.Título_Promoción').textContent = p.titulo;
        Clon.querySelector('.Descripción_Promoción').textContent = p.descripcion;
        // puedes usar p.tipo/parametros para personalizar el botón o enlace
        Contenedor.appendChild(Clon);
    });

    // Configura el modal o eventos de “Ver Detalles”
    Configurar_Promociones();
}

// Configurar eventos para promociones
function Configurar_Promociones() {
    // Seleccionar todos los botones "Ver Detalles"
    const Botones_Ver_Más = document.querySelectorAll('.Botón_Ver_Más:not(.Botón_Link_Productos)');

    // Buscar o crear modal
    let Modal_Promoción = document.getElementById("Modal_Promoción");

    // Si no existe el modal, crearlo
    if (!Modal_Promoción) {
        Modal_Promoción = document.createElement('div');
        Modal_Promoción.id = "Modal_Promoción";
        Modal_Promoción.classList.add('Modal');

        Modal_Promoción.innerHTML = `
        <div class="Contenido_Modal">
            <span class="Cerrar_Modal">&times;</span>
            <h2 id="Título_Modal"></h2>
            <p id="Descripción_Modal"></p>
        </div>
    `;

        document.body.appendChild(Modal_Promoción);
    }

    const Cerrar_Modal = Modal_Promoción.querySelector(".Cerrar_Modal");

    // Función para abrir el modal con la información de la promoción
    function Abrir_Modal_Promoción(e) {
        e.preventDefault();
        // Obtenemos el contenedor de la promoción
        const Contenido_Promoción = e.target.closest(".Contenido_Promociones");
        const Título = Contenido_Promoción.querySelector("h3").textContent;
        const Descripción = Contenido_Promoción.querySelector("p").textContent;

        // Actualizamos el contenido del modal
        document.getElementById("Título_Modal").textContent = Título;
        document.getElementById("Descripción_Modal").textContent = Descripción;

        // Mostramos el modal añadiendo la clase "Activo"
        Modal_Promoción.classList.add("Activo");
    }

    // Función para cerrar el modal
    function Cerrar_Modal_Promoción() {
        Modal_Promoción.classList.remove("Activo");
    }

    // Asignamos el evento a cada botón "Ver Detalles"
    Botones_Ver_Más.forEach(Botón => {
        Botón.addEventListener("click", Abrir_Modal_Promoción);
    });

    // Cerrar el modal al hacer clic en el botón de cerrar
    Cerrar_Modal.addEventListener("click", Cerrar_Modal_Promoción);

    // Cerrar el modal si se hace clic fuera del contenido
    Modal_Promoción.addEventListener("click", function (e) {
        if (e.target === Modal_Promoción) {
            Cerrar_Modal_Promoción();
        }
    });
}

// Función para agregar productos al carrito
function Agregar_Al_Carrito(ID_Producto, ID_Variante, Cantidad) {
    // Verificar si ya existe un carrito en localStorage
    let Carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Verificar si el producto ya está en el carrito
    const Índice_Producto = Carrito.findIndex(item =>
        item.ID_Producto == ID_Producto && item.ID_Variante == ID_Variante
    );

    if (Índice_Producto !== -1) {
        // Si ya existe, aumentar la cantidad
        Carrito[Índice_Producto].Cantidad += Cantidad;
    } else {
        // Si no existe, añadir nuevo item
        Carrito.push({
            ID_Producto: ID_Producto,
            ID_Variante: ID_Variante,
            Cantidad: Cantidad
        });
    }

    // Guardar carrito actualizado
    localStorage.setItem('carrito', JSON.stringify(Carrito));

    // Actualizar contador del carrito en la interfaz
    Actualizar_Contador_Carrito();

    // Mostrar mensaje de confirmación
    Mostrar_Mensaje('Producto agregado al carrito', 'Éxito');
}

// Función para actualizar el contador de productos en el carrito
function Actualizar_Contador_Carrito() {
    const Carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const Total_Items = Carrito.reduce((total, item) => total + item.Cantidad, 0);

    // Actualizar el contador en el ícono del carrito en el encabezado
    const Contador_Carrito = document.querySelector('.Contador_Carrito');
    if (Contador_Carrito) {
        Contador_Carrito.textContent = Total_Items;
        Contador_Carrito.style.display = Total_Items > 0 ? 'flex' : 'none';
    }
}

// Función para mostrar mensajes al usuario
function Mostrar_Mensaje(Mensaje, Tipo = 'info') {
    const Contenedor_Mensaje = document.createElement('div');
    Contenedor_Mensaje.classList.add('Mensaje', `Mensaje_${Tipo}`);
    Contenedor_Mensaje.textContent = Mensaje;

    document.body.appendChild(Contenedor_Mensaje);

    // Mostrar el mensaje
    setTimeout(() => {
        Contenedor_Mensaje.classList.add('Visible');
    }, 10);

    // Ocultar mensaje después de 3 segundos
    setTimeout(() => {
        Contenedor_Mensaje.classList.remove('Visible');

        // Eliminar del DOM después de la animación
        setTimeout(() => {
            Contenedor_Mensaje.remove();
        }, 300);
    }, 3000);
}

// Inicializar contador del carrito al cargar la página
Actualizar_Contador_Carrito();

document.getElementById('Formulario_Contacto').addEventListener('submit', async function(e) {
  e.preventDefault();
  const txt = document.getElementById('Mensaje').value.trim();
  if (!txt) {
    Mostrar_Notificación('Por favor escriba un mensaje', 'Error');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const resp = await fetch(`${API_BASE}/api/contacto`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ Mensaje: txt })
    });
    const json = await resp.json();

    if (resp.ok && json.Éxito) {
      Mostrar_Notificación('¡Gracias! Su mensaje ha sido enviado.', 'Éxito');
      this.reset();
    } else {
      throw new Error(json.Mensaje || resp.statusText);
    }
  } catch (err) {
    console.error('Error enviando mensaje de contacto:', err);
    Mostrar_Notificación('No se pudo enviar su mensaje. Intente de nuevo.', 'Error');
  }
});