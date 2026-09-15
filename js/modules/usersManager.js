/**
 * Lengua y Literatura 9no EGB - Gestor de Usuarios (Admin)
 * Permite crear, listar, actualizar y eliminar docentes y estudiantes con paginación.
 */

const UsersManager = {
    API_BASE: '/api/users',
    users: [],
    currentFilter: 'all',
    searchQuery: '',
    currentPage: 1,
    pageSize: 5,

    async init() {
        await this.loadUsers();
        this.bindEvents();
    },

    bindEvents() {
        // Búsqueda
        const searchInput = document.getElementById('search-users');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.currentPage = 1;
                this.renderUsers();
            });
        }

        // Filtro por rol
        const roleFilter = document.getElementById('filter-role');
        if (roleFilter) {
            roleFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.currentPage = 1;
                this.renderUsers();
            });
        }

        // Formulario modal de usuario
        const userForm = document.getElementById('user-form');
        if (userForm) {
            userForm.addEventListener('submit', (e) => this.handleSave(e));
        }

        // Botón nuevo usuario
        const btnNew = document.getElementById('btn-new-user');
        if (btnNew) {
            btnNew.addEventListener('click', () => this.openModal());
        }
    },

    async loadUsers() {
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando usuarios...</td></tr>`;
        }

        try {
            const res = await fetch(`${this.API_BASE}/list.php`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                this.users = data.users || [];
                this.renderUsers();
                this.updateStats();
            } else {
                Toast.show(data.error || 'Error al cargar usuarios', 'error');
            }
        } catch (err) {
            console.error('Error cargando usuarios:', err);
            Toast.show('Error de conexión al cargar usuarios', 'error');
        }
    },

    renderUsers() {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        let filtered = this.users.filter(u => {
            const matchRole = this.currentFilter === 'all' || u.rol === this.currentFilter;
            const fullName = `${u.nombre} ${u.apellido}`.toLowerCase();
            const matchSearch = !this.searchQuery || 
                                fullName.includes(this.searchQuery) || 
                                (u.email && u.email.toLowerCase().includes(this.searchQuery));
            return matchRole && matchSearch;
        });

        const totalItems = filtered.length;
        const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pageItems = filtered.slice(startIndex, startIndex + this.pageSize);

        if (pageItems.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No se encontraron usuarios</td></tr>`;
            this.renderPagination(0, 1);
            return;
        }

        const roleBadges = {
            'admin': '<span class="badge" style="background:#6366f1; color:#fff;">Administrador</span>',
            'docente': '<span class="badge" style="background:#10b981; color:#fff;">Docente</span>',
            'estudiante': '<span class="badge" style="background:#3b82f6; color:#fff;">Estudiante</span>'
        };

        tableBody.innerHTML = pageItems.map(u => `
            <tr>
                <td><strong>#${u.id}</strong></td>
                <td>
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <div class="user-avatar" style="width:34px; height:34px; font-size:0.9rem;">
                            ${(u.nombre || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style="font-weight:600; color:var(--text-color);">${this.escape(u.nombre)} ${this.escape(u.apellido)}</div>
                            <small style="color:var(--text-muted);">${this.escape(u.email)}</small>
                        </div>
                    </div>
                </td>
                <td>${roleBadges[u.rol] || u.rol}</td>
                <td>
                    <span class="badge ${u.activo ? 'badge-success' : 'badge-warning'}" style="background:${u.activo ? '#dcfce7; color:#15803d' : '#fee2e2; color:#b91c1c'}; font-size:0.75rem;">
                        ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td style="font-size:0.85rem; color:var(--text-muted);">
                    ${u.created_at ? new Date(u.created_at).toLocaleDateString() : (u.creado_en ? new Date(u.creado_en).toLocaleDateString() : '—')}
                </td>
                <td style="text-align:right;">
                    <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                        <button class="btn btn-sm btn-outline-primary" onclick="UsersManager.openModal(${u.id})" title="Editar">
                            ✏️ Editar
                        </button>
                        ${u.rol !== 'admin' ? `
                            <button class="btn btn-sm btn-outline-danger" onclick="UsersManager.confirmDelete(${u.id}, '${this.escape(u.nombre)}')" title="Eliminar">
                                🗑️
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `).join('');

        this.renderPagination(totalItems, totalPages);
    },

    renderPagination(totalItems, totalPages) {
        let container = document.getElementById('users-pagination');
        if (!container) {
            const tableCard = document.querySelector('.card .table-responsive')?.parentElement;
            if (tableCard) {
                container = document.createElement('div');
                container.id = 'users-pagination';
                tableCard.appendChild(container);
            } else return;
        }

        if (totalItems === 0) {
            container.innerHTML = '';
            return;
        }

        const start = (this.currentPage - 1) * this.pageSize + 1;
        const end = Math.min(this.currentPage * this.pageSize, totalItems);

        let paginationHtml = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem; font-size:0.875rem;">
                <div style="color:var(--text-muted);">
                    Mostrando <strong>${start}-${end}</strong> de <strong>${totalItems}</strong> usuarios
                </div>
                <div style="display:flex; align-items:center; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline-secondary" ${this.currentPage <= 1 ? 'disabled' : ''} onclick="UsersManager.goToPage(${this.currentPage - 1})">
                        ◀ Anterior
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHtml += `
                    <button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="UsersManager.goToPage(${i})" style="min-width:32px;">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHtml += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
            }
        }

        paginationHtml += `
                    <button class="btn btn-sm btn-outline-secondary" ${this.currentPage >= totalPages ? 'disabled' : ''} onclick="UsersManager.goToPage(${this.currentPage + 1})">
                        Siguiente ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = paginationHtml;
    },

    goToPage(page) {
        this.currentPage = page;
        this.renderUsers();
    },

    updateStats() {
        const totalElem = document.getElementById('stat-total-users');
        const docentesElem = document.getElementById('stat-docentes');
        const estudiantesElem = document.getElementById('stat-estudiantes');

        if (totalElem) totalElem.textContent = this.users.length;
        if (docentesElem) docentesElem.textContent = this.users.filter(u => u.rol === 'docente').length;
        if (estudiantesElem) estudiantesElem.textContent = this.users.filter(u => u.rol === 'estudiante').length;
    },

    openModal(userId = null) {
        const modalElem = document.getElementById('userModal');
        if (!modalElem) return;

        const form = document.getElementById('user-form');
        form.reset();

        const title = document.getElementById('userModalLabel');
        const idInput = document.getElementById('user-id');
        const pwdHelp = document.getElementById('pwd-help');

        if (userId) {
            const user = this.users.find(u => u.id == userId);
            if (!user) return;

            title.textContent = 'Editar Usuario';
            idInput.value = user.id;
            document.getElementById('user-nombre').value = user.nombre || '';
            document.getElementById('user-apellido').value = user.apellido || '';
            document.getElementById('user-email').value = user.email || '';
            document.getElementById('user-rol').value = user.rol || 'estudiante';
            document.getElementById('user-password').value = '';
            document.getElementById('user-password').required = false;
            if (pwdHelp) pwdHelp.textContent = '(Dejar en blanco para mantener la contraseña actual)';
        } else {
            title.textContent = 'Crear Nuevo Usuario';
            idInput.value = '';
            document.getElementById('user-password').required = true;
            if (pwdHelp) pwdHelp.textContent = '(Mínimo 6 caracteres)';
        }

        const modal = new bootstrap.Modal(modalElem);
        modal.show();
    },

    async handleSave(e) {
        e.preventDefault();
        const id = document.getElementById('user-id').value;
        const nombre = document.getElementById('user-nombre').value.trim();
        const apellido = document.getElementById('user-apellido').value.trim();
        const email = document.getElementById('user-email').value.trim();
        const rol = document.getElementById('user-rol').value;
        const password = document.getElementById('user-password').value;

        const isEdit = !!id;
        const url = isEdit ? `${this.API_BASE}/update.php` : `${this.API_BASE}/create.php`;

        const payload = { nombre, apellido, email, rol };
        if (isEdit) payload.id = id;
        if (password) payload.password = password;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                Toast.show(isEdit ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 'success');
                const modalElem = document.getElementById('userModal');
                const modal = bootstrap.Modal.getInstance(modalElem);
                if (modal) modal.hide();
                await this.loadUsers();
            } else {
                Toast.show(data.error || 'Error al guardar usuario', 'error');
            }
        } catch (err) {
            console.error('Error guardando usuario:', err);
            Toast.show('Error de conexión', 'error');
        }
    },

    async confirmDelete(id, name) {
        if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const res = await fetch(`${this.API_BASE}/delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id })
            });
            const data = await res.json();

            if (data.success) {
                Toast.show('Usuario eliminado correctamente', 'success');
                await this.loadUsers();
            } else {
                Toast.show(data.error || 'No se pudo eliminar el usuario', 'error');
            }
        } catch (err) {
            console.error('Error eliminando usuario:', err);
            Toast.show('Error al intentar eliminar', 'error');
        }
    },

    escape(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
};

window.UsersManager = UsersManager;
