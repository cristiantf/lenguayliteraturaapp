/**
 * Lengua y Literatura 9no EGB - Renderizador Dinámico de Fichas de Conceptos
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Genera dinámicamente las tarjetas 3D (flashcards) desde FLASHCARDS_DATA,
 * con navegación por pestañas para filtrar por unidad.
 */

function initFlashcardsRenderer() {
    const container = document.getElementById('flashcards-dynamic-container');
    const tabsContainer = document.getElementById('flashcards-unit-tabs');
    if (!container || typeof FLASHCARDS_DATA === 'undefined') return;

    // Obtener unidades disponibles
    const units = [...new Set(FLASHCARDS_DATA.map(f => f.unit))].sort();

    // Renderizar tabs
    if (tabsContainer) {
        let tabsHtml = `<button class="flashcard-tab active" data-unit="all">📚 Todas (${FLASHCARDS_DATA.length})</button>`;
        const unitNames = {
            1: '✍️ U1 — La aventura de escribir',
            2: '📰 U2 — Contar lo que pasa',
            3: '🔬 U3 — El lenguaje de la ciencia',
            4: '💬 U4 — Opinar y crear'
        };
        units.forEach(u => {
            const count = FLASHCARDS_DATA.filter(f => f.unit === u).length;
            tabsHtml += `<button class="flashcard-tab" data-unit="${u}">${unitNames[u] || 'Unidad ' + u} (${count})</button>`;
        });
        tabsContainer.innerHTML = tabsHtml;

        // Event listeners para tabs
        tabsContainer.querySelectorAll('.flashcard-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.flashcard-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderCards(tab.getAttribute('data-unit'));
            });
        });
    }

    // Renderizar tarjetas
    function renderCards(unitFilter) {
        let cards = FLASHCARDS_DATA;
        if (unitFilter !== 'all') {
            cards = FLASHCARDS_DATA.filter(f => f.unit === parseInt(unitFilter));
        }

        let html = '';
        cards.forEach(card => {
            html += `
                <div class="flashcard" tabindex="0" role="button" aria-label="Ficha de concepto: ${card.term}. Presiona para voltear.">
                    <div class="flashcard-inner">
                        <div class="flashcard-front">
                            <span class="card-icon">${card.icon}</span>
                            <h2>${card.term}</h2>
                            <p>Toca para voltear 🔄</p>
                            <span class="badge badge-primary" style="font-size: 0.7rem; margin-top: 0.5rem;">Unidad ${card.unit}</span>
                        </div>
                        <div class="flashcard-back">
                            <strong>${card.definition}</strong>
                            ${card.category ? `<span style="display:block; margin-top:0.75rem; font-size:0.8rem; color:var(--text-muted);">📂 ${card.category}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Re-bindear eventos de flip
        container.querySelectorAll('.flashcard').forEach(cardEl => {
            cardEl.addEventListener('click', () => {
                cardEl.classList.toggle('flipped');
            });
            cardEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    cardEl.classList.toggle('flipped');
                }
            });
        });
    }

    // Render inicial
    renderCards('all');

    // Botón para voltear todas
    const flipAllBtn = document.getElementById('btn-voltear-todas');
    if (flipAllBtn) {
        flipAllBtn.addEventListener('click', () => {
            const allCards = container.querySelectorAll('.flashcard');
            const anyUnflipped = Array.from(allCards).some(c => !c.classList.contains('flipped'));
            allCards.forEach(c => {
                if (anyUnflipped) {
                    c.classList.add('flipped');
                } else {
                    c.classList.remove('flipped');
                }
            });
        });
    }
}

// Exportación global y modular
if (typeof window !== 'undefined') {
    window.initFlashcardsRenderer = initFlashcardsRenderer;
}
