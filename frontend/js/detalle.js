const API_BASE = '';

// Variables globales para el producto
let productoActual = null
let variantesProducto = []
let imagenesProducto = []

async function cargarDatosDeProductos(ids) {
  const resultados = []
  for (let ID of ids) {
    try {
      const resp = await fetch(`${API_BASE}/api/Productos/${ID}`)
      if (!resp.ok) continue
      const json = await resp.json()
      if (json.Éxito && json.Datos) {
        resultados.push(json.Datos)
      }
    } catch (e) {
      console.warn(`No se pudo cargar producto ${ID}:`, e)
    }
  }
  return resultados
}

// Obtener ID del producto desde la URL
function obtenerIdProductoDesdeURL() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get("id")
}

// Cargar datos del producto desde la API
async function cargarDatosProducto() {
  const ID_Producto = obtenerIdProductoDesdeURL()

  if (!ID_Producto) {
    console.error("No se encontró ID de producto en la URL")
    window.location.href = "../html/productos.html"
    return
  }

  try {
    // Mostrar indicador de carga
    mostrarIndicadorCarga(true)

    // Obtener datos del producto
    const respuestaProducto = await fetch(`${API_BASE}/api/Productos/${ID_Producto}`)
    if (!respuestaProducto.ok) {
      throw new Error("Producto no encontrado")
    }
    const DatosProducto = await respuestaProducto.json()

    // Verificar la estructura de la respuesta
    if (DatosProducto.Éxito && DatosProducto.Datos) {
      productoActual = DatosProducto.Datos
    } else if (DatosProducto.Datos) {
      productoActual = DatosProducto.Datos
    } else {
      throw new Error("Estructura de datos incorrecta")
    }

    console.log("Producto cargado:", productoActual)

    // Cargar variantes y imágenes en paralelo
    await Promise.allSettled([
      cargarVariantesProducto(ID_Producto),
      cargarImagenesProducto(ID_Producto)
    ])

    // Renderizar el producto
    renderizarProducto()

    // Cargar productos relacionados
    cargarProductosRelacionados();

  } catch (error) {
    console.error("Error al cargar el producto:", error)
    mostrarError("Error al cargar el producto. Por favor, intente nuevamente.")
  } finally {
    mostrarIndicadorCarga(false)
  }
}

// Cargar variantes del producto
async function cargarVariantesProducto(ID_Producto) {
  try {
    const respuestaVariantes = await fetch(`${API_BASE}/api/Variantes/Producto/${ID_Producto}`)
    if (respuestaVariantes.ok) {
      const DatosVariantes = await respuestaVariantes.json()
      if (DatosVariantes.Éxito && DatosVariantes.Datos) {
        variantesProducto = DatosVariantes.Datos
      } else {
        variantesProducto = []
      }
      console.log("Variantes cargadas:", variantesProducto)
    }
  } catch (error) {
    console.warn("No se pudieron cargar las variantes:", error)
    variantesProducto = []
  }
}

// Cargar imágenes del producto
async function cargarImagenesProducto(ID_Producto) {
  try {
    const respuestaImagenes = await fetch(`${API_BASE}/api/Imágenes/Producto/${ID_Producto}`)
    if (respuestaImagenes.ok) {
      const DatosImagenes = await respuestaImagenes.json()
      if (DatosImagenes.Éxito && DatosImagenes.Datos) {
        imagenesProducto = DatosImagenes.Datos
      } else {
        imagenesProducto = []
      }
      console.log("Imágenes cargadas:", imagenesProducto)
    }
  } catch (error) {
    console.warn("No se pudieron cargar las imágenes:", error)
    imagenesProducto = []
  }
}

