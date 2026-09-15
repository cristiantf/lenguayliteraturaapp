/**
 * Lengua y Literatura 9no EGB - Módulo de Autenticación
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Maneja login, logout, verificación de sesión y redirección por rol.
 */

const Auth = {
    API_BASE: '/api/auth',

    /**
     * Inicia sesión con email y contraseña.
     */
    async login(email, password) {
        try {
            const res = await fetch(`${this.API_BASE}/login.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user, redirect: data.redirect };
            } else {
                return { success: false, error: data.error || 'Error de autenticación' };
            }
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Error de conexión con el servidor.' };
        }
    },

    /**
     * Cierra la sesión actual.
     */
    async logout() {
        try {
            await fetch(`${this.API_BASE}/logout.php`, {
                method: 'POST',
                credentials: 'include'
            });
        } catch (err) {
            console.error('Logout error:', err);
        }
        
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    },

    /**
     * Verifica si hay sesión activa. Usado en dashboards protegidos.
     */
    async check() {
        try {
            const res = await fetch(`${this.API_BASE}/check.php`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();
            
            if (data.success && data.authenticated) {
                localStorage.setItem('user', JSON.stringify(data.user));
                return data.user;
            } else {
                localStorage.removeItem('user');
                return null;
            }
        } catch (err) {
            console.error('Auth check error:', err);
            return null;
        }
    },

    /**
     * Obtiene el usuario actual desde localStorage.
     */
    getUser() {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    },

    /**
     * Protege una página de dashboard. Si no hay sesión, redirige a login.
     * @param {string|string[]} allowedRoles - Roles permitidos
     */
    async guard(allowedRoles) {
        const user = await this.check();
        
        if (!user) {
            window.location.href = '/login.html';
            return null;
        }
        
        if (typeof allowedRoles === 'string') allowedRoles = [allowedRoles];
        
        if (!allowedRoles.includes(user.rol)) {
            window.location.href = `/dashboard/${user.rol}/`;
            return null;
        }
        
        return user;
    },

    /**
     * Renderiza la info del usuario en el header del dashboard.
     */
    renderUserInfo(user) {
        const nameEl = document.getElementById('user-display-name');
        const roleEl = document.getElementById('user-display-role');
        const avatarEl = document.getElementById('user-avatar-letter');
        
        if (nameEl) nameEl.textContent = `${user.nombre} ${user.apellido}`;
        if (roleEl) {
            const roleNames = { admin: 'Administrador', docente: 'Docente', estudiante: 'Estudiante' };
            roleEl.textContent = roleNames[user.rol] || user.rol;
        }
        if (avatarEl) avatarEl.textContent = user.nombre.charAt(0).toUpperCase();
        
        // Botón de logout
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    },

    /**
     * Alias de guard para compatibilidad
     */
    async requireRole(allowedRoles) {
        return await this.guard(allowedRoles);
    }
};

// Exportación global
if (typeof window !== 'undefined') {
    window.Auth = Auth;
}
