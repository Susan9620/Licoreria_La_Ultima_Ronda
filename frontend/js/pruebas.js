document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('AdminSectionSelect');
  const content = document.getElementById('AdminContent');

  // Referencias del modal
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

  // Helper para inyectar el JWT en headers
  function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  // Carga inicial + cambio de sección
  async function loadSection(sect) {
    content.innerHTML = '';
    switch (sect) {
      case 'pedidos':
        await renderPedidos();
        break;
      case 'productos':
        await renderProductos();
        break;
      // ...otras secciones
    }
  }
  select.addEventListener('change', () => loadSection(select.value));
  loadSection(select.value);

  // Renderizar la tabla de pedidos
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
              <td>$${parseFloat(p.total).toFixed(2)}</td>
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

  // Abrir modal con detalle y formulario de estado
  window.viewPedido = async (id) => {
    try {
      const resp = await fetch(`${baseUrl}/api/admin/pedidos/${id}`, {
        headers: authHeader()
      });
      const json = await resp.json();
      if (!resp.ok || !json.éxito) throw new Error(json.mensaje);

      // Destructura pedido e items de la respuesta
      const { pedido, items } = json.datos;
      console.log('🛒 Detalle de items:', items);
      // Rellena el modal con los campos correctos
      modalID.textContent = pedido.idPedido;
      detUsuario.textContent = pedido.idUsuario;               // o pedido.usuarioId según tu modelo
      detFecha.textContent = new Date(pedido.fecha).toLocaleString();
      detTotal.textContent = parseFloat(pedido.total).toFixed(2);
      detEstado.value = pedido.estadoPedido;

      // Rellena la tabla de productos
      detProductos.innerHTML = items.map(item => {
        // si existe nombreVariante, lo concatenamos
        const nombre = item.nombreVariante
          ? `${item.nombreProducto} – ${item.nombreVariante}`
          : item.nombreProducto;

        const precio = parseFloat(item.precioUnitario) || 0;
        return `
          <tr>
            <td>${nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${precio.toFixed(2)}</td>
          </tr>
        `;
      }).join('');

      modal.classList.remove('Oculto');
    } catch (e) {
      Mostrar_Notificación('No se pudo cargar detalle: ' + e.message, 'Error');
    }
  };

  // Guardar nuevo estado (usa la ruta /pedidos/:id/estado y la propiedad nuevoEstado)
  btnGuardar?.addEventListener('click', async () => {
    const id = modalID.textContent;
    const nuevoEstado = detEstado.value;

    try {
      const resp = await fetch(`${baseUrl}/api/admin/pedidos/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader()
        },
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

  // Cerrar modal sin guardar
  cerrarModal?.addEventListener('click', () => modal.classList.add('Oculto'));
  btnCancelar?.addEventListener('click', () => modal.classList.add('Oculto'));

  async function renderProductos() {
    content.innerHTML = '<p>Cargando productos…</p>';
    try {
      // uso de la ruta pública para leer
      const resp = await fetch(`${baseUrl}/api/productos/all`, { headers: authHeader() });
      const json = await resp.json();
      if (!resp.ok || !json.éxito) throw new Error(json.mensaje);

      const table = document.createElement('table');
      table.className = 'Tabla_Admin';
      table.innerHTML = `
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Variante</th><th>Precio</th><th>Stock</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${json.datos.map(p => `
            <tr>
              <td>${p.ID_Producto}</td>
              <td>${p.Nombre}</td>
              <td>${p.Nombre_Variante}</td>
              <td>$${parseFloat(p.Precio).toFixed(2)}</td>
              <td>${p.Stock}</td>
              <td>
                <button class="Botones Botón_Primario" onclick="editProducto(${p.ID_Producto})">Editar</button>
                <button class="Botones Botón_Peligro" onclick="deleteProducto(${p.ID_Producto})">Eliminar</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      `;
      content.innerHTML = '';
      content.appendChild(table);

    } catch (e) {
      content.innerHTML = `<p>Error al cargar productos: ${e.message}</p>`;
    }
  }

  window.editProducto = async (id) => {
    const modalP = document.getElementById('ModalProducto');
    const spanID = document.getElementById('ModalProductoID');
    const inpNombre = document.getElementById('Prod_Nombre');
    const inpVariante = document.getElementById('Prod_Variante');
    const inpPrecio = document.getElementById('Prod_Precio');
    const inpStock = document.getElementById('Prod_Stock');

    // 1) obtener datos
    const resp = await fetch(`${baseUrl}/api/productos/${id}`, { headers: authHeader() });
    const json = await resp.json();
    if (!resp.ok) return Mostrar_Notificación('Error cargando producto', 'Error');

    // 2) rellenar form
    spanID.textContent = id;
    const p = json.datos;
    inpNombre.value = p.Nombre;
    inpVariante.value = p.Nombre_Variante;
    inpPrecio.value = p.Precio;
    inpStock.value = p.Stock;

    modalP.classList.remove('Oculto');
  };

  // cancel/close
  document.getElementById('CerrarModalProducto').addEventListener('click', () =>
    document.getElementById('ModalProducto').classList.add('Oculto')
  );
  document.getElementById('BtnCancelarProducto').addEventListener('click', () =>
    document.getElementById('ModalProducto').classList.add('Oculto')
  );

  // guardar cambios
  document.getElementById('BtnGuardarProducto').addEventListener('click', async () => {
    const id = document.getElementById('ModalProductoID').textContent;
    const datos = {
      Nombre: document.getElementById('Prod_Nombre').value,
      // mapea los demás campos a las propiedades que acepte tu API
      Precio: parseFloat(document.getElementById('Prod_Precio').value),
      Stock: parseInt(document.getElementById('Prod_Stock').value, 10)
    };
    const resp = await fetch(`${baseUrl}/api/admin/productos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify(datos)
    });
    const json = await resp.json();
    if (resp.ok && json.éxito) {
      Mostrar_Notificación('Producto actualizado', 'Éxito');
      document.getElementById('ModalProducto').classList.add('Oculto');
      await renderProductos();
    } else {
      Mostrar_Notificación(json.mensaje, 'Error');
    }
  });
});