// Renderizar los datos del producto en la página
function renderizarProducto() {
  console.log("🔥 renderizarProducto ejecutado — productoActual:", productoActual);
  if (!productoActual) return

  console.log("Renderizando producto:", productoActual)

  // Actualizar título de la página
  document.title = `${productoActual.Nombre} | Licores Artesanales`

  // Actualizar migas de pan
  actualizarMigasPan()

  // Actualizar información básica
  const Nombre_Producto = document.querySelector(".Nombre_Producto")
  if (Nombre_Producto) Nombre_Producto.textContent = productoActual.Nombre

  const Descripción = document.querySelector(".Descripción_Breve")
  if (Descripción) {
    Descripción.textContent =
      productoActual.Descripción ||
      productoActual.Descripción_Corta ||
      "Sin descripción disponible"
  }

  // ── Sincroniza el botón flotante y el panel de deseos con el producto actual ──
  const btnFloat = document.querySelector('.Botón_Lista');
  if (btnFloat && window.Lista_Deseos) {
    // 1) Le damos el ID del producto 
    btnFloat.dataset.Producto_ID = productoActual.ID_Producto;

    // 2) Actualizamos visual (contador y corazones activos) 
    Lista_Deseos.Actualizar_Contador();
    Lista_Deseos.Actualizar_UI();

    // 3) Aseguramos que los handlers de clics estén enganchados 
    Lista_Deseos.Configurar_Delegación_Eventos();
  }

  const btnLista = document.querySelector('.Botón_Lista');
  if (btnLista && window.Lista_Deseos) {
    // 1) asignamos el ID al botón (útil si en un futuro lo necesitas)
    btnLista.dataset.Producto_ID = productoActual.ID_Producto;

    // 2) al renderizar, comprobamos si ya está en deseos y marcamos
    const yaEnDeseos = Lista_Deseos.Artículos.some(
      Item => Item.ID == productoActual.ID_Producto
    );
    btnLista.classList.toggle('Activo', yaEnDeseos);

    // 3) definimos el click para alternar favorito
    btnLista.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!localStorage.getItem('Token')) {
        document.getElementById('Modal_Login')?.classList.add('show');
        return;
      }
      const añadido = await Lista_Deseos.Alternar_Favorito(
        productoActual.ID_Producto,
        productoActual.Nombre,
        document.querySelector('.Imagen_Principal img')?.src || '',
        (parseFloat(productoActual.Precio_Oferta || productoActual.Precio) || 0).toFixed(2)
      );
      // actualizamos el estado visual tras el post/delete
      btnLista.classList.toggle('Activo', añadido);
    };
  }

  const enlaceCat = document.querySelector('.Link_Categoria');
  if (enlaceCat && productoActual.Categoría) {
    // mostrar texto
    enlaceCat.textContent = productoActual.Categoría;
    // generar URL con query param 'filtro'
    enlaceCat.href = `/html/productos.html?filtro=${encodeURIComponent(productoActual.Categoría)}`;
  }

  // Actualizar etiquetas
  actualizarEtiquetas()

  // Actualizar calificación
  actualizarCalificacion()

  // Actualizar precio
  actualizarPrecio()

  // Actualizar imágenes
  actualizarImagenes()

  // Actualizar zoom
  initZoom();

  // Actualizar variantes
  actualizarVariantes()

  // Actualizar pestañas de información
  actualizarPestañasInformacion()

  // Actualizar información adicional
  actualizarInformacionAdicional();

  // Inicializar el sistema de “calificación de usuario”
  initCalificacionUsuario();

  ;[
    '.Galería_Producto',
    '.Información_Detallada',
    '.Pestañas_Información',
    '.Productos_Relacionados',
    '.Comprados_Juntos'
  ].forEach(sel => {
    const nodo = document.querySelector(sel)
    if (nodo) nodo.classList.add('Animado')
  })
}

