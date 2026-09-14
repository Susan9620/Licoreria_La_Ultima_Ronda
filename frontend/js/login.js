const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://licoreria-la-ultima-ronda.onrender.com';

document.addEventListener('DOMContentLoaded', function () {
    console.log("Inicializando scripts de login...");

    // Función unificada para configurar eventos del modal
    window.Configurar_Eventos_Modal = function () {
        console.log("Configurando eventos del modal...");
        const Modal = document.getElementById('Modal_Login') || document.getElementById('Registro_Modal');
        if (!Modal) return;

        // 1) Cerrar modal al hacer clic fuera
        window.addEventListener('click', e => {
            if (e.target === Modal) Modal.classList.remove('show');
        });

        // 2) Botón de cierre interno
        const btnCerrar = Modal.querySelector('.Cerrar_Modal');
        if (btnCerrar) btnCerrar.addEventListener('click', () => Modal.classList.remove('show'));

        // 3) Formulario de registro dentro del modal
        const formReg = Modal.querySelector('#Formulario_Registro');
        if (formReg) {
            formReg.addEventListener('submit', async e => {
                e.preventDefault();
                // extrae valores
                const Nombre_Completo = Modal.querySelector('#Nombre_Completo').value.trim();
                const Correo_Electrónico = Modal.querySelector('#Correo_Electrónico').value.trim();
                const Contraseña = Modal.querySelector('#Contraseña').value;
                try {
                    const resp = await fetch(`${API_BASE}/api/Usuarios/Registro`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ Nombre_Completo, Correo_Electrónico, Contraseña })
                    });
                    const json = await resp.json();
                    if (!json.Éxito) throw new Error(json.Mensaje);
                    Mostrar_Notificación('Usuario registrado ✅', 'Éxito');
                    // pasar a login
                    Modal.querySelector('#Interruptor_Login').checked = true;
                    setTimeout(() => {
                        const inputUser = Modal.querySelector('.Inicio_Sesión input[name="Usuario"]');
                        if (inputUser) inputUser.value = Correo_Electrónico;
                        Modal.querySelector('.Inicio_Sesión input[name="Contraseña"]').focus();
                    }, 700);
                } catch (err) {
                    console.error(err);
                    Mostrar_Notificación(err.message || 'Error al registrar', 'Error');
                }
            });
        }

        // 4) Formulario de login dentro del modal
        const formLogin = Modal.querySelector('#Formulario_Inicio_Sesión');
        if (formLogin) {
            formLogin.addEventListener('submit', async e => {
                e.preventDefault();
                const Correo = formLogin.querySelector('input[name="Usuario"], input[name="Correo_Electrónico"]').value;
                const Contraseña = formLogin.querySelector('input[name="Contraseña"]').value;
                try {
                    const resp = await fetch(`${API_BASE}/api/Usuarios/Login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ Correo_Electrónico: Correo, Contraseña: Contraseña })
                    });
                    const json = await resp.json();
                    if (!json.Éxito) throw new Error(json.Mensaje);
                    console.log("Respuesta del login:", json);
                    localStorage.setItem('Token', json.Token);
                    console.log("Token guardado en localStorage:", localStorage.getItem('Token'));
                    window.tuJwt = json.Token;
                    Modal.classList.remove('show');
                    Mostrar_Notificación('Sesión iniciada ✅', 'Éxito');
                    try {
                        if (typeof window.actualizarUsuarioLogueado === 'function') {
                            await window.actualizarUsuarioLogueado();
                        }
                    } catch (err) {
                        console.warn('Advertencia en actualizarUsuarioLogueado():', err);
                    }
                    setTimeout(() => {
                        window.location.reload();
                    }, 400);
                } catch (err) {
                    console.error('Login fallido:', err);
                    Mostrar_Notificación(err.message || 'Error al iniciar sesión', 'Error');
                }
            });
        }
    };

    // Cuando agregues el modal dinámicamente, asegúrate de llamar:
    // Configurar_Eventos_Modal();

    // Ejecutar Configurar_Eventos_Modal si el modal ya está presente
    const Modal_Existente = document.getElementById('Modal_Login') || document.getElementById('Registro_Modal');
    if (Modal_Existente) {
        console.log("Modal presente en el DOM, configurando eventos...");
        Configurar_Eventos_Modal();
    } else {
        console.log("Modal no encontrado en carga inicial");
    }
});

// Si el DOM ya está cargado, se ejecuta inmediatamente
if (document.readyState !== 'loading') {
    console.log("DOM cargado, inicializando scripts de login...");
    const Evento = new Event('DOMContentLoaded');
    document.dispatchEvent(Evento);
}