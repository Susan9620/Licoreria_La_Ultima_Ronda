document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('AdminSectionSelect');
    const content = document.getElementById('AdminContent');
    // ---------------- Pedidos ----------------
    const modal = document.getElementById('ModalPedido');
    const cerrarModal = document.getElementById('CerrarModalPedido');
    const btnGuardar = document.getElementById('BtnGuardarPedido');
    const btnCancelar = document.getElementById('BtnCancelarPedido');
    const modalID = document.getElementById('ModalPedidoID');
    const detUsuario = document.getElementById('DetUsuario');
    const detFecha = document.getElementById('DetFecha');
    const detTotal = document.getElementById('DetTotal');
    const detEstado = document.getElementById('DetEstado');
    const detProductos = document.getElementById('DetProductos');

    // ---------------- Productos ----------------
    const prodModal = document.getElementById('ModalProducto');
    const cerrarProdModal = document.getElementById('CerrarModalProducto');
    const btnNuevoProd = document.getElementById('BtnNuevoProducto');
    const btnGuardarProd = document.getElementById('BtnGuardarProducto');
    const btnCancelarProd = document.getElementById('BtnCancelarProducto');
    let modoProducto = 'crear', idProductoActual = null;

    // Helper: JWT en headers
    function authHeader() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': 'Bearer ' + token } : {};
    }

    // Inicial + cambio de sección
    async function loadSection(sect) {
        content.innerHTML = '';
        if (sect === 'pedidos') {
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
            const resp = await fetch(`${baseUrl}/api/categorias`, {
                headers: authHeader()
            });
            const json = await resp.json();
            if (!resp.ok || !json.éxito) {
                throw new Error(json.mensaje || 'Error al cargar categorías');
            }
            const sel = document.getElementById('Prod_Categoria');
            sel.innerHTML = json.datos
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
            if (!resp.ok || !json.éxito) throw new Error(json.mensaje);
            const table = document.createElement('table');
            table.className = 'Tabla_Admin';
            table.innerHTML = `
        <thead>
          <tr>
            <th>ID</th><th>Usuario</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${json.datos.map(p => `
            <tr>
              <td>${p.idPedido}</td>
              <td>${p.idUsuario}</td>
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
            if (!resp.ok || !json.éxito) throw new Error(json.mensaje);
            const { pedido, items } = json.datos;
            modalID.textContent = pedido.idPedido;
            detUsuario.textContent = pedido.idUsuario;
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
            if (!resp.ok || !json.éxito) throw new Error(json.mensaje);
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
            if (!resp.ok || !json.éxito) throw new Error(json.mensaje);
            const table = document.createElement('table');
            table.className = 'Tabla_Admin';
            table.innerHTML = `
        <thead>
          <tr>
            <th>Nombre</th><th>Categoría</th><th>Precio</th><th>Activo</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${json.datos.map(p => `
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
            btnNuevo.onclick = () => abrirModalProducto('crear');
            content.appendChild(btnNuevo);
            content.appendChild(table);
        } catch (e) {
            content.innerHTML = `<p>Error al cargar productos: ${e.message}</p>`;
        }
    }

    window.viewProducto = async (id) => {
        modoProducto = 'editar'; idProductoActual = id;
        document.getElementById('ModalProductoTitulo').textContent = 'Editar';
        ResetearModalProducto();
        try {
            const resp = await fetch(`${baseUrl}/api/productos/${id}`, { headers: authHeader() });
            const { datos: prod } = await resp.json();
            document.getElementById('Prod_Nombre').value = prod.Nombre;
            document.getElementById('Prod_Precio').value = prod.Precio;
            document.getElementById('Prod_Categoria').value = prod.ID_Categoría;
            document.getElementById('Prod_Activo').checked = prod.Activo === 1;
            await cargarVariantes(id);
            await cargarImagenes(id);
            prodModal.classList.remove('Oculto');
        } catch (e) {
            Mostrar_Notificación('Error al cargar producto: ' + e.message, 'Error');
        }
    };

    if (btnNuevoProd) btnNuevoProd.onclick = () => abrirModalProducto('crear');
    if (cerrarProdModal) cerrarProdModal.onclick = () => prodModal.classList.add('Oculto');
    if (btnCancelarProd) btnCancelarProd.onclick = () => prodModal.classList.add('Oculto');

    async function abrirModalProducto(modo, id = null) {
        modoProducto = modo; idProductoActual = id;
        document.getElementById('ModalProductoTitulo').textContent = modo === 'crear' ? 'Nuevo' : 'Editar';
        // 1) Traer de nuevo las categorías (por si se han actualizado)
        await cargarCategoriasAdmin();
        // 2) Limpiar el formulario (resetear valores, variantes e imágenes) 
        ResetearModalProducto();
        if (modo === 'editar' && id) window.viewProducto(id);
        else prodModal.classList.remove('Oculto');
    }

    btnGuardarProd.onclick = async () => {
        const datos = {
            Nombre: document.getElementById('Prod_Nombre').value,
            Precio: parseFloat(document.getElementById('Prod_Precio').value),
            Activo: document.getElementById('Prod_Activo').checked ? 1 : 0,
            ID_Categoría: parseInt(document.getElementById('Prod_Categoria').value, 10)
        };
        let res, json;
        try {
            if (modoProducto === 'crear') {
                res = await fetch(`${baseUrl}/api/admin/productos`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify(datos)
                });
                json = await res.json(); idProductoActual = json.datos.idProducto;
            } else {
                await fetch(`${baseUrl}/api/admin/productos/${idProductoActual}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() },
                    body: JSON.stringify(datos)
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

    // Tabs y variantes/imagenes
    function cambiarTab(tab) {
        document.querySelectorAll('.Tab, .TabContent').forEach(el => el.classList.remove('Tab_Activo', 'Oculto'));
        document.querySelector(`.Tab[data-tab="${tab}"]`).classList.add('Tab_Activo');
        document.getElementById(`Tab_${tab}`).classList.remove('Oculto');
    }
    document.querySelectorAll('.Tab').forEach(tab => tab.addEventListener('click', () => cambiarTab(tab.dataset.tab)));

    // Variantes
    async function cargarVariantes(idProd) {
        const { datos } = await (await fetch(`${baseUrl}/api/variantes/producto/${idProd}`, { headers: authHeader() })).json();
        const tbody = document.getElementById('TablaVariantes'); tbody.innerHTML = '';
        datos.forEach(v => {
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
        const tbody = document.getElementById('TablaVariantes');
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input name="Nombre_Variante"></td>
      <td><input name="SKU"></td>
      <td><input type="number" name="Precio" step="0.01"></td>
      <td><button class="EliminarVariante">🗑️</button></td>
    `;
        tbody.appendChild(tr); tr.querySelector('.EliminarVariante').onclick = () => tr.remove();
    }
    document.getElementById('BtnNuevaVariante').onclick = agregarFilaVariante;
    async function procesarVariantes(idProd) {
        const filas = [...document.getElementById('TablaVariantes').rows];
        for (let fila of filas) {
            const idVar = fila.querySelector('.EliminarVariante').dataset.id;
            const datos = {
                ID_Producto: idProd,
                Nombre_Variante: fila.querySelector('input[name="Nombre_Variante"]').value,
                SKU: fila.querySelector('input[name="SKU"]').value,
                Precio: parseFloat(fila.querySelector('input[name="Precio"]').value) || 0,
                Activo: 1
            };
            if (idVar) {
                await fetch(`${baseUrl}/api/admin/variantes/${idVar}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(datos) });
            } else {
                await fetch(`${baseUrl}/api/admin/variantes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(datos) });
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
        const { datos } = await (await fetch(`${baseUrl}/api/imagenes/producto/${idProd}`, { headers: authHeader() })).json();
        const tbody = document.getElementById('TablaImagenes'); tbody.innerHTML = '';
        datos.forEach(img => {
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
        const tbody = document.getElementById('TablaImagenes');
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
    document.getElementById('BtnNuevaImagen').onclick = agregarFilaImagen;
    async function procesarImagenes(idProd) {
        const filas = [...document.getElementById('TablaImagenes').rows];
        for (let fila of filas) {
            const idImg = fila.querySelector('.EliminarImagen').dataset.id;
            const datos = {
                ID_Producto: idProd,
                URL: fila.querySelector('input[name="URL"]').value,
                Alt: fila.querySelector('input[name="Alt"]').value,
                Orden: parseInt(fila.querySelector('input[name="Orden"]').value, 10) || 0,
                Predeterminada: fila.querySelector('input[name="Predeterminada"]').checked ? 1 : 0
            };
            if (idImg) {
                await fetch(`${baseUrl}/api/admin/imagenes/${idImg}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(datos) });
            } else {
                await fetch(`${baseUrl}/api/admin/imagenes`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(datos) });
            }
        }
    }
    async function eliminarImagen(id) {
        if (!confirm('¿Eliminar imagen?')) return;
        await fetch(`${baseUrl}/api/admin/imagenes/${id}`, { method: 'DELETE', headers: authHeader() });
        await cargarImagenes(idProductoActual);
    }

    // Reset modal producto
    function ResetearModalProducto() {
        // localiza el formulario en el DOM
        const form = document.getElementById('FormProducto');
        if (form) {
            form.reset();
        } else {
            console.warn('ResetearModalProducto: no se encontró #FormProducto');
        }

        // limpia las tablas (estos IDs sí deben existir)
        const tv = document.getElementById('TablaVariantes');
        const ti = document.getElementById('TablaImagenes');
        if (tv) tv.innerHTML = '';
        if (ti) ti.innerHTML = '';
        // si tienes data-id en botones, límpialos también:
        document.querySelectorAll('.EliminarVariante, .EliminarImagen')
            .forEach(b => delete b.dataset.id);
    }
});