async function initCalificacionUsuario() {
  const estrellas = document.querySelectorAll('.Estrella_Usuario');
  let valorSeleccionado = 0;

  // ❶ Si hay token, consulta si ya valoró
  const Token = localStorage.getItem('Token');
  if (Token) {
    try {
      const resp = await fetch(`${API_BASE}/api/Productos/${productoActual.ID_Producto}/Calificación`, {
        headers: { 'Authorization': 'Bearer ' + Token }
      });
      const json = await resp.json();
      if (resp.ok && json.Éxito && json.Datos !== null) {
        valorSeleccionado = json.Datos;
        // muestra la calificación previa
        estrellas.forEach(s => {
          const v = parseInt(s.dataset.valor, 10);
          s.classList.toggle('fas', v <= valorSeleccionado);
          s.classList.toggle('far', v > valorSeleccionado);
          // ❷ bloquea clics
          s.style.pointerEvents = 'none';
        });
        return; // ya no enganchamos los listeners
      }
    } catch (_) { /* ignora fallo y deja poder valorar */ }
  }

  // ❸ Si no valoró antes, engancha comportamiento normal
  function resaltarHasta(valor) {
    estrellas.forEach(star => {
      const v = parseInt(star.dataset.valor, 10);
      star.classList.toggle('fas', v <= valor);
      star.classList.toggle('far', v > valor);
    });
  }

  estrellas.forEach(star => {
    const v = parseInt(star.dataset.valor, 10);
    star.addEventListener('mouseover', () => {
      if (valorSeleccionado === 0) resaltarHasta(v);
    });
    star.addEventListener('mouseout', () => {
      if (valorSeleccionado === 0) resaltarHasta(0);
    });
    star.addEventListener('click', async () => {
      if (valorSeleccionado > 0) return;
      valorSeleccionado = v;
      resaltarHasta(v);

      if (!Token) {
        abrirModalLogin();
        return;
      }
      try {
        const resp = await fetch(`${API_BASE}/api/Productos/${productoActual.ID_Producto}/calificar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + Token
          },
          body: JSON.stringify({ Calificación: v })
        });
        const json = await resp.json();
        if (!resp.ok || !json.Éxito) throw new Error(json.Mensaje || 'Error');
        // actualizar media y total en UI
        productoActual.Calificación_Media = json.Datos.Promedio;
        productoActual.Total_Reseñas = json.Datos.Total;
        actualizarCalificacion();
        // bloquear definitivamente
        estrellas.forEach(s => s.style.pointerEvents = 'none');
        Mostrar_Notificación('¡Gracias por su valoración!', 'Éxito');
      } catch (e) {
        console.error(e);
        Mostrar_Notificación(e.message, 'Error');
      }
    });
  });
}

function initZoom() {
  const img = document.querySelector('.Imagen_Principal img');
  const btn = document.querySelector('.Botón_Zoom');
  if (!img || !btn) return;

  let zoomOn = false;
  let posX = 0, posY = 0;
  const scale = 1.5;

  // Asegura overflow en el contenedor
  const cont = img.parentElement;
  cont.classList.add('Zoom_Contenedor');

  // Alternar zoom al clicar el botón
  btn.addEventListener('click', () => {
    zoomOn = !zoomOn;
    if (zoomOn) {
      img.classList.add('En_Zoom');
      img.style.transform = `scale(${scale})`;
    } else {
      img.classList.remove('En_Zoom');
      img.style.transform = 'scale(1)';
      img.style.transformOrigin = 'center center';
      posX = posY = 0;
    }
  });

  // Mover origen de zoom con el ratón
  img.addEventListener('mousemove', e => {
    if (!zoomOn) return;
    const R = img.getBoundingClientRect();
    const x = (e.clientX - R.left) / R.width;
    const y = (e.clientY - R.top) / R.height;
    img.style.transformOrigin = `${x * 100}% ${y * 100}%`;
  });

  // TOUCHSTART: guarda posición inicial
  let lastTouchX = 0, lastTouchY = 0;
  img.addEventListener('touchstart', e => {
    if (!zoomOn || e.touches.length !== 1) return;
    e.preventDefault();
    lastTouchX = e.touches[0].clientX;
    lastTouchY = e.touches[0].clientY;
  }, { passive: false });

  // TOUCHMOVE: arrastra la imagen
  img.addEventListener('touchmove', e => {
    if (!zoomOn || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchX;
    const deltaY = touch.clientY - lastTouchY;
    posX += deltaX / scale;
    posY += deltaY / scale;
    img.style.transform = `scale(${scale}) translate(${posX}px, ${posY}px)`;
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
  }, { passive: false });
}

// Actualizar migas de pan
function actualizarMigasPan() {
  if (!productoActual) return;

  // 1) Cambiar el nombre del producto
  const migasActual = document.querySelector(".Contenedor_Migas_Pan .Actual");
  if (migasActual) {
    migasActual.textContent = productoActual.Nombre;
  }

  // 2) Cambiar la categoría dinámica
  const linkCategoria = document.querySelector(".Contenedor_Migas_Pan .Link_Categoria");
  if (linkCategoria) {
    const cat = productoActual.Categoría || "Productos";
    linkCategoria.textContent = cat;
    // Usar la ruta real donde sirves tu listado de productos:
    linkCategoria.href = `/html/productos.html?filtro=${encodeURIComponent(cat)}`;
  }
}

// Actualizar etiquetas del producto
function actualizarEtiquetas() {
  const contenedorEtiquetas = document.querySelector(".Etiquetas_Producto")
  if (!contenedorEtiquetas) return

  contenedorEtiquetas.innerHTML = ""

  if (productoActual.Etiqueta) {
    const etiqueta = document.createElement("span")
    etiqueta.className = `Etiqueta ${productoActual.Etiqueta}`
    etiqueta.textContent = productoActual.Etiqueta
    contenedorEtiquetas.appendChild(etiqueta)
  }

  // Agregar etiqueta de oferta si hay precio de oferta
  const precio = parseFloat(productoActual.Precio) || 0
  const precioOferta = parseFloat(productoActual.Precio_Oferta) || 0

  if (precioOferta > 0 && precioOferta < precio) {
    const Descuento = Math.round(((precio - precioOferta) / precio) * 100)
    const etiquetaOferta = document.createElement("span")
    etiquetaOferta.className = "Etiqueta Oferta"
    etiquetaOferta.textContent = `-${Descuento}%`
    contenedorEtiquetas.appendChild(etiquetaOferta)
  }
}

// Actualizar calificación del producto
function actualizarCalificacion() {
  const calificacionProducto = document.querySelector(".Calificación_Producto")
  if (!calificacionProducto) return

  const Calificación = parseFloat(productoActual.Calificación_Media) || 0;
  const totalReseñas = parseInt(productoActual.Total_Reseñas) || 0;

  // Actualizar estrellas
  const estrellas = calificacionProducto.querySelector(".Estrellas")
  if (estrellas) {
    estrellas.innerHTML = ""
    for (let i = 1; i <= 5; i++) {
      const estrella = document.createElement("i")
      if (i <= Math.floor(Calificación)) {
        estrella.className = "fas fa-star"
      } else if (i === Math.ceil(Calificación) && !Number.isInteger(Calificación)) {
        estrella.className = "fas fa-star-half-alt"
      } else {
        estrella.className = "far fa-star"
      }
      estrellas.appendChild(estrella)
    }
  }

  // Actualizar número de reseñas
  const numeroReseñas = calificacionProducto.querySelector(".Número_Reseñas")
  if (numeroReseñas) {
    numeroReseñas.textContent = `(${totalReseñas} reseña${totalReseñas !== 1 ? "s" : ""})`
  }
}

// Actualizar precio del producto
function actualizarPrecio() {
  const contenedorPrecio = document.querySelector(".Precio_Producto")
  if (!contenedorPrecio) return

  // Obtener precio de la variante predeterminada o del producto base
  let precio = 0
  let precioOferta = 0

  // Primero verificar si hay una variante predeterminada
  const variantePredeterminada = variantesProducto.find(v => v.Predeterminada) || variantesProducto[0]

  if (variantePredeterminada) {
    precio = parseFloat(variantePredeterminada.Precio) || 0
    precioOferta = parseFloat(variantePredeterminada.Precio_Oferta) || 0
  } else {
    precio = parseFloat(productoActual.Precio) || 0
    precioOferta = parseFloat(productoActual.Precio_Oferta) || 0
  }

  let html = ""

  if (precioOferta > 0 && precioOferta < precio) {
    const Descuento = Math.round(((precio - precioOferta) / precio) * 100)
    html = `
      <span class="Precio_Actual">$${precioOferta.toFixed(2)}</span>
      <span class="Precio_Anterior">$${precio.toFixed(2)}</span>
      <span class="Descuento">Ahorra ${Descuento}%</span>
    `
  } else {
    html = `<span class="Precio_Actual">$${precio.toFixed(2)}</span>`
  }

  contenedorPrecio.innerHTML = html
}

// Actualizar imágenes del producto
function actualizarImagenes() {
  // 1. Asegúrate de que exista el <img> principal
  const contenedorImagen = document.querySelector(".Imagen_Principal");
  let imgElement = contenedorImagen.querySelector("img");
  if (!imgElement) {
    imgElement = document.createElement("img");
    imgElement.alt = productoActual.Nombre;
    contenedorImagen.appendChild(imgElement);
  }

  // 2. Filtrar según la variante seleccionada
  const varianteActual = obtenerVarianteActual();
  let imgs = [];
  if (varianteActual && varianteActual.ID_Variante_Producto) {
    imgs = imagenesProducto.filter(
      img => img.ID_Variante == varianteActual.ID_Variante_Producto
    );
  }
  // Si no hay imágenes específicas de esa variante, mostramos todas
  if (imgs.length === 0) {
    imgs = imagenesProducto;
  }

  // 3. Seleccionar la imagen principal (la marcada como Principal o la primera)
  const imagenPrincipalData =
    imgs.find(img => img.Principal === 1) ||
    imgs[0] ||
    { URL: "https://via.placeholder.com/500x500?text=Sin+Imagen" };

  imgElement.src = imagenPrincipalData.URL;
  imgElement.alt = imagenPrincipalData.Alt || productoActual.Nombre;

  // 4. Renderizar miniaturas
  const contenedorMiniaturas = document.querySelector(".Miniaturas_Producto");
  contenedorMiniaturas.innerHTML = "";
  imgs.slice(0, 4).forEach((Imagen, index) => {
    const miniatura = document.createElement("div");
    miniatura.className = `Miniatura ${index === 0 ? "Activo" : ""}`;
    miniatura.innerHTML = `
      <img
        src="${Imagen.URL}"
        alt="${Imagen.Alt || productoActual.Nombre}"
      >
    `;
    contenedorMiniaturas.appendChild(miniatura);
  });
}

// Actualizar variantes del producto
function actualizarVariantes() {
  const contenedorOpciones = document.querySelector(".Selección_Opciones")
  const tipoOpcion = document.querySelector(".Tipo_Opción")

  if (!contenedorOpciones) return

  contenedorOpciones.innerHTML = ""

  if (variantesProducto.length > 0) {
    // Mostrar la sección de opciones
    if (tipoOpcion) {
      tipoOpcion.style.display = "block"
    }

    variantesProducto.forEach((Variante, index) => {
      const opcion = document.createElement("div")
      opcion.className = `Opción ${Variante.Predeterminada || index === 0 ? "Seleccionado" : ""}`

      // Construir texto de la variante (prioriza Nombre_Variante; si no existe, usa Medida)
      let textoVariante = ""
      if (Variante.Nombre_Variante) {
        textoVariante = Variante.Nombre_Variante
      } else if (Variante.Medida) {
        textoVariante = Variante.Medida
      } else {
        textoVariante = `Variante ${index + 1}`
      }

      opcion.textContent = textoVariante
      opcion.setAttribute("data-variante-id", Variante.ID_Variante_Producto)
      opcion.setAttribute("data-precio", Variante.Precio || 0)
      opcion.setAttribute("data-precio-oferta", Variante.Precio_Oferta || "")
      opcion.setAttribute("data-stock", Variante.Stock || 0)

      contenedorOpciones.appendChild(opcion)
    })
  } else {
    // Ocultar la sección si no hay variantes
    if (tipoOpcion) {
      tipoOpcion.style.display = "none"
    }
  }
}

// Actualizar pestañas de información
function actualizarPestañasInformacion() {
  // Actualizar pestaña de características
  const caracteristicas = document.querySelector(".Pestaña_Contenido:first-child ul")
  if (caracteristicas) {
    let html = ""

    if (productoActual.Origen) {
      html += `<li><strong>Origen:</strong> ${productoActual.Origen}</li>`
    }

    if (productoActual.Graduación) {
      html += `<li><strong>Contenido alcohólico:</strong> ${productoActual.Graduación}% vol.</li>`
    }

    // Stock del producto o variante
    const stock = obtenerStockActual()
    if (stock !== null) {
      html += `<li><strong>En stock:</strong> ${stock} artículos</li>`
    }

    // Información de la variante seleccionada o predeterminada
    const varianteActual = obtenerVarianteActual()
    if (varianteActual && varianteActual.Medida) {
      html += `<li><strong>Volumen:</strong> ${varianteActual.Medida}</li>`
    }

    if (varianteActual && varianteActual.Graduación) {
      html += `<li><strong>Graduación alcohólica:</strong> ${varianteActual.Graduación}% vol.</li>`
    }

    if (varianteActual && varianteActual.SKU) {
      html += `<li><strong>SKU:</strong> ${varianteActual.SKU}</li>`
    }

    html += `<li><strong>Temperatura de servicio recomendada:</strong> 16-18°C</li>`

    caracteristicas.innerHTML = html
  }

  // Actualizar pestaña "Cómo Disfrutarlo"
  const comoDisfrutarlo = document.querySelector(".Pestaña_Contenido:nth-child(2)");
  if (comoDisfrutarlo) {
    if (productoActual.Cómo_Disfrutarlo) {
      const texto = productoActual.Cómo_Disfrutarlo.trim();
      // Partimos en líneas
      const párrafos = texto
        .split("\n")
        .map(linea => {
          const t = linea.trim();
          if (!t) return ""; // saltos de línea en blanco
          // si NO termina en punto (.) ni en dos puntos (:), lo ponemos en negrita
          if (!/[.:]$/.test(t)) {
            return `<p><strong>${t}</strong></p>`;
          } else {
            return `<p>${t}</p>`;
          }
        })
        .join("");

      comoDisfrutarlo.innerHTML = `
      <h3>Cómo Disfrutar ${productoActual.Nombre}</h3>
      ${párrafos}
    `;
    } else {
      comoDisfrutarlo.innerHTML = `
      <h3>Cómo Disfrutar ${productoActual.Nombre}</h3>
      <p>Información no disponible para este producto.</p>
    `;
    }
  }
}

// Obtener stock actual (del producto o variante seleccionada)
function obtenerStockActual() {
  const varianteSeleccionada = document.querySelector(".Opción.Seleccionado")
  if (varianteSeleccionada) {
    return parseInt(varianteSeleccionada.getAttribute("data-stock")) || 0
  }
  return parseInt(productoActual.Stock) || 0
}

// Obtener variante actual (seleccionada o predeterminada)
function obtenerVarianteActual() {
  const varianteSeleccionada = document.querySelector(".Opción.Seleccionado")
  if (varianteSeleccionada) {
    const varianteId = varianteSeleccionada.getAttribute("data-variante-id")
    return variantesProducto.find(v => v.ID_Variante_Producto == varianteId)
  }
  return variantesProducto.find(v => v.Predeterminada) || variantesProducto[0] || null
}

// Actualizar información adicional
function actualizarInformacionAdicional() {
  const informacionAdicional = document.querySelector(".Información_Adicional")
  if (!informacionAdicional) return

  const stock = obtenerStockActual()
  const enStock = stock > 0

  const elementos = informacionAdicional.querySelectorAll(".Elemento_Información")
  if (elementos.length > 0) {
    elementos[0].innerHTML = `
      <i class="fas ${enStock ? "fa-check-circle" : "fa-times-circle"}"></i>
      <span>${enStock ? `En stock - ${stock} disponibles` : "Agotado"}</span>
    `
  }
}

// Cargar productos relacionados
async function cargarProductosRelacionados() {
  try {
    const respuesta = await fetch(`${API_BASE}/api/Productos/all`);
    if (!respuesta.ok) return;

    const Datos = await respuesta.json();
    let todos = [];
    if (Datos.Éxito && Datos.Datos) {
      todos = Datos.Datos;
    } else if (Array.isArray(Datos.Datos)) {
      todos = Datos.Datos;
    } else if (Array.isArray(Datos)) {
      todos = Datos;
    }

    // 1) Eliminamos el producto actual
    const otros = todos.filter(p => p.ID_Producto !== productoActual.ID_Producto);

    // 2) Intentamos primero emparejar por prefijo de slug
    const prefijo = productoActual.Slug.split("-")[0];
    let relacionados = otros.filter(p => p.Slug.startsWith(prefijo));

    // 3) Si hay menos de 4, rellenamos con productos de la misma categoría (aleatorios)
    if (relacionados.length < 4) {
      const faltantesCategoria = otros
        .filter(p => p.Categoría === productoActual.Categoría && !relacionados.includes(p));

      // Mezclar faltantesCategoria
      for (let i = faltantesCategoria.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [faltantesCategoria[i], faltantesCategoria[j]] = [faltantesCategoria[j], faltantesCategoria[i]];
      }

      // Agregamos hasta completar 4
      const porAgregar = faltantesCategoria.slice(0, 4 - relacionados.length);
      relacionados = relacionados.concat(porAgregar);
    }

    // 4) Si aún hay menos de 4, rellenamos con cualquier otro aleatorio
    if (relacionados.length < 4) {
      const restantes = otros.filter(p => !relacionados.includes(p));
      // Mezclar restantes
      for (let i = restantes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [restantes[i], restantes[j]] = [restantes[j], restantes[i]];
      }
      const porAgregar2 = restantes.slice(0, 4 - relacionados.length);
      relacionados = relacionados.concat(porAgregar2);
    }

    // Finalmente, limitamos a 4
    relacionados = relacionados.slice(0, 4);

    renderizarProductosRelacionados(relacionados);
    cargarYRenderizarCompradosJuntos(productoActual.ID_Producto);
  } catch (error) {
    console.warn("Error al cargar productos relacionados:", error);
  }
}

// Renderizar productos relacionados
function renderizarProductosRelacionados(Productos) {
  const contenedor = document.querySelector(".Carrusel_Relacionados")
  if (!contenedor || Productos.length === 0) return

  contenedor.innerHTML = ""

  Productos.forEach(Producto => {
    const tarjeta = document.createElement("div")
    tarjeta.className = "Tarjeta_Producto"

    const precio = parseFloat(
      Producto.Precio_Oferta && parseFloat(Producto.Precio_Oferta) < parseFloat(Producto.Precio)
        ? Producto.Precio_Oferta
        : Producto.Precio
    ) || 0

    const URL_Imagen = Producto.Imagen_URL || "https://via.placeholder.com/320x200?text=Sin+Imagen"

    tarjeta.innerHTML = `
      <div class="Imagen_Tarjeta">
        <img src="${URL_Imagen}" alt="${Producto.Nombre}">
      </div>
      <div class="Cuerpo_Tarjeta">
        <h3 class="Título_Producto">${Producto.Nombre}</h3>
        <div class="Información_Producto">
          <div class="Precio_Tarjeta">$${precio.toFixed(2)}</div>
          <div class="Estrellas_Tarjeta">
            ${generarEstrellas(Producto.Calificación_Media || 0)}
          </div>
        </div>
        <div class="Botones_Tarjeta">
          <button class="Botones Botón_Primario Botón_Tarjeta" onclick="window.location.href='detalle.html?id=${Producto.ID_Producto}'">
            Ver Producto
          </button>
        </div>
      </div>
    `

    contenedor.appendChild(tarjeta)
  })
}

async function cargarYRenderizarCompradosJuntos(ID_Producto) {
  try {
    // 1) Traer los IDs de "comprados juntos"
    const resp = await fetch(`${API_BASE}/api/Productos/${ID_Producto}/Comprados_Juntos`);
    if (!resp.ok) return;
    const json = await resp.json();
    if (!json.Éxito) return;
    const Datos = json.Datos;
    if (!Array.isArray(Datos) || Datos.length === 0) return;

    // 2) IDs y detalles de cada producto
    const ids = Datos.map(Item => Item.ID_Producto);
    const Productos = await cargarDatosDeProductos(ids);

    // 3) Traer variantes predeterminadas para cada producto
    const variantesMap = {};
    await Promise.all(Productos.map(async p => {
      try {
        const r = await fetch(`${API_BASE}/api/Variantes/Producto/${p.ID_Producto}`);
        if (!r.ok) return;
        const j = await r.json();
        if (j.Éxito && Array.isArray(j.Datos) && j.Datos.length) {
          const pred = j.Datos.find(v => v.Predeterminada) || j.Datos[0];
          variantesMap[p.ID_Producto] = pred.Nombre_Variante || '';
        }
      } catch (__) { /* silencioso */ }
    }));

    // 4) Renderizar tarjetas en .Productos_Paquete
    const contenedorPaquete = document.querySelector(".Comprados_Juntos .Productos_Paquete");
    if (!contenedorPaquete) return;
    contenedorPaquete.innerHTML = "";

    Productos.forEach((p, index) => {
      // 4.1) Separador "+"
      if (index > 0) {
        const sep = document.createElement("div");
        sep.className = "Separador_Paquete";
        sep.textContent = "+";
        contenedorPaquete.appendChild(sep);
      }

      // 4.2) Crear tarjeta
      const precioNum = parseFloat(
        p.Precio_Oferta && parseFloat(p.Precio_Oferta) < parseFloat(p.Precio)
          ? p.Precio_Oferta
          : p.Precio
      ) || 0;
      const URL_Imagen = p.Imagen_URL || "https://via.placeholder.com/150x150?text=Sin+Imagen";

      const tarjeta = document.createElement("div");
      tarjeta.className = "Producto_Paquete";

      // INYECTAMOS AQUÍ LA VARIANTE en data-volumen
      tarjeta.dataset.volumen = variantesMap[p.ID_Producto] || "";

      tarjeta.innerHTML = `
        <div class="Imagen_Paquete">
          <img src="${URL_Imagen}" alt="${p.Nombre}" />
        </div>
        <div class="Nombre_Paquete">${p.Nombre}</div>
        <div class="Precio_Paquete">$${precioNum.toFixed(2)}</div>
      `;
      contenedorPaquete.appendChild(tarjeta);
    });

    // 5) Calcular y mostrar total
    const Total = Productos.reduce((sum, p) => {
      const pr = parseFloat(
        p.Precio_Oferta && parseFloat(p.Precio_Oferta) < parseFloat(p.Precio)
          ? p.Precio_Oferta
          : p.Precio
      ) || 0;
      return sum + pr;
    }, 0);
    const precioTotalElem = document.querySelector(".Comprados_Juntos .Precio_Total");
    if (precioTotalElem) {
      precioTotalElem.textContent = `$${Total.toFixed(2)}`;
    }

    // 6) Animación de entrada
    const contenedor = document.querySelector(".Comprados_Juntos");
    if (contenedor) contenedor.classList.add("Animado");

    // -- FIN función; el listener de "Agregar Todo" leerá ahora dataset.volumen --
  } catch (error) {
    console.error("Error al cargar 'Comprados Juntos':", error);
  }
}

// Generar HTML de estrellas
function generarEstrellas(Calificación) {
  let html = ""
  const cal = parseFloat(Calificación) || 0
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(cal)) {
      html += '<i class="fas fa-star"></i>'
    } else if (i === Math.ceil(cal) && !Number.isInteger(cal)) {
      html += '<i class="fas fa-star-half-alt"></i>'
    } else {
      html += '<i class="far fa-star"></i>'
    }
  }
  return html
}

// Función para actualizar precio según variante
function actualizarPrecioVariante(precio, precioOferta, stock) {
  const contenedorPrecio = document.querySelector(".Precio_Producto")
  if (!contenedorPrecio) return

  let html = ""
  const precioNum = parseFloat(precio) || 0
  const precioOfertaNum = parseFloat(precioOferta) || 0

  if (precioOfertaNum > 0 && precioOfertaNum < precioNum) {
    const Descuento = Math.round(((precioNum - precioOfertaNum) / precioNum) * 100)
    html = `
      <span class="Precio_Actual">$${precioOfertaNum.toFixed(2)}</span>
      <span class="Precio_Anterior">$${precioNum.toFixed(2)}</span>
      <span class="Descuento">Ahorra ${Descuento}%</span>
    `
  } else {
    html = `<span class="Precio_Actual">$${precioNum.toFixed(2)}</span>`
  }

  contenedorPrecio.innerHTML = html

  // Actualizar información de stock
  const informacionAdicional = document.querySelector(".Información_Adicional")
  if (informacionAdicional) {
    const elementoStock = informacionAdicional.querySelector(".Elemento_Información:first-child")
    if (elementoStock) {
      const enStock = parseInt(stock) > 0
      elementoStock.innerHTML = `
        <i class="fas ${enStock ? "fa-check-circle" : "fa-times-circle"}"></i>
        <span>${enStock ? `En stock - ${stock} disponibles` : "Agotado"}</span>
      `
    }
  }

  // Actualizar pestañas con nueva información
  actualizarPestañasInformacion()
}

// Mostrar indicador de carga
function mostrarIndicadorCarga(mostrar) {
  let indicador = document.querySelector(".Indicador_Carga")

  if (mostrar && !indicador) {
    indicador = document.createElement("div")
    indicador.className = "Indicador_Carga"
    indicador.innerHTML = `
      <div class="Spinner"></div>
      <p>Cargando producto...</p>
    `
    indicador.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `
    document.body.appendChild(indicador)
  } else if (!mostrar && indicador) {
    indicador.remove()
  }
}

// Mostrar mensaje de error
function mostrarError(Mensaje) {
  const contenedorDetalle = document.querySelector(".Detalle_Producto")
  if (contenedorDetalle) {
    contenedorDetalle.innerHTML = `
      <div class="Error_Producto" style="text-align: center; padding: 50px;">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;"></i>
        <h2>Error al cargar el producto</h2>
        <p>${Mensaje}</p>
        <button class="Botones Botón_Primario" onclick="window.location.href='../html/productos.html'">
          Volver a Productos
        </button>
      </div>
    `
  }
}

// Función de notificación
function mostrarNotificacion(Mensaje, Tipo) {
  if (typeof window.Mostrar_Notificación === "function") {
    window.Mostrar_Notificación(Mensaje, Tipo)
  } else {
    console.log(`${Tipo}: ${Mensaje}`)
  }
}

// Event listeners cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // Funcionalidad para selección de variantes
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("Opción")) {
      // Remover selección previa
      const hermanos = e.target.parentElement.querySelectorAll(".Opción")
      hermanos.forEach(elemento => elemento.classList.remove("Seleccionado"))

      // Agregar selección actual
      e.target.classList.add("Seleccionado")

      // Actualizar precio según la variante seleccionada
      const precio = parseFloat(e.target.getAttribute("data-precio")) || 0
      const precioOferta = e.target.getAttribute("data-precio-oferta") || ""
      const stock = parseInt(e.target.getAttribute("data-stock")) || 0

      actualizarPrecioVariante(precio, precioOferta, stock)
      actualizarImagenes()
    }
  })

  // Funcionalidad para miniaturas de galería
  document.addEventListener("click", (e) => {
    if (e.target.closest(".Miniatura")) {
      const miniatura = e.target.closest(".Miniatura")

      // Actualizar clase activa
      const miniaturaActiva = document.querySelector(".Miniatura.Activo")
      if (miniaturaActiva) miniaturaActiva.classList.remove("Activo")
      miniatura.classList.add("Activo")

      // Actualizar imagen principal
      const imagenPrincipal = document.querySelector(".Imagen_Principal img")
      const rutaImagen = miniatura.querySelector("img").src
      if (imagenPrincipal) imagenPrincipal.src = rutaImagen
    }
  })

  // — Compartir —
  const botonCompartir = document.querySelector('.Botón_Compartir');
  if (botonCompartir) {
    botonCompartir.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();              // ← aquí
      const nombre = document.querySelector('.Nombre_Producto').textContent;
      const url = window.location.href;

      const menu = document.createElement('div');
      menu.className = 'Menú_Compartir';
      menu.innerHTML = `
      <div class="Opción_Compartir" data-red="facebook"><i class="fab fa-facebook"></i> Facebook</div>
      <div class="Opción_Compartir" data-red="tiktok"><i class="fab fa-tiktok"></i> TikTok</div>
      <div class="Opción_Compartir" data-red="whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</div>
    `;
      // Evitamos que un clic dentro del menú lo cierre
      menu.addEventListener('click', ev => ev.stopPropagation());

      const rect = botonCompartir.getBoundingClientRect();
      menu.style.position = 'absolute';
      menu.style.top = (rect.bottom + window.scrollY) + 'px';
      menu.style.left = (rect.left + window.scrollX) + 'px';
      document.body.appendChild(menu);

      menu.querySelectorAll('.Opción_Compartir').forEach(op => {
        op.addEventListener('click', () => {
          let shareUrl = '';
          switch (op.dataset.red) {
            case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
              break;
            case 'tiktok':
              shareUrl = `https://www.tiktok.com/upload?url=${encodeURIComponent(url)}`;
              break;
            case 'whatsapp':
              shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Mira este producto: ' + nombre + ' ' + url)}`;
              break;
          }
          window.open(shareUrl, '_blank', 'width=600,height=400');
          menu.remove();
          Mostrar_Notificación(`Compartiendo en ${op.dataset.red}…`, 'Información');
        });
      });

      // cerrar al hacer clic fuera
      document.addEventListener('click', function cerrar(e) {
        if (!menu.contains(e.target) && e.target !== botonCompartir) {
          menu.remove();
          document.removeEventListener('click', cerrar);
        }
      });
    });
  }

  // Funcionalidad del contador de cantidad
  const botonMenos = document.querySelector(".Contador .Botón_Contador:first-child")
  const botonMas = document.querySelector(".Contador .Botón_Contador:last-child")
  const valorContador = document.querySelector(".Valor_Contador")

  if (botonMenos && botonMas && valorContador) {
    let Cantidad = 1

    botonMenos.addEventListener("click", () => {
      if (Cantidad > 1) {
        Cantidad--
        valorContador.textContent = Cantidad
      }
    })

    botonMas.addEventListener("click", () => {
      // 1) Obtenemos la variante actual y su stock
      const Variante = obtenerVarianteActual()
      const stock = Variante?.Stock ?? Infinity

      // 2) Solo incrementamos si no excedemos el stock
      if (Cantidad < stock) {
        Cantidad++
        valorContador.textContent = Cantidad
      } else {
        // Opcional: notificar al usuario que no hay más unidades
        Mostrar_Notificación(
          `Solo quedan ${stock} unidades disponibles`,
          'Advertencia'
        )
      }
    })
  }

  // Funcionalidad para pestañas de información
  const pestañas = document.querySelectorAll(".Navegación_Pestañas .Pestaña")
  const contenidos = document.querySelectorAll(".Pestañas_Contenido .Pestaña_Contenido")

  pestañas.forEach((pestaña, indice) => {
    pestaña.addEventListener("click", () => {
      const pestañaActiva = document.querySelector(".Pestaña.Activo")
      const contenidoActivo = document.querySelector(".Pestaña_Contenido.Activo")

      if (pestañaActiva) pestañaActiva.classList.remove("Activo")
      if (contenidoActivo) contenidoActivo.classList.remove("Activo")

      pestaña.classList.add("Activo")
      if (contenidos[indice]) contenidos[indice].classList.add("Activo")
    })
  })

  // Inicializa la lista de deseos
  if (window.Lista_Deseos?.Inicializar) {
    Lista_Deseos.Inicializar();
  }
  // Engancha YA los eventos de clic para abrir/cerrar el panel 
  if (window.Lista_Deseos?.Configurar_Delegación_Eventos) {
    Lista_Deseos.Configurar_Delegación_Eventos();
  }

  const botonAgregar = document.querySelector('.Botón_Agregar');
  if (botonAgregar) {
    botonAgregar.addEventListener('click', (e) => {
      e.stopPropagation();
      const Cantidad = parseInt(
        document.querySelector('.Valor_Contador').textContent,
        10
      );

      const Variante = obtenerVarianteActual();
      const stock = Variante?.Stock ?? 0;

      if (Cantidad > stock) {
        Mostrar_Notificación(`No puedes añadir más de ${stock} unidades disponibles.`, 'Error');
        return;
      }

      const Nombre_Variante = Variante?.Nombre_Variante ?? '';
      const nombreCompleto = Nombre_Variante
        ? `${productoActual.Nombre} – ${Nombre_Variante}`
        : productoActual.Nombre;

      const Imagen = document.querySelector('.Imagen_Principal img')?.src || '';
      const textoPrecio = document.querySelector('.Precio_Producto .Precio_Actual').textContent;
      const precio = parseFloat(textoPrecio.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;

      window.Carrito.Agregar_Elemento(
        nombreCompleto,
        precio,
        Imagen,
        Cantidad
      );
    }, true);
  }

  // Inicializar la carga de datos del producto
  cargarDatosProducto()
})

document.addEventListener('DOMContentLoaded', () => {
  // 1) Referencias
  const btnWishlist = document.querySelector('.Botón_Lista_Deseos');
  const panelWishlist = document.querySelector('.Lista_Deseos');
  const btnCerrar = document.querySelector('.Cerrar_Lista_Deseos');

  // 2) Abrir/ocultar panel
  if (btnWishlist && panelWishlist) {
    btnWishlist.addEventListener('click', (e) => {
      e.preventDefault();
      panelWishlist.classList.toggle('Activo');
    });
  }

  // 3) Cerrar panel
  if (btnCerrar && panelWishlist) {
    btnCerrar.addEventListener('click', (e) => {
      e.preventDefault();
      panelWishlist.classList.remove('Activo');
    });
  }
});