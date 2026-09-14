const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? ''
    : 'https://licoreria-la-ultima-ronda.onrender.com';

console.log("Inicializando scripts de login con delegación global...");

// Función unificada para configurar eventos del modal
window.Configurar_Eventos_Modal = function () {
    const Modal = document.getElementById('Modal_Login') || document.getElementById('Registro_Modal');
    if (!Modal) return;

    // 1) Cerrar modal al hacer clic fuera
    window.addEventListener('click', e => {
        if (e.target === Modal) Modal.classList.remove('show');
    });

    // 2) Botón de cierre interno
    const btnCerrar = Modal.querySelector('.Cerrar_Modal');
    if (btnCerrar) btnCerrar.addEventListener('click', () => Modal.classList.remove('show'));
};

// Delegación global de submit para Login y Registro
document.addEventListener('submit', async function (e) {
    const form = e.target;

    // 1. INICIO DE SESIÓN
    if (form && (form.id === 'Formulario_Inicio_Sesión' || form.closest('.Inicio_Sesión'))) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📌 Procesando envío de Inicio de Sesión...');

        const userInput = form.querySelector('input[name="Usuario"], input[name="Correo_Electrónico"], input[type="email"], input[type="text"]');
        const passInput = form.querySelector('input[name="Contraseña"], input[type="password"]');

        const Correo = userInput ? userInput.value.trim() : '';
        const Contraseña = passInput ? passInput.value : '';

        if (!Correo || !Contraseña) {
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('Por favor ingrese correo y contraseña', 'Error');
            } else {
                alert('Por favor ingrese correo y contraseña');
            }
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');
        const txtOriginal = btnSubmit ? btnSubmit.textContent : '';
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Iniciando sesión...';
        }

        try {
            console.log('Enviando credenciales a:', `${API_BASE}/api/Usuarios/Login`);
            const resp = await fetch(`${API_BASE}/api/Usuarios/Login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Correo_Electrónico: Correo, Contraseña: Contraseña })
            });
            const json = await resp.json();
            console.log('Respuesta del servidor:', json);

            if (!json.Éxito || !json.Token) {
                throw new Error(json.Mensaje || 'Credenciales inválidas');
            }

            // Guardar token
            localStorage.setItem('Token', json.Token);
            window.tuJwt = json.Token;

            // Cerrar modal
            const Modal = document.getElementById('Modal_Login') || document.getElementById('Registro_Modal');
            if (Modal) Modal.classList.remove('show');

            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('¡Sesión iniciada con éxito! ✅', 'Éxito');
            }

            try {
                if (typeof window.actualizarUsuarioLogueado === 'function') {
                    await window.actualizarUsuarioLogueado();
                }
            } catch (err) {
                console.warn('Advertencia en actualizarUsuarioLogueado():', err);
            }

            setTimeout(() => {
                window.location.reload();
            }, 300);
        } catch (err) {
            console.error('Error al iniciar sesión:', err);
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación(err.message || 'Error al iniciar sesión', 'Error');
            } else {
                alert(err.message || 'Error al iniciar sesión');
            }
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = txtOriginal || 'Iniciar Sesión';
            }
        }
        return;
    }

    // 2. REGISTRO
    if (form && (form.id === 'Formulario_Registro' || form.closest('.Registro'))) {
        e.preventDefault();
        e.stopPropagation();
        console.log('📌 Procesando envío de Registro...');

        const nombreInput = form.querySelector('#Nombre_Completo') || form.querySelector('input[placeholder*="Nombre"]');
        const correoInput = form.querySelector('#Correo_Electrónico') || form.querySelector('input[type="email"]');
        const passInput = form.querySelector('#Contraseña') || form.querySelector('input[type="password"]');

        const Nombre_Completo = nombreInput ? nombreInput.value.trim() : '';
        const Correo_Electrónico = correoInput ? correoInput.value.trim() : '';
        const Contraseña = passInput ? passInput.value : '';

        if (!Nombre_Completo || !Correo_Electrónico || !Contraseña) {
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('Por favor complete todos los campos requeridos', 'Error');
            }
            return;
        }

        const btnSubmit = form.querySelector('button[type="submit"]');
        const txtOriginal = btnSubmit ? btnSubmit.textContent : '';
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = 'Registrando...';
        }

        try {
            const resp = await fetch(`${API_BASE}/api/Usuarios/Registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Nombre_Completo, Correo_Electrónico, Contraseña })
            });
            const json = await resp.json();
            if (!json.Éxito) {
                throw new Error(json.Mensaje || 'Error al registrar');
            }

            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación('¡Registro exitoso! Iniciando sesión...', 'Éxito');
            }

            // Intentar auto-login inmediato
            try {
                const loginResp = await fetch(`${API_BASE}/api/Usuarios/Login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Correo_Electrónico, Contraseña })
                });
                const loginJson = await loginResp.json();
                if (loginJson.Éxito && loginJson.Token) {
                    localStorage.setItem('Token', loginJson.Token);
                    window.tuJwt = loginJson.Token;
                    setTimeout(() => {
                        window.location.reload();
                    }, 400);
                    return;
                }
            } catch (e) {
                console.warn('Auto-login:', e);
            }

            // Si no auto-login, cambiar a pestaña de login
            const Modal = document.getElementById('Modal_Login') || document.getElementById('Registro_Modal');
            if (Modal) {
                const interruptor = Modal.querySelector('#Interruptor_Login');
                if (interruptor) interruptor.checked = true;
                const inputUser = Modal.querySelector('.Inicio_Sesión input[name="Usuario"]');
                if (inputUser) inputUser.value = Correo_Electrónico;
            }
        } catch (err) {
            console.error('Error en registro:', err);
            if (typeof Mostrar_Notificación === 'function') {
                Mostrar_Notificación(err.message || 'Error al registrar usuario', 'Error');
            } else {
                alert(err.message || 'Error al registrar usuario');
            }
        } finally {
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = txtOriginal || 'Registrarse';
            }
        }
    }
});

// Configurar modal si ya existe en DOM
document.addEventListener('DOMContentLoaded', () => {
    window.Configurar_Eventos_Modal();
});
if (document.readyState !== 'loading') {
    window.Configurar_Eventos_Modal();
}