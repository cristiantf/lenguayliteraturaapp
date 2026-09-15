/**
 * Lengua y Literatura 9no EGB - Controlador de Modal de Módulos Curriculares
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Renderiza dinámicamente el contenido de las unidades desde MODULES_DATA,
 * mostrando las 5 secciones temáticas (Lengua y Cultura, Comunicación Oral,
 * Lectura, Escritura, Literatura) con contenido completo.
 */

function initModuleDetailsModal() {
    const modal = document.getElementById('module-modal');
    const closeBtn = document.getElementById('modal-close');
    const openBtns = document.querySelectorAll('.js-open-module');

    if (!modal) return;

    openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleId = btn.getAttribute('data-module-id');
            const data = (window.MODULES_DATA && window.MODULES_DATA[moduleId]) ? window.MODULES_DATA[moduleId] : null;
            if (data) {
                renderModuleModalContent(data);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

function renderModuleModalContent(data) {
    const titleEl = document.getElementById('modal-title');
    const badgeEl = document.getElementById('modal-badge');
    const bodyEl = document.getElementById('modal-body-content');

    if (titleEl) titleEl.textContent = data.title;
    if (badgeEl) badgeEl.textContent = data.badge;

    if (bodyEl) {
        let html = `<p class="modal-desc">${data.description}</p>`;

        // Proyecto literario sugerido
        if (data.project) {
            html += `
                <div style="background: var(--bg-elevated, #f0fdf4); border-left: 4px solid var(--accent-emerald, #10b981); padding: 1rem 1.25rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <strong style="color: var(--accent-emerald, #047857); display: block; margin-bottom: 0.35rem;">📝 Proyecto Literario Sugerido:</strong>
                    <span style="font-size: 0.9rem; color: var(--text-main);">${data.project}</span>
                </div>
            `;
        }

        // Secciones temáticas (5 bloques por unidad)
        if (data.sections && data.sections.length > 0) {
            html += `<h4 style="margin-top: 1rem; margin-bottom: 1rem; color: var(--primary); font-weight:700;">Secciones Temáticas:</h4>`;
            data.sections.forEach(section => {
                html += `
                    <div class="content-block-item" style="margin-bottom: 1.25rem; padding: 1rem 1.25rem; border-radius: 10px; background: var(--bg-elevated, #f8fafc); border: 1px solid var(--border, #e2e8f0);">
                        <h5 style="font-weight: 700; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.25rem;">${section.icon}</span>
                            ${section.title}
                        </h5>
                        <p style="font-size: 0.9rem; color: var(--text-main); margin-bottom: 0.75rem;">${section.content}</p>
                `;

                // Idea clave
                if (section.keyIdea) {
                    html += `
                        <div style="background: var(--bg-main, #fffbeb); border-left: 3px solid var(--accent-amber, #f59e0b); padding: 0.6rem 0.9rem; border-radius: 6px; margin-bottom: 0.75rem;">
                            <strong style="font-size: 0.8rem; color: var(--accent-amber, #d97706);">💡 Idea Clave:</strong>
                            <span style="font-size: 0.85rem; display: block; margin-top: 0.2rem;">${section.keyIdea}</span>
                        </div>
                    `;
                }

                // Temas
                if (section.topics && section.topics.length > 0) {
                    html += `<ul style="margin-left: 1rem; font-size: 0.875rem;">`;
                    section.topics.forEach(t => {
                        html += `<li style="margin-bottom: 0.3rem;">${t}</li>`;
                    });
                    html += `</ul>`;
                }

                html += `</div>`;
            });
        }

        bodyEl.innerHTML = html;
    }
}

// Exportación global y modular
if (typeof window !== 'undefined') {
    window.initModuleDetailsModal = initModuleDetailsModal;
    window.renderModuleModalContent = renderModuleModalContent;
}
