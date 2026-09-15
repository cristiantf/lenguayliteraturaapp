/**
 * Lengua y Literatura 9no EGB - Sistema de Notificaciones
 * Polling cada 30 segundos para actualizar badges y dropdown.
 */

const Notifications = {
    API_BASE: '/api/notifications',
    pollInterval: null,

    async init() {
        await this.loadCount();
        await this.loadList();
        
        // Polling cada 30s
        this.pollInterval = setInterval(() => this.loadCount(), 30000);

        // Mark all como leída
        const markAllBtn = document.getElementById('notif-mark-all');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => this.markAllRead());
        }
    },

    async loadCount() {
        try {
            const res = await fetch(`${this.API_BASE}/count.php`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                this.updateBadge(data.unread);
            }
        } catch (e) { /* silenciar */ }
    },

    updateBadge(count) {
        const badge = document.getElementById('notif-count');
        const sidebarBadge = document.getElementById('sidebar-notif-count');
        
        [badge, sidebarBadge].forEach(el => {
            if (el) {
                el.textContent = count;
                el.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    },

    async loadList() {
        const container = document.getElementById('notif-list');
        if (!container) return;

        try {
            const res = await fetch(`${this.API_BASE}/list.php?limit=15`, { credentials: 'include' });
            const data = await res.json();
            
            if (data.success && data.notifications.length > 0) {
                const icons = {
                    'nueva_actividad': '📋',
                    'entrega_pendiente': '📥',
                    'actividad_calificada': '✅'
                };

                container.innerHTML = data.notifications.map(n => {
                    const timeAgo = this.timeAgo(n.created_at);
                    return `
                        <div class="notif-item ${n.leida ? '' : 'unread'}" data-id="${n.id}" onclick="Notifications.markRead(${n.id}, '${n.enlace || ''}')">
                            <span class="notif-icon">${icons[n.tipo] || '🔔'}</span>
                            <div class="notif-body">
                                <div class="notif-title">${n.titulo}</div>
                                <div class="notif-text">${n.mensaje}</div>
                                <div class="notif-time">${timeAgo}</div>
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                container.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">🔕 Sin notificaciones</div>';
            }
        } catch (e) {
            container.innerHTML = '<div style="padding:2rem; text-align:center; color:var(--text-muted);">Error al cargar</div>';
        }
    },

    async markRead(id, enlace) {
        try {
            await fetch(`${this.API_BASE}/read.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id })
            });
            await this.loadCount();
            await this.loadList();
            
            if (enlace) window.location.href = '/' + enlace;
        } catch (e) { /* silenciar */ }
    },

    async markAllRead() {
        try {
            await fetch(`${this.API_BASE}/read.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ all: true })
            });
            await this.loadCount();
            await this.loadList();
        } catch (e) { /* silenciar */ }
    },

    timeAgo(dateStr) {
        const date = new Date(dateStr);
        const now  = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60)   return 'Hace un momento';
        if (diff < 3600)  return `Hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
        if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} día(s)`;
        return date.toLocaleDateString('es-EC');
    },

    destroy() {
        if (this.pollInterval) clearInterval(this.pollInterval);
    }
};

if (typeof window !== 'undefined') {
    window.Notifications = Notifications;
}
