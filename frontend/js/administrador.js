document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('Select_Administrador');
    const content = document.getElementById('Contenido_Administrador');
    // ---------------- Pedidos ----------------
    const modal = document.getElementById('Modal_Pedido');
    const cerrarModal = document.getElementById('Cerrar_Modal_Pedido');
    const btnGuardar = document.getElementById('Botón_Guardar_Pedido');
    const btnCancelar = document.getElementById('Botón_Cancelar_Pedido');
    const modalID = document.getElementById('ID_Modal_Pedido');
    const detUsuario = document.getElementById('Detalle_Usuario');
    const detFecha = document.getElementById('Detalle_Fecha');
    const detTotal = document.getElementById('Detalle_Total');
    const detEstado = document.getElementById('Detalle_Estado');
    const detProductos = document.getElementById('Detalle_Productos');

    // ---------------- Productos ----------------
    const prodModal = document.getElementById('Modal_Producto');
    const cerrarProdModal = document.getElementById('Cerrar_Modal_Producto');
    const btnNuevoProd = document.getElementById('BtnNuevoProducto');
    const Botón_Guardar_Producto = document.getElementById('Botón_Guardar_Producto');
    const btnCancelarProd = document.getElementById('Botón_Cancelar_Producto');
    let modoProducto = 'Crear', idProductoActual = null;

    // Helper: JWT en headers
    function authHeader() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    // Inicial + cambio de sección
    async function loadSection(sect) {
        content.innerHTML = '';
        if (sect === 'Pedidos') {
            await renderPedidos();
        } else if (sect === 'productos') {
            await renderProductos();
        }
    }
    select.addEventListener('change', () => loadSection(select.value));
    loadSection(select.value);

    // ------------- Render Pedidos -------------
    // ------------- Carga categorías para el formulario de Productos -------------
    async function cargarCategoriasAdmin() {
        try {
            const resp = await fetch(`${baseUrl}/api/Categorías`, {
                headers: authHeader()
            });
            const json = await resp.json();
            if (!resp.ok || !json.Éxito) {
                throw new Error(json.Mensaje || 'Error al cargar categorías');
            }
            const sel = document.getElementById('Categoría_Producto');
            sel.innerHTML = json.Datos
                .map(c => `<option value="${c.ID_Categoría}">${c.Nombre}</option>`)
                .join('');
        } catch (e) {
            Mostrar_Notificación(`No se pudieron cargar categorías: ${e.message}`, 'Error');
        }
    }

    async function renderPedidos() {
        content.innerHTML = '<p>Cargando pedidos…</p>';
        try {
            const resp = await fetch(`${baseUrl}/api/admin/pedidos`, { headers: authHeader() });
            const json = await resp.json();
            if (!resp.ok || !json.Éxito) throw new Error(json.Mensaje);
            const table = document.createElement('table');
            table.className = 'Tabla_Administrador';
            table.innerHTML = `
        <thead>
          <tr>
            <th>ID</th><th>Usuario</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${json.Datos.map(p => `
            <tr>
              <td>${p.idPedido}</td>
              <td>${p.ID_Usuario}</td>
              <td>${new Date(p.fecha).toLocaleString()}</td>
              <td>$${parseFloat(p.Total).toFixed(2)}</td>
              <td><span class="Estado_Texto ${p.estadoPedido}">${p.estadoPedido}</span></td>
              <td>
                <button class="Botones Botón_Primario" onclick="viewPedido(${p.idPedido})">
                  Ver/Editar
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>`;
            content.innerHTML = '';
            content.appendChild(table);
        } catch (e) {
            content.innerHTML = `<p>Error al cargar pedidos: ${e.message}</p>`;
        }
    }

    // Detalle Pedido
    window.viewPedido = async (id) => {
        try {
            const resp = await fetch(`${baseUrl}/api/admin/pedidos/${id}`, { headers: authHeader() });
            const json = await resp.json();
            if (!resp.ok || !json.Éxito) throw new Error(json.Mensaje);
            const { pedido, items } = json.Datos;
            modalID.textContent = pedido.idPedido;
            detUsuario.textContent = pedido.ID_Usuario;
            detFecha.textContent = new Date(pedido.fecha).toLocaleString();
            detTotal.textContent = parseFloat(pedido.total).toFixed(2);
            detEstado.value = pedido.estadoPedido;
            detProductos.innerHTML = items.map(item => {
                const nombre = item.nombreVariante
                    ? `${item.nombreProducto} – ${item.nombreVariante}`
                    : item.nombreProducto;
                return `
          <tr>
            <td>${nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${parseFloat(item.precioUnitario).toFixed(2)}</td>
          </tr>
        `;
            }).join('');
            modal.classList.remove('Oculto');
        } catch (e) {
            Mostrar_Notificación('No se pudo cargar detalle: ' + e.message, 'Error');
        }
    };

    btnGuardar?.addEventListener('click', async () => {
        const id = modalID.textContent;
        const nuevoEstado = detEstado.value;
        try {
            const resp = await fetch(`${baseUrl}/api/admin/pedidos/${id}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', ...authHeader() },
                body: JSON.stringify({ nuevoEstado })
            });
            const json = await resp.json();
            if (!resp.ok || !json.Éxito) throw new Error(json.Mensaje);
            modal.classList.add('Oculto');
            await renderPedidos();
            Mostrar_Notificación('Estado actualizado correctamente.', 'Éxito');
        } catch (e) {
            Mostrar_Notificación('Error al guardar: ' + e.message, 'Error');
        }
    });
    cerrarModal?.addEventListener('click', () => modal.classList.add('Oculto'));
    btnCancelar?.addEventListener('click', () => modal.classList.add('Oculto'));

    // ------------- Render Productos -------------
    async function renderProductos() {
        content.innerHTML = '<p>Cargando productos…</p>';
        try {
            const resp = await fetch(`${baseUrl}/api/admin/productos`, { headers: authHeader() });
            const json = await resp.json();
            if (!resp.ok || !json.Éxito) throw new Error(json.Mensaje);
            const table = document.createElement('table');
            table.className = 'Tabla_Administrador';
            table.innerHTML = `
        <thead>
          <tr>
            <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Activo</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${json.Datos.map(p => `
            <tr>
              <td>${p.Nombre}</td>
              <td>${p.Categoría}</td>
              <td>$${parseFloat(p.Precio).toFixed(2)}</td>
              <td>${p.Activo ? 'Sí' : 'No'}</td>
              <td>
                <button class="Botones Botón_Primario" onclick="viewProducto(${p.ID_Producto})">✏️</button>
                <button class="Botones Botón_Secundario" onclick="eliminarProducto(${p.ID_Producto})">🗑️</button>
              </td>
            </tr>
          `).join('')}
        </tbody>`;
            content.innerHTML = '';
            // Agregar botón Nuevo Producto
            const btnNuevo = document.createElement('button');
            btnNuevo.textContent = 'Nuevo Producto'; btnNuevo.className = 'Botones';
            btnNuevo.onclick = () => abrirModal_Producto('Crear');
            content.appendChild(btnNuevo);
            content.appendChild(table);
        } catch (e) {
            content.innerHTML = `<p>Error al cargar productos: ${e.message}</p>`;
        }
    }

    window.viewProducto = async (id) => {
        modoProducto = 'editar'; idProductoActual = id;
        document.getElementById('Título_Modal_Producto').textContent = 'Editar';
        ResetearModal_Producto();
        try {
            const resp = await fetch(`${baseUrl}/api/productos/${id}`, { headers: authHeader() });
            const { Datos: prod } = await resp.json();
            document.getElementById('Nombre_Producto').value = prod.Nombre;
            document.getElementById('Precio_Producto').value = prod.Precio;
            document.getElementById('Categoría_Producto').value = prod.ID_Categoría;
            document.getElementById('Activo_Producto').checked = prod.Activo === 1;
            await cargarVariantes(id);
            await cargarImagenes(id);
            prodModal.classList.remove('Oculto');
        } catch (e) {
            Mostrar_Notificación('Error al cargar producto: ' + e.message, 'Error');
        }
    };

    if (btnNuevoProd) btnNuevoProd.onclick = () => abrirModal_Producto('Crear');
    if (cerrarProdModal) cerrarProdModal.onclick = () => prodModal.classList.add('Oculto');
    if (btnCancelarProd) btnCancelarProd.onclick = () => prodModal.classList.add('Oculto');

    async function abrirModal_Producto(modo, id = null) {
        modoProducto = modo; idProductoActual = id;
        document.getElementById('Título_Modal_Producto').textContent = modo === 'Crear' ? 'Nuevo' : 'Editar';
        // 1) Traer de nuevo las categorías (por si se han actualizado)
        await cargarCategoriasAdmin();
        // 2) Limpiar el formulario (resetear valores, variantes e imágenes) 
        ResetearModal_Producto();
        if (modo === 'editar' && id) window.viewProducto(id);
        else prodModal.classList.remove('Oculto');
    }

    Botón_Guardar_Producto.onclick = async () => {
        const Datos = {
            Nombre: document.getElementById('Nombre_Producto').value,
            Precio: parseFloat(document.getElementById('Precio_Producto').value),
            Activo: document.getElementById('Activo_Producto').checked ? 1 : 0,
            ID_Categoría: parseInt(document.getElementById('Categoría_Producto').value, 10)
        };
        let res, json;
        try {
            if (modoProducto === 'Crear') {
                res = await fetch(`${baseUrl}/api/admin/productos`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify(Datos)
                });
                json = await res.json(); idProductoActual = json.Datos.idProducto;
            } else {
                await fetch(`${baseUrl}/api/admin/productos/${idProductoActual}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify(Datos)
                });
            }
            await procesarVariantes(idProductoActual);
            await procesarImagenes(idProductoActual);
            prodModal.classList.add('Oculto');
            // 1) Asegurarnos de tener categorías antes de listar
            await cargarCategoriasAdmin();
            // 2) Luego renderizamos la tabla 
            await renderProductos();
            Mostrar_Notificación('Producto guardado', 'Éxito');
        } catch (e) {
            Mostrar_Notificación('Error al guardar producto: ' + e.message, 'Error');
        }
    };

    window.eliminarProducto = async (id) => {
        if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
        await fetch(`${baseUrl}/api/admin/productos/${id}`, { method: 'DELETE', headers: authHeader() });
        await renderProductos();
    };

    // Pestañas y Variantes/Imágenes
    function cambiarPestaña(tab) {
        document.querySelectorAll('.Pestaña, .Contenido_Pestaña').forEach(el => el.classList.remove('Pestaña_Activo', 'Oculto'));
        document.querySelector(`.Pestaña[data-tab="${tab}"]`).classList.add('Pestaña_Activo');
        document.getElementById(`Pestaña_${tab}`).classList.remove('Oculto');
    }
    document.querySelectorAll('.Pestaña').forEach(tab => tab.addEventListener('click', () => cambiarPestaña(tab.dataset.tab)));

    // Variantes
    async function cargarVariantes(idProd) {
        const { Datos } = await (await fetch(`${baseUrl}/api/variantes/producto/${idProd}`, { headers: authHeader() })).json();
        const tbody = document.getElementById('Tabla_Variantes'); tbody.innerHTML = '';
        Datos.forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td><input name="Nombre_Variante" value="${v.Nombre_Variante}"></td>
        <td><input name="SKU" value="${v.SKU}"></td>
        <td><input type="number" name="Precio" value="${v.Precio}" step="0.01"></td>
        <td><button class="EliminarVariante" data-id="${v.ID_Variante_Producto}">🗑️</button></td>
      `;
            tbody.appendChild(tr);
            tr.querySelector('.EliminarVariante').onclick = () => eliminarVariante(v.ID_Variante_Producto);
        });
    }
    function agregarFilaVariante() {
        const tbody = document.getElementById('Tabla_Variantes');
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input name="Nombre_Variante"></td>
      <td><input name="SKU"></td>
      <td><input type="number" name="Precio" step="0.01"></td>
      <td><button class="EliminarVariante">🗑️</button></td>
    `;
        tbody.appendChild(tr); tr.querySelector('.EliminarVariante').onclick = () => tr.remove();
    }
    document.getElementById('Botón_Nueva_Variante').onclick = agregarFilaVariante;
    async function procesarVariantes(idProd) {
        const Filas = [...document.getElementById('Tabla_Variantes').rows];
        for (let fila of Filas) {
            const idVar = fila.querySelector('.EliminarVariante').dataset.id;
            const Datos = {
                ID_Producto: idProd,
                Nombre_Variante: fila.querySelector('input[name="Nombre_Variante"]').value,
                SKU: fila.querySelector('input[name="SKU"]').value,
                Precio: parseFloat(fila.querySelector('input[name="Precio"]').value) || 0,
                Activo: 1
            };
            if (idVar) {
                await fetch(`${baseUrl}/api/admin/variantes/${idVar}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(Datos) });
            } else {
                await fetch(`${baseUrl}/api/admin/variantes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(Datos) });
            }
        }
    }
    async function eliminarVariante(id) {
        if (!confirm('¿Eliminar variante?')) return;
        await fetch(`${baseUrl}/api/admin/variantes/${id}`, { method: 'DELETE', headers: authHeader() });
        await cargarVariantes(idProductoActual);
    }

    // Imágenes (análogo a variantes)
    async function cargarImagenes(idProd) {
        const { Datos } = await (await fetch(`${baseUrl}/api/imagenes/producto/${idProd}`, { headers: authHeader() })).json();
        const tbody = document.getElementById('Tabla_Imágenes'); tbody.innerHTML = '';
        Datos.forEach(img => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
        <td><input name="URL" value="${img.URL}"></td>
        <td><input name="Alt" value="${img.Alt}"></td>
        <td><input type="checkbox" name="Predeterminada" ${img.Predeterminada ? 'checked' : ''}></td>
        <td><input type="number" name="Orden" value="${img.Orden}"></td>
        <td><button class="EliminarImagen" data-id="${img.ID_Imagen_Producto}">🗑️</button></td>
      `;
            tbody.appendChild(tr);
            tr.querySelector('.EliminarImagen').onclick = () => eliminarImagen(img.ID_Imagen_Producto);
        });
    }
    function agregarFilaImagen() {
        const tbody = document.getElementById('Tabla_Imágenes');
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input name="URL" placeholder="https://..."></td>
      <td><input name="Alt"></td>
      <td><input type="checkbox" name="Predeterminada"></td>
      <td><input type="number" name="Orden" value="0"></td>
      <td><button class="EliminarImagen">🗑️</button></td>
    `;
        tbody.appendChild(tr);
        tr.querySelector('.EliminarImagen').onclick = () => tr.remove();
    }
    document.getElementById('Botón_Nueva_Imagen').onclick = agregarFilaImagen;
    async function procesarImagenes(idProd) {
        const Filas = [...document.getElementById('Tabla_Imágenes').rows];
        for (let fila of Filas) {
            const idImg = fila.querySelector('.EliminarImagen').dataset.id;
            const Datos = {
                ID_Producto: idProd,
                URL: fila.querySelector('input[name="URL"]').value,
                Alt: fila.querySelector('input[name="Alt"]').value,
                Orden: parseInt(fila.querySelector('input[name="Orden"]').value, 10) || 0,
                Predeterminada: fila.querySelector('input[name="Predeterminada"]').checked ? 1 : 0
            };
            if (idImg) {
                await fetch(`${baseUrl}/api/admin/imagenes/${idImg}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(Datos) });
            } else {
                await fetch(`${baseUrl}/api/admin/imagenes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(Datos) });
            }
        }
    }
    async function eliminarImagen(id) {
        if (!confirm('¿Eliminar imagen?')) return;
        await fetch(`${baseUrl}/api/admin/imagenes/${id}`, { method: 'DELETE', headers: authHeader() });
        await cargarImagenes(idProductoActual);
    }

    // Reset modal producto
    function ResetearModal_Producto() {
        // localiza el formulario en el DOM
        const form = document.getElementById('Formulario_Producto');
        if (form) {
            form.reset();
        } else {
            console.warn('ResetearModal_Producto: no se encontró #Formulario_Producto');
        }

        // limpia las tablas (estos IDs sí deben existir)
        const tv = document.getElementById('Tabla_Variantes');
        const ti = document.getElementById('Tabla_Imágenes');
        if (tv) tv.innerHTML = '';
        if (ti) ti.innerHTML = '';
        // si tienes data-id en botones, límpialos también:
        document.querySelectorAll('.EliminarVariante, .EliminarImagen')
            .forEach(b => delete b.dataset.id);
    }
});