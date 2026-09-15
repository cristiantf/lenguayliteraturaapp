/**
 * Lengua y Literatura 9no EGB - Gestor del Estudiante (Actividades y Calificaciones)
 * Con soporte de credenciales de sesión y paginación para optimización de memoria/caché.
 */

const StudentManager = {
    API_ACTIVITIES: '/api/activities',
    API_GRADES: '/api/grades',
    activities: [],
    grades: [],

    // Filtros y Búsqueda de Actividades
    currentFilter: 'all',
    searchQuery: '',

    // Estado del Quiz Interactivo Activo
    currentQuiz: null,
    currentQIndex: 0,
    quizUserAnswers: {},

    // Paginación para Actividades
    actPage: 1,
    actPageSize: 4,

    // Paginación para Calificaciones
    gradePage: 1,
    gradePageSize: 5,

    async initActivities() {
        await this.loadActivities();
        this.bindActivityEvents();
    },

    async initGrades() {
        await this.loadGrades();
    },

    bindActivityEvents() {
        const form = document.getElementById('submit-activity-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmitActivity(e));
        }

        // Pestañas de filtrado de actividades
        const filterTabs = document.querySelectorAll('#activity-filter-tabs .filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => {
                    t.classList.remove('btn-primary', 'active');
                    t.classList.add('btn-outline-secondary');
                });
                tab.classList.remove('btn-outline-secondary');
                tab.classList.add('btn-primary', 'active');

                this.currentFilter = tab.dataset.filter || 'all';
                this.actPage = 1;
                this.renderActivities();
            });
        });

        // Buscador en tiempo real
        const searchInput = document.getElementById('activity-search-input');
        const clearBtn = document.getElementById('btn-clear-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
                this.actPage = 1;
                this.renderActivities();
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                this.searchQuery = '';
                clearBtn.style.display = 'none';
                this.actPage = 1;
                this.renderActivities();
            });
        }

        // Controles del Reproductor de Quiz
        const btnQuizPrev = document.getElementById('btn-quiz-prev');
        if (btnQuizPrev) {
            btnQuizPrev.addEventListener('click', () => this.prevQuizQuestion());
        }

        const btnQuizNext = document.getElementById('btn-quiz-next');
        if (btnQuizNext) {
            btnQuizNext.addEventListener('click', () => this.nextQuizQuestion());
        }

        const btnQuizFinish = document.getElementById('btn-quiz-finish');
        if (btnQuizFinish) {
            btnQuizFinish.addEventListener('click', () => this.submitQuiz());
        }

        const btnQuizDone = document.getElementById('btn-quiz-done');
        if (btnQuizDone) {
            btnQuizDone.addEventListener('click', () => {
                this.loadActivities();
            });
        }
    },

    async loadActivities() {
        const container = document.getElementById('student-activities-list');
        if (container) {
            container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando actividades disponibles...</div>`;
        }

        try {
            const res = await fetch(`${this.API_ACTIVITIES}/list.php`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                this.activities = data.activities || [];
                this.updateStats();
                this.renderActivities();
            } else {
                Toast.show(data.error || 'Error al cargar actividades', 'error');
            }
        } catch (err) {
            console.error('Error cargando actividades:', err);
            Toast.show('Error al conectar con el servidor', 'error');
        }
    },

    updateStats() {
        const activeActs = this.activities.filter(a => a.activa == 1);
        const now = new Date();

        let pending = 0;
        let submitted = 0;
        let graded = 0;

        activeActs.forEach(act => {
            const isSubmitted = !!act.mi_entrega_id;
            const isGraded = act.mi_calificacion !== null && act.mi_calificacion !== undefined;
            const isExpired = act.fecha_limite && new Date(act.fecha_limite) < now;

            if (isGraded) {
                graded++;
            } else if (isSubmitted) {
                submitted++;
            } else if (!isExpired) {
                pending++;
            }
        });

        const statTotal = document.getElementById('stat-total');
        const statPending = document.getElementById('stat-pending');
        const statSubmitted = document.getElementById('stat-submitted');
        const statGraded = document.getElementById('stat-graded');

        if (statTotal) statTotal.textContent = activeActs.length;
        if (statPending) statPending.textContent = pending;
        if (statSubmitted) statSubmitted.textContent = submitted;
        if (statGraded) statGraded.textContent = graded;
    },

    renderActivities() {
        const container = document.getElementById('student-activities-list');
        if (!container) return;

        const now = new Date();
        // Filtrar actividades activas
        let list = this.activities.filter(a => a.activa == 1);

        // Filtro por pestaña
        if (this.currentFilter === 'pending') {
            list = list.filter(a => !a.mi_entrega_id && (!a.fecha_limite || new Date(a.fecha_limite) >= now));
        } else if (this.currentFilter === 'submitted') {
            list = list.filter(a => !!a.mi_entrega_id && (a.mi_calificacion === null || a.mi_calificacion === undefined));
        } else if (this.currentFilter === 'graded') {
            list = list.filter(a => a.mi_calificacion !== null && a.mi_calificacion !== undefined);
        } else if (this.currentFilter === 'expired') {
            list = list.filter(a => !a.mi_entrega_id && a.fecha_limite && new Date(a.fecha_limite) < now);
        }

        // Filtro por búsqueda
        if (this.searchQuery) {
            list = list.filter(a => {
                const title = (a.titulo || '').toLowerCase();
                const desc = (a.descripcion || '').toLowerCase();
                const docente = `${a.docente_nombre || ''} ${a.docente_apellido || ''}`.toLowerCase();
                return title.includes(this.searchQuery) || desc.includes(this.searchQuery) || docente.includes(this.searchQuery);
            });
        }

        const totalItems = list.length;
        const totalPages = Math.ceil(totalItems / this.actPageSize) || 1;
        if (this.actPage > totalPages) this.actPage = totalPages;

        if (totalItems === 0) {
            let emptyMsg = 'No hay actividades en esta sección.';
            if (this.currentFilter === 'pending') emptyMsg = '¡Excelente! No tienes actividades pendientes por resolver.';
            if (this.currentFilter === 'submitted') emptyMsg = 'No tienes entregas pendientes de revisión.';
            if (this.currentFilter === 'graded') emptyMsg = 'Aún no tienes actividades calificadas.';
            if (this.currentFilter === 'expired') emptyMsg = '¡Genial! No tienes ninguna actividad con plazo vencido.';
            if (this.searchQuery) emptyMsg = `No se encontraron actividades que coincidan con "${this.escape(this.searchQuery)}".`;

            container.innerHTML = `
                <div class="card p-5 text-center" style="border:1px solid var(--border-color); border-radius:var(--radius-lg); background:var(--surface);">
                    <div style="font-size:3rem; margin-bottom:0.75rem;">✨</div>
                    <h5 style="font-weight:700; color:var(--text-color);">Sin actividades</h5>
                    <p style="color:var(--text-muted); margin:0;">${emptyMsg}</p>
                </div>
            `;
            this.renderActPagination(0, 1);
            return;
        }

        const startIndex = (this.actPage - 1) * this.actPageSize;
        const pageItems = list.slice(startIndex, startIndex + this.actPageSize);

        const cardsHtml = pageItems.map(act => {
            const isExpired = act.fecha_limite && new Date(act.fecha_limite) < now;
            const isSubmitted = !!act.mi_entrega_id;
            const isGraded = act.mi_calificacion !== null && act.mi_calificacion !== undefined;
            const isQuiz = (act.tipo === 'quiz');
            const isMixta = (act.tipo === 'mixta');

            let statusBadge = '';
            if (isGraded) {
                statusBadge = `<span class="badge" style="background:#10b981; color:#fff; font-size:0.8rem; padding:0.4rem 0.75rem;">⭐ Calificada: ${parseFloat(act.mi_calificacion).toFixed(2)}/${parseFloat(act.nota_maxima).toFixed(0)}</span>`;
            } else if (isSubmitted) {
                statusBadge = `<span class="badge" style="background:#3b82f6; color:#fff; font-size:0.8rem; padding:0.4rem 0.75rem;">📬 Entregada (En espera)</span>`;
            } else if (isExpired) {
                statusBadge = `<span class="badge" style="background:#ef4444; color:#fff; font-size:0.8rem; padding:0.4rem 0.75rem;">⏰ Plazo Vencido</span>`;
            } else {
                statusBadge = `<span class="badge" style="background:#f59e0b; color:#fff; font-size:0.8rem; padding:0.4rem 0.75rem;">⏳ Pendiente</span>`;
            }

            let tipoBadge = '';
            if (isQuiz) {
                tipoBadge = `<span class="badge" style="background:rgba(139, 92, 246, 0.15); color:#8b5cf6; border:1px solid rgba(139, 92, 246, 0.3); font-size:0.75rem; font-weight:700;">🎯 Quiz Interactivo</span>`;
            } else if (isMixta) {
                tipoBadge = `<span class="badge" style="background:rgba(245, 158, 11, 0.15); color:#d97706; border:1px solid rgba(245, 158, 11, 0.3); font-size:0.75rem; font-weight:700;">🔀 Mixta</span>`;
            } else {
                tipoBadge = `<span class="badge" style="background:rgba(100, 116, 139, 0.15); color:#64748b; border:1px solid rgba(100, 116, 139, 0.3); font-size:0.75rem; font-weight:700;">📄 Tarea Escrita</span>`;
            }

            const dateStr = act.fecha_limite 
                ? new Date(act.fecha_limite).toLocaleString('es-EC', { dateStyle:'medium', timeStyle:'short' })
                : 'Sin fecha límite';

            return `
                <div class="card mb-3" style="border:1px solid var(--border-color); border-radius:var(--radius-lg); background:var(--surface); overflow:hidden; transition:transform 0.2s ease, box-shadow 0.2s ease;">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-1">
                                    <h4 style="margin:0; font-size:1.15rem; font-weight:700; color:var(--text-color);">${this.escape(act.titulo)}</h4>
                                    ${tipoBadge}
                                </div>
                                <small style="color:var(--text-muted);">Docente: ${this.escape(act.docente_nombre || 'Docente')} • Calificación Máx: <strong>${parseFloat(act.nota_maxima).toFixed(2)} pts</strong></small>
                            </div>
                            <div>${statusBadge}</div>
                        </div>

                        <p style="color:var(--text-color); margin:1rem 0; white-space:pre-line; line-height:1.6; font-size:0.92rem;">${this.escape(act.descripcion)}</p>

                        <div class="d-flex justify-content-between align-items-center pt-3 flex-wrap gap-2" style="border-top:1px solid var(--border-color); font-size:0.85rem;">
                            <span class="${isExpired ? 'text-danger' : 'text-muted'}" style="display:flex; align-items:center; gap:0.35rem;">
                                📅 Fecha límite: <strong>${dateStr}</strong>
                            </span>
                            <div class="d-flex gap-2">
                                ${!isSubmitted && !isExpired ? (
                                    isQuiz ? `
                                        <button class="btn btn-primary btn-sm" onclick="StudentManager.openQuizPlayer(${act.id})" 
                                            style="background:linear-gradient(135deg, #6366f1, #8b5cf6); border:none; font-weight:700; box-shadow:0 4px 12px rgba(99,102,241,0.25); display:flex; align-items:center; gap:0.4rem;">
                                            <span>🚀</span> Realizar Quiz Dinámico
                                        </button>
                                    ` : `
                                        <button class="btn btn-primary btn-sm" onclick="StudentManager.openSubmitModal(${act.id})" style="font-weight:600;">
                                            ✍️ Enviar Tarea Escrita
                                        </button>
                                    `
                                ) : ''}

                                ${isSubmitted ? `
                                    <button class="btn btn-outline-secondary btn-sm" onclick="StudentManager.viewMySubmission(${act.id})" style="font-weight:600;">
                                        👁️ Ver Mi Entrega
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = cardsHtml + `<div id="student-act-pagination"></div>`;
        this.renderActPagination(totalItems, totalPages);
    },

    renderActPagination(totalItems, totalPages) {
        const container = document.getElementById('student-act-pagination');
        if (!container || totalItems === 0) return;

        const start = (this.actPage - 1) * this.actPageSize + 1;
        const end = Math.min(this.actPage * this.actPageSize, totalItems);

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 0; flex-wrap:wrap; gap:1rem; font-size:0.875rem;">
                <div style="color:var(--text-muted);">
                    Mostrando <strong>${start}-${end}</strong> de <strong>${totalItems}</strong> actividades
                </div>
                <div style="display:flex; align-items:center; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline-secondary" ${this.actPage <= 1 ? 'disabled' : ''} onclick="StudentManager.goToActPage(${this.actPage - 1})">
                        ◀ Anterior
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.actPage - 1 && i <= this.actPage + 1)) {
                html += `
                    <button class="btn btn-sm ${i === this.actPage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="StudentManager.goToActPage(${i})" style="min-width:32px;">
                        ${i}
                    </button>
                `;
            } else if (i === this.actPage - 2 || i === this.actPage + 2) {
                html += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
            }
        }

        html += `
                    <button class="btn btn-sm btn-outline-secondary" ${this.actPage >= totalPages ? 'disabled' : ''} onclick="StudentManager.goToActPage(${this.actPage + 1})">
                        Siguiente ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    goToActPage(page) {
        this.actPage = page;
        this.renderActivities();
    },

    async openQuizPlayer(actId) {
        const modalElem = document.getElementById('quizPlayerModal');
        if (!modalElem) return;

        // Resetear vistas del quiz
        const stepContainer = document.getElementById('quiz-step-container');
        const resultContainer = document.getElementById('quiz-result-container');
        const navButtons = document.getElementById('quiz-nav-buttons');
        const finishButtons = document.getElementById('quiz-finish-buttons');
        const closeBtnTop = document.getElementById('btn-close-quiz-top');

        if (stepContainer) stepContainer.style.display = 'block';
        if (resultContainer) resultContainer.style.display = 'none';
        if (navButtons) navButtons.style.display = 'flex';
        if (finishButtons) finishButtons.style.display = 'none';
        if (closeBtnTop) closeBtnTop.style.display = 'block';

        const titleElem = document.getElementById('quiz-player-title');
        if (titleElem) titleElem.textContent = 'Cargando preguntas del Quiz...';

        try {
            const res = await fetch(`/api/activities/quiz.php?activity_id=${actId}`, { credentials: 'include' });
            const data = await res.json();

            if (!data.success || !Array.isArray(data.preguntas) || data.preguntas.length === 0) {
                Toast.show(data.error || 'Este cuestionario no tiene preguntas activas.', 'warning');
                return;
            }

            this.currentQuiz = data;
            this.currentQIndex = 0;
            this.quizUserAnswers = {};

            if (titleElem) titleElem.textContent = data.activity.titulo;
            const badgeInfo = document.getElementById('quiz-badge-info');
            if (badgeInfo) badgeInfo.textContent = `🎯 ${parseFloat(data.activity.nota_maxima).toFixed(2)} pts máx`;

            const modal = new bootstrap.Modal(modalElem);
            modal.show();

            this.renderCurrentQuizQuestion();
        } catch (err) {
            console.error('Error al abrir el quiz:', err);
            Toast.show('Error al conectar con el servidor', 'error');
        }
    },

    renderCurrentQuizQuestion() {
        if (!this.currentQuiz || !this.currentQuiz.preguntas) return;

        const total = this.currentQuiz.preguntas.length;
        const currentQ = this.currentQuiz.preguntas[this.currentQIndex];
        const progressPct = Math.round(((this.currentQIndex + 1) / total) * 100);

        // Barra de progreso
        const pBar = document.getElementById('quiz-progress-bar');
        const pText = document.getElementById('quiz-progress-text');
        if (pBar) pBar.style.width = `${progressPct}%`;
        if (pText) pText.textContent = `Pregunta ${this.currentQIndex + 1} de ${total}`;

        // Número y Enunciado
        const qNum = document.getElementById('quiz-q-number');
        const qText = document.getElementById('quiz-q-text');
        if (qNum) qNum.textContent = this.currentQIndex + 1;
        if (qText) qText.textContent = currentQ.question;

        // Opciones
        const optContainer = document.getElementById('quiz-options-container');
        if (!optContainer) return;

        const selectedAnswer = this.quizUserAnswers[this.currentQIndex];
        const letters = ['A', 'B', 'C', 'D'];

        optContainer.innerHTML = (currentQ.options || []).map((opt, idx) => {
            const isSelected = (selectedAnswer === idx);
            const activeStyle = isSelected 
                ? 'border: 2px solid var(--primary); background: rgba(99, 102, 241, 0.12); color: var(--text-color); font-weight:600;' 
                : 'border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-color);';
            const circleStyle = isSelected
                ? 'background: var(--primary); color: #fff; font-weight:700;'
                : 'background: var(--bg-secondary); color: var(--text-muted); font-weight:600;';

            return `
                <div class="quiz-option-card p-3 d-flex align-items-center gap-3" 
                    onclick="StudentManager.selectQuizOption(${idx})"
                    style="${activeStyle} border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease;">
                    <div style="width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-size:0.9rem; ${circleStyle}">
                        ${isSelected ? '✓' : letters[idx]}
                    </div>
                    <div style="font-size:0.95rem; line-height:1.4; flex:1;">
                        ${this.escape(opt)}
                    </div>
                </div>
            `;
        }).join('');

        // Botones de navegación
        const btnPrev = document.getElementById('btn-quiz-prev');
        const btnNext = document.getElementById('btn-quiz-next');
        const btnFinish = document.getElementById('btn-quiz-finish');

        if (btnPrev) btnPrev.disabled = (this.currentQIndex === 0);
        
        const isLast = (this.currentQIndex === total - 1);
        if (btnNext) btnNext.style.display = isLast ? 'none' : 'block';
        if (btnFinish) {
            btnFinish.style.display = isLast ? 'block' : 'none';
            btnFinish.disabled = false;
            btnFinish.textContent = '🚀 Enviar y Calificar';
        }
    },

    selectQuizOption(optIndex) {
        this.quizUserAnswers[this.currentQIndex] = optIndex;
        this.renderCurrentQuizQuestion();
    },

    prevQuizQuestion() {
        if (this.currentQIndex > 0) {
            this.currentQIndex--;
            this.renderCurrentQuizQuestion();
        }
    },

    nextQuizQuestion() {
        if (!this.currentQuiz) return;
        if (this.currentQIndex < this.currentQuiz.preguntas.length - 1) {
            this.currentQIndex++;
            this.renderCurrentQuizQuestion();
        }
    },

    async submitQuiz() {
        if (!this.currentQuiz) return;

        const total = this.currentQuiz.preguntas.length;
        const answeredCount = Object.keys(this.quizUserAnswers).length;

        if (answeredCount < total) {
            const confirmed = confirm(`Has respondido ${answeredCount} de ${total} preguntas. ¿Deseas enviar el cuestionario ahora de todas formas?`);
            if (!confirmed) return;
        }

        const btnFinish = document.getElementById('btn-quiz-finish');
        if (btnFinish) {
            btnFinish.disabled = true;
            btnFinish.textContent = '⏳ Calificando...';
        }

        try {
            const res = await fetch(`${this.API_ACTIVITIES}/submit.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    actividad_id: this.currentQuiz.activity.id,
                    quiz_respuestas: this.quizUserAnswers
                })
            });
            const data = await res.json();

            if (data.success) {
                // Mostrar pantalla de celebración y resultados
                const stepContainer = document.getElementById('quiz-step-container');
                const resultContainer = document.getElementById('quiz-result-container');
                const navButtons = document.getElementById('quiz-nav-buttons');
                const finishButtons = document.getElementById('quiz-finish-buttons');
                const closeBtnTop = document.getElementById('btn-close-quiz-top');

                if (stepContainer) stepContainer.style.display = 'none';
                if (resultContainer) resultContainer.style.display = 'block';
                if (navButtons) navButtons.style.display = 'none';
                if (finishButtons) finishButtons.style.display = 'flex';
                if (closeBtnTop) closeBtnTop.style.display = 'none';

                const score = parseFloat(data.quiz_score || 0).toFixed(2);
                const maxScore = parseFloat(data.quiz_nota_maxima || 10).toFixed(0);
                const correct = data.quiz_correct || 0;
                const totalQ = data.quiz_total || total;
                const pct = Math.round((correct / Math.max(1, totalQ)) * 100);

                const resScore = document.getElementById('quiz-result-score');
                const resBadge = document.getElementById('quiz-result-badge');
                const resTitle = document.getElementById('quiz-result-title');

                if (resScore) resScore.textContent = `${score} / ${maxScore} pts`;
                if (resBadge) resBadge.textContent = `${correct} de ${totalQ} Aciertos (${pct}%)`;

                if (pct >= 70) {
                    if (resTitle) resTitle.textContent = '¡Felicidades, Excelente Trabajo! 🎉';
                    if (resScore) resScore.style.color = '#10b981';
                } else {
                    if (resTitle) resTitle.textContent = '¡Quiz Completado! Sigue Practicando 📚';
                    if (resScore) resScore.style.color = '#f59e0b';
                }

                // Renderizar retroalimentación pedagógica
                const feedbackList = document.getElementById('quiz-feedback-list');
                if (feedbackList && Array.isArray(data.quiz_feedback)) {
                    feedbackList.innerHTML = data.quiz_feedback.map((item, idx) => {
                        const isCorrect = item.is_correct;
                        const correctOptText = (item.options && item.options[item.correct_answer]) || '';
                        const userOptText = (item.options && item.user_answer !== null && item.options[item.user_answer]) || 'Sin responder';

                        return `
                            <div class="p-3" style="background:var(--bg-secondary); border:1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}; border-left:4px solid ${isCorrect ? '#10b981' : '#ef4444'}; border-radius:var(--radius-md);">
                                <div class="d-flex justify-content-between align-items-center mb-1">
                                    <strong style="color:var(--text-color); font-size:0.9rem;">#${idx + 1}. ${this.escape(item.question)}</strong>
                                    <span class="badge" style="background:${isCorrect ? '#10b981' : '#ef4444'}; color:#fff; font-size:0.75rem;">
                                        ${isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
                                    </span>
                                </div>
                                <div style="font-size:0.83rem; color:var(--text-muted); margin-bottom:0.25rem;">
                                    Tu respuesta: <span style="font-weight:600; color:${isCorrect ? '#10b981' : '#ef4444'};">${this.escape(userOptText)}</span>
                                    ${!isCorrect ? ` • Respuesta correcta: <strong style="color:#10b981;">${this.escape(correctOptText)}</strong>` : ''}
                                </div>
                                ${item.explanation ? `
                                    <div style="font-size:0.8rem; color:var(--text-color); background:var(--surface); padding:0.4rem 0.6rem; border-radius:4px; margin-top:0.35rem; font-style:italic;">
                                        💡 <strong>Explicación:</strong> ${this.escape(item.explanation)}
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('');
                }

                Toast.show('¡Quiz calificado automáticamente!', 'success');
                this.loadActivities();
            } else {
                Toast.show(data.error || 'Error al enviar el quiz', 'error');
                if (btnFinish) {
                    btnFinish.disabled = false;
                    btnFinish.textContent = '🚀 Enviar y Calificar';
                }
            }
        } catch (err) {
            console.error('Error enviando quiz:', err);
            Toast.show('Error al conectar con el servidor', 'error');
            if (btnFinish) {
                btnFinish.disabled = false;
                btnFinish.textContent = '🚀 Enviar y Calificar';
            }
        }
    },

    openSubmitModal(actId) {
        const modalElem = document.getElementById('submitModal');
        if (!modalElem) return;

        const act = this.activities.find(a => a.id == actId);
        if (!act) return;

        document.getElementById('submit-act-id').value = act.id;
        document.getElementById('submit-modal-title').textContent = `Entregar: ${act.titulo}`;
        document.getElementById('submit-act-desc').textContent = act.descripcion;
        document.getElementById('submit-content').value = '';

        const modal = new bootstrap.Modal(modalElem);
        modal.show();
    },

    async handleSubmitActivity(e) {
        e.preventDefault();
        const actividad_id = document.getElementById('submit-act-id').value;
        const contenido = document.getElementById('submit-content').value.trim();

        if (!contenido) {
            Toast.show('Por favor ingresa tu respuesta o trabajo.', 'warning');
            return;
        }

        try {
            const res = await fetch(`${this.API_ACTIVITIES}/submit.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    actividad_id,
                    contenido
                })
            });
            const data = await res.json();

            if (data.success) {
                Toast.show('¡Actividad enviada con éxito! Tu docente ha sido notificado para calificarla.', 'success');
                const modalElem = document.getElementById('submitModal');
                const modal = bootstrap.Modal.getInstance(modalElem);
                if (modal) modal.hide();
                await this.loadActivities();
            } else {
                Toast.show(data.error || 'Error al enviar actividad', 'error');
            }
        } catch (err) {
            console.error('Error enviando actividad:', err);
            Toast.show('Error al conectar con el servidor', 'error');
        }
    },

    viewMySubmission(actId) {
        const act = this.activities.find(a => a.id == actId);
        if (!act) return;

        let modalElem = document.getElementById('viewMySubmissionModal');
        if (!modalElem) {
            this.injectViewMySubmissionModal();
            modalElem = document.getElementById('viewMySubmissionModal');
        }

        const hasGrade = act.mi_calificacion !== null && act.mi_calificacion !== undefined;

        // Metadatos
        const metaElem = document.getElementById('student-sub-meta');
        if (metaElem) metaElem.textContent = `Actividad #${act.id} • Tipo: ${act.tipo || 'General'}`;

        const titleElem = document.getElementById('student-sub-act-title');
        if (titleElem) titleElem.textContent = act.titulo || 'Actividad';

        const docenteElem = document.getElementById('student-sub-docente');
        if (docenteElem) docenteElem.textContent = `Docente: ${act.docente_nombre || ''} ${act.docente_apellido || ''}`;

        const dateStr = act.fecha_entrega 
            ? new Date(act.fecha_entrega).toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' })
            : 'Fecha no registrada';
        const dateElem = document.getElementById('student-sub-date');
        if (dateElem) dateElem.textContent = `📅 Entregado el ${dateStr}`;

        // Badge de estado
        const badgeContainer = document.getElementById('student-sub-status-badge');
        if (badgeContainer) {
            if (hasGrade) {
                badgeContainer.innerHTML = `<span class="badge" style="background:#10b981; color:#fff; font-size:0.85rem; padding:0.4rem 0.75rem;">⭐ Calificada: ${parseFloat(act.mi_calificacion).toFixed(2)} / ${parseFloat(act.nota_maxima).toFixed(2)}</span>`;
            } else {
                badgeContainer.innerHTML = `<span class="badge" style="background:#3b82f6; color:#fff; font-size:0.85rem; padding:0.4rem 0.75rem;">📬 Entregada (En revisión)</span>`;
            }
        }

        // Contenido de la respuesta
        const contentBox = document.getElementById('student-sub-content');
        if (contentBox) {
            if (act.mi_contenido && act.mi_contenido.trim() !== '') {
                contentBox.textContent = act.mi_contenido;
                contentBox.style.fontStyle = 'normal';
                contentBox.style.color = 'var(--text-color)';
            } else {
                contentBox.textContent = 'ℹ️ Actividad o cuestionario interactivo completado en línea sin texto complementario.';
                contentBox.style.fontStyle = 'italic';
                contentBox.style.color = 'var(--text-muted)';
            }
        }

        // Archivo adjunto si existe
        const fileContainer = document.getElementById('student-sub-file-container');
        if (fileContainer) {
            if (act.mi_archivo_url && act.mi_archivo_url.trim() !== '') {
                fileContainer.style.display = 'block';
                const filename = act.mi_archivo_url.split('/').pop() || 'archivo_entregado';
                const filenameElem = document.getElementById('student-sub-filename');
                if (filenameElem) filenameElem.textContent = filename;
                const fileLink = document.getElementById('student-sub-filelink');
                if (fileLink) {
                    fileLink.href = act.mi_archivo_url;
                    fileLink.download = filename;
                }
            } else {
                fileContainer.style.display = 'none';
            }
        }

        // Retroalimentación o aviso de pendiente
        const gradeCard = document.getElementById('student-sub-grade-card');
        const pendingCard = document.getElementById('student-sub-pending-card');
        const goGradesBtn = document.getElementById('student-sub-go-grades');

        if (hasGrade) {
            if (gradeCard) gradeCard.style.display = 'block';
            if (pendingCard) pendingCard.style.display = 'none';
            if (goGradesBtn) goGradesBtn.style.display = 'inline-block';

            const scoreElem = document.getElementById('student-sub-grade-score');
            if (scoreElem) scoreElem.textContent = `⭐ Calificación: ${parseFloat(act.mi_calificacion).toFixed(2)} / ${parseFloat(act.nota_maxima).toFixed(2)}`;

            const feedbackElem = document.getElementById('student-sub-grade-feedback');
            if (feedbackElem) {
                feedbackElem.textContent = act.mi_retroalimentacion && act.mi_retroalimentacion.trim() !== ''
                    ? `"${act.mi_retroalimentacion}"`
                    : '(Tu docente no incluyó comentarios adicionales).';
            }
        } else {
            if (gradeCard) gradeCard.style.display = 'none';
            if (pendingCard) pendingCard.style.display = 'block';
            if (goGradesBtn) goGradesBtn.style.display = 'none';
        }

        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElem);
            modal.show();
        }
    },

    injectViewMySubmissionModal() {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="modal fade" id="viewMySubmissionModal" tabindex="-1" aria-labelledby="viewMySubmissionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content" style="background:var(--surface); color:var(--text-color); border:1px solid var(--border-color); border-radius:var(--radius-lg); box-shadow:0 20px 40px rgba(0,0,0,0.18);">
                        <div class="modal-header" style="border-bottom:1px solid var(--border-color); padding:1.25rem 1.5rem;">
                            <div>
                                <h5 class="modal-title" id="viewMySubmissionModalLabel" style="display:flex; align-items:center; gap:0.5rem; font-weight:700; margin:0;">
                                    <span>📄</span> Detalle de Mi Entrega
                                </h5>
                                <small id="student-sub-meta" style="color:var(--text-muted); font-size:0.8rem;"></small>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="padding:1.5rem;">
                            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.15rem 1.25rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div style="display:flex; align-items:center; gap:0.9rem;">
                                    <div style="width:48px; height:48px; border-radius:12px; background:rgba(99,102,241,0.12); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">
                                        📖
                                    </div>
                                    <div>
                                        <h5 id="student-sub-act-title" style="margin:0; font-weight:700; color:var(--text-color); font-size:1.1rem;">Título de la Actividad</h5>
                                        <div id="student-sub-docente" style="font-size:0.82rem; color:var(--text-muted); margin-top:0.2rem;">Docente: —</div>
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div id="student-sub-status-badge"></div>
                                    <small id="student-sub-date" style="display:block; color:var(--text-muted); font-size:0.75rem; margin-top:0.35rem; font-weight:500;"></small>
                                </div>
                            </div>
                            <div style="margin-bottom:1.25rem;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>✍️</span> Tu Respuesta y Contenido Enviado
                                </span>
                                <div id="student-sub-content" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; font-size:0.92rem; line-height:1.65; white-space:pre-wrap; word-break:break-word; max-height:260px; overflow-y:auto; color:var(--text-color);">
                                    Contenido...
                                </div>
                            </div>
                            <div id="student-sub-file-container" style="display:none; margin-bottom:1.25rem;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>📎</span> Archivo Adjunto que Entregaste
                                </span>
                                <div style="background:var(--bg-secondary); border:1px dashed var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;">
                                    <div style="display:flex; align-items:center; gap:0.65rem; overflow:hidden;">
                                        <span style="font-size:1.6rem;">📄</span>
                                        <span id="student-sub-filename" style="font-size:0.88rem; font-weight:600; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">archivo.pdf</span>
                                    </div>
                                    <a href="#" id="student-sub-filelink" target="_blank" class="btn btn-sm btn-outline-primary" style="white-space:nowrap; font-weight:600;">
                                        📥 Abrir / Descargar
                                    </a>
                                </div>
                            </div>
                            <div id="student-sub-grade-card" style="display:none;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>💬</span> Evaluación del Docente
                                </span>
                                <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); border-radius:var(--radius-md); padding:1rem 1.25rem;">
                                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.45rem; flex-wrap:wrap; gap:0.5rem;">
                                        <strong id="student-sub-grade-score" style="color:#10b981; font-size:1.05rem;">⭐ Calificación: 10.00 / 10.00</strong>
                                        <span class="badge" style="background:#10b981; color:#fff; font-size:0.75rem;">Aprobada</span>
                                    </div>
                                    <div id="student-sub-grade-feedback" style="font-size:0.88rem; color:var(--text-color); font-style:italic; line-height:1.55;"></div>
                                </div>
                            </div>
                            <div id="student-sub-pending-card" style="display:none;">
                                <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:var(--radius-md); padding:1rem 1.25rem; display:flex; align-items:center; gap:0.85rem;">
                                    <span style="font-size:1.5rem;">⏳</span>
                                    <div style="font-size:0.88rem; color:var(--text-color); line-height:1.5;">
                                        <strong>Tu entrega está en revisión:</strong> El docente aún no ha asignado una calificación. Recibirás una notificación en cuanto sea evaluada.
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="border-top:1px solid var(--border-color); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <a href="calificaciones.html" class="btn btn-primary" id="student-sub-go-grades" style="display:none;">
                                ⭐ Ver Mis Calificaciones
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div.firstElementChild);
    },

    // ── CALIFICACIONES DEL ESTUDIANTE ─────────────────────────
    async loadGrades() {
        const tbody = document.getElementById('grades-table-body');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando tu historial de notas...</td></tr>`;
        }

        try {
            const res = await fetch(`${this.API_GRADES}/student.php`, { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                this.grades = data.grades || [];
                this.renderGrades(data.promedio_general);
            } else {
                Toast.show(data.error || 'Error al cargar calificaciones', 'error');
            }
        } catch (err) {
            console.error('Error cargando calificaciones:', err);
            Toast.show('Error de conexión', 'error');
        }
    },

    renderGrades(promedio) {
        const tbody = document.getElementById('grades-table-body');
        const promElem = document.getElementById('stat-promedio-general');
        if (promElem) {
            promElem.textContent = promedio !== undefined && promedio !== null ? parseFloat(promedio).toFixed(2) : '—';
        }

        if (!tbody) return;

        const totalItems = this.grades.length;
        const totalPages = Math.ceil(totalItems / this.gradePageSize) || 1;
        if (this.gradePage > totalPages) this.gradePage = totalPages;

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Aún no tienes entregas calificadas.</td></tr>`;
            this.renderGradesPagination(0, 1);
            return;
        }

        const startIndex = (this.gradePage - 1) * this.gradePageSize;
        const pageItems = this.grades.slice(startIndex, startIndex + this.gradePageSize);

        tbody.innerHTML = pageItems.map(g => {
            const hasGrade = g.calificacion !== null && g.calificacion !== undefined;
            return `
                <tr>
                    <td><strong>${this.escape(g.actividad_titulo)}</strong></td>
                    <td>${this.escape(g.docente_nombre || 'Docente')}</td>
                    <td style="font-size:0.85rem; color:var(--text-muted);">${g.fecha_entrega ? new Date(g.fecha_entrega).toLocaleDateString('es-EC') : (g.entregado_en ? new Date(g.entregado_en).toLocaleDateString('es-EC') : '—')}</td>
                    <td>
                        ${hasGrade 
                            ? `<span class="badge" style="background:#10b981; color:#fff; font-size:0.9rem; font-weight:700;">${parseFloat(g.calificacion).toFixed(2)} pts</span>`
                            : `<span class="badge" style="background:#f59e0b; color:#fff;">En espera</span>`}
                    </td>
                    <td><span style="font-weight:600; color:var(--text-muted);">${parseFloat(g.nota_maxima || 10).toFixed(2)}</span></td>
                    <td style="font-size:0.85rem; color:var(--text-color);">
                        ${g.retroalimentacion ? `💬 <em>"${this.escape(g.retroalimentacion)}"</em>` : '<span style="color:var(--text-muted);">Sin comentarios</span>'}
                    </td>
                </tr>
            `;
        }).join('');

        this.renderGradesPagination(totalItems, totalPages);
    },

    renderGradesPagination(totalItems, totalPages) {
        let container = document.getElementById('grades-pagination');
        if (!container) {
            const tableCard = document.querySelector('.card .table-responsive')?.parentElement;
            if (tableCard) {
                container = document.createElement('div');
                container.id = 'grades-pagination';
                tableCard.appendChild(container);
            } else return;
        }

        if (totalItems === 0) {
            container.innerHTML = '';
            return;
        }

        const start = (this.gradePage - 1) * this.gradePageSize + 1;
        const end = Math.min(this.gradePage * this.gradePageSize, totalItems);

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem; font-size:0.875rem;">
                <div style="color:var(--text-muted);">
                    Mostrando <strong>${start}-${end}</strong> de <strong>${totalItems}</strong> calificaciones
                </div>
                <div style="display:flex; align-items:center; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline-secondary" ${this.gradePage <= 1 ? 'disabled' : ''} onclick="StudentManager.goToGradePage(${this.gradePage - 1})">
                        ◀ Anterior
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.gradePage - 1 && i <= this.gradePage + 1)) {
                html += `
                    <button class="btn btn-sm ${i === this.gradePage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="StudentManager.goToGradePage(${i})" style="min-width:32px;">
                        ${i}
                    </button>
                `;
            } else if (i === this.gradePage - 2 || i === this.gradePage + 2) {
                html += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
            }
        }

        html += `
                    <button class="btn btn-sm btn-outline-secondary" ${this.gradePage >= totalPages ? 'disabled' : ''} onclick="StudentManager.goToGradePage(${this.gradePage + 1})">
                        Siguiente ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    goToGradePage(page) {
        this.gradePage = page;
        this.renderGrades();
    },

    escape(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
};

window.StudentManager = StudentManager;
