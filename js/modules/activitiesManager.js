/**
 * Lengua y Literatura 9no EGB - Gestor de Actividades y Calificaciones (Docente)
 * Con soporte de credenciales de sesión y paginación para optimización de memoria/caché.
 */

const ActivitiesManager = {
    API_ACTIVITIES: '/api/activities',
    API_GRADES: '/api/grades',
    activities: [],
    submissions: [],
    currentActivityId: null,
    quizQuestions: [],

    // Paginación para Actividades
    actPage: 1,
    actPageSize: 5,

    // Paginación para Calificaciones
    subPage: 1,
    subPageSize: 5,

    async init() {
        await this.loadActivities();
        this.bindEvents();
    },

    bindEvents() {
        const form = document.getElementById('activity-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSaveActivity(e));
        }

        const btnNew = document.getElementById('btn-new-activity');
        if (btnNew) {
            btnNew.addEventListener('click', () => this.openActivityModal());
        }

        const tipoSelect = document.getElementById('act-tipo');
        if (tipoSelect) {
            tipoSelect.addEventListener('change', () => this.handleTipoChange());
        }

        const btnAddQ = document.getElementById('btn-add-question');
        if (btnAddQ) {
            btnAddQ.addEventListener('click', () => this.addQuizQuestion());
        }

        const btnSampleQ = document.getElementById('btn-load-sample-questions');
        if (btnSampleQ) {
            btnSampleQ.addEventListener('click', () => this.loadSampleQuestions());
        }

        const gradeForm = document.getElementById('grade-form');
        if (gradeForm) {
            gradeForm.addEventListener('submit', (e) => this.handleSaveGrade(e));
        }
    },

    async loadActivities() {
        const container = document.getElementById('activities-table-body');
        if (container) {
            container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando actividades...</td></tr>`;
        }

        try {
            const res = await fetch(`${this.API_ACTIVITIES}/list.php`, { credentials: 'include' });
            const data = await res.json();
            if (data.success) {
                this.activities = data.activities || [];
                this.renderActivities();
                this.updateStats();
            } else {
                Toast.show(data.error || 'Error al cargar actividades', 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            Toast.show('Error al conectar con el servidor', 'error');
        }
    },

    renderActivities() {
        const container = document.getElementById('activities-table-body');
        if (!container) return;

        const totalItems = this.activities.length;
        const totalPages = Math.ceil(totalItems / this.actPageSize) || 1;
        if (this.actPage > totalPages) this.actPage = totalPages;

        if (totalItems === 0) {
            container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No has creado actividades aún. Haz clic en "Nueva Actividad".</td></tr>`;
            this.renderActPagination(0, 1);
            return;
        }

        const startIndex = (this.actPage - 1) * this.actPageSize;
        const pageItems = this.activities.slice(startIndex, startIndex + this.actPageSize);

        container.innerHTML = pageItems.map(act => {
            const isExpired = act.fecha_limite && new Date(act.fecha_limite) < new Date();
            const dateFormatted = act.fecha_limite 
                ? new Date(act.fecha_limite).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) 
                : 'Sin límite';

            let tipoBadge = '';
            if (act.tipo === 'quiz') {
                tipoBadge = `<span class="badge" style="background:#8b5cf6; color:#fff; font-size:0.7rem; font-weight:600; margin-left:0.4rem;">🎯 Quiz</span>`;
            } else if (act.tipo === 'mixta') {
                tipoBadge = `<span class="badge" style="background:#f59e0b; color:#fff; font-size:0.7rem; font-weight:600; margin-left:0.4rem;">🔀 Mixta</span>`;
            } else {
                tipoBadge = `<span class="badge" style="background:#64748b; color:#fff; font-size:0.7rem; font-weight:600; margin-left:0.4rem;">📄 Tarea</span>`;
            }

            return `
                <tr>
                    <td><strong>#${act.id}</strong></td>
                    <td>
                        <div style="font-weight:600; color:var(--text-color); display:flex; align-items:center; flex-wrap:wrap;">
                            ${this.escape(act.titulo)} ${tipoBadge}
                        </div>
                        <small style="color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">
                            ${this.escape(act.descripcion || 'Sin descripción')}
                        </small>
                    </td>
                    <td><strong>${parseFloat(act.nota_maxima).toFixed(2)} pts</strong></td>
                    <td>
                        <span class="${isExpired ? 'text-danger' : 'text-muted'}" style="font-size:0.85rem;">
                            📅 ${dateFormatted}
                            ${isExpired ? '<span class="badge bg-danger ms-1" style="font-size:0.65rem;">Vencida</span>' : ''}
                        </span>
                    </td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="switch-${act.id}" 
                                ${act.activa == 1 ? 'checked' : ''} 
                                onchange="ActivitiesManager.toggleStatus(${act.id}, this.checked)">
                            <label class="form-check-label" for="switch-${act.id}" style="font-size:0.8rem;">
                                ${act.activa == 1 ? '<span class="text-success">Activa</span>' : '<span class="text-secondary">Pausada</span>'}
                            </label>
                        </div>
                    </td>
                    <td>
                        <a href="calificar.html?actividad_id=${act.id}" class="btn btn-sm btn-outline-info" title="Ver entregas y calificar">
                            📝 Entregas (${act.total_entregas || 0})
                        </a>
                    </td>
                    <td style="text-align:right;">
                        <div style="display:flex; justify-content:flex-end; gap:0.4rem;">
                            <button class="btn btn-sm btn-outline-primary" onclick="ActivitiesManager.openActivityModal(${act.id})" title="Editar">
                                ✏️
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="ActivitiesManager.confirmDelete(${act.id}, '${this.escape(act.titulo)}')" title="Eliminar">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderActPagination(totalItems, totalPages);
    },

    renderActPagination(totalItems, totalPages) {
        let container = document.getElementById('activities-pagination');
        if (!container) {
            const tableCard = document.querySelector('.card .table-responsive')?.parentElement;
            if (tableCard) {
                container = document.createElement('div');
                container.id = 'activities-pagination';
                tableCard.appendChild(container);
            } else return;
        }

        if (totalItems === 0) {
            container.innerHTML = '';
            return;
        }

        const start = (this.actPage - 1) * this.actPageSize + 1;
        const end = Math.min(this.actPage * this.actPageSize, totalItems);

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem; font-size:0.875rem;">
                <div style="color:var(--text-muted);">
                    Mostrando <strong>${start}-${end}</strong> de <strong>${totalItems}</strong> actividades
                </div>
                <div style="display:flex; align-items:center; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline-secondary" ${this.actPage <= 1 ? 'disabled' : ''} onclick="ActivitiesManager.goToActPage(${this.actPage - 1})">
                        ◀ Anterior
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.actPage - 1 && i <= this.actPage + 1)) {
                html += `
                    <button class="btn btn-sm ${i === this.actPage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="ActivitiesManager.goToActPage(${i})" style="min-width:32px;">
                        ${i}
                    </button>
                `;
            } else if (i === this.actPage - 2 || i === this.actPage + 2) {
                html += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
            }
        }

        html += `
                    <button class="btn btn-sm btn-outline-secondary" ${this.actPage >= totalPages ? 'disabled' : ''} onclick="ActivitiesManager.goToActPage(${this.actPage + 1})">
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

    updateStats() {
        const total = document.getElementById('stat-total-actividades');
        const activas = document.getElementById('stat-actividades-activas');
        if (total) total.textContent = this.activities.length;
        if (activas) activas.textContent = this.activities.filter(a => a.activa == 1).length;
    },

    async openActivityModal(id = null) {
        const modalElem = document.getElementById('activityModal');
        if (!modalElem) return;

        const form = document.getElementById('activity-form');
        form.reset();
        this.quizQuestions = [];

        const titleElem = document.getElementById('activityModalLabel');
        const idInput = document.getElementById('act-id');
        const tipoSelect = document.getElementById('act-tipo');

        if (id) {
            const act = this.activities.find(a => a.id == id);
            if (!act) return;

            titleElem.textContent = 'Editar Actividad';
            idInput.value = act.id;
            document.getElementById('act-titulo').value = act.titulo || '';
            document.getElementById('act-descripcion').value = act.descripcion || '';
            document.getElementById('act-nota-max').value = act.nota_maxima || 10;
            if (tipoSelect) tipoSelect.value = act.tipo || 'quiz';
            
            if (act.fecha_limite) {
                const d = new Date(act.fecha_limite);
                const isoStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                document.getElementById('act-fecha-limite').value = isoStr;
            } else {
                document.getElementById('act-fecha-limite').value = '';
            }

            document.getElementById('act-activa').checked = act.activa == 1;

            // Si es tipo quiz o mixta, intentar recuperar preguntas existentes
            if (act.tipo === 'quiz' || act.tipo === 'mixta') {
                try {
                    const res = await fetch(`/api/activities/quiz.php?activity_id=${act.id}`, { credentials: 'include' });
                    const qData = await res.json();
                    if (qData.success && Array.isArray(qData.preguntas)) {
                        this.quizQuestions = qData.preguntas.map(p => ({
                            question: p.question || '',
                            options: Array.isArray(p.options) && p.options.length === 4 ? p.options : ['', '', '', ''],
                            answer: typeof p.answer === 'number' ? p.answer : 0,
                            explanation: p.explanation || ''
                        }));
                    }
                } catch (err) {
                    console.error('Error al cargar preguntas:', err);
                }
            }
        } else {
            titleElem.textContent = 'Crear Nueva Actividad';
            idInput.value = '';
            document.getElementById('act-nota-max').value = 10;
            document.getElementById('act-activa').checked = true;
            if (tipoSelect) tipoSelect.value = 'quiz';
        }

        this.handleTipoChange();

        const modal = new bootstrap.Modal(modalElem);
        modal.show();
    },

    handleTipoChange() {
        const tipoSelect = document.getElementById('act-tipo');
        const tipo = tipoSelect ? tipoSelect.value : 'quiz';
        const container = document.getElementById('quiz-builder-container');
        
        if (container) {
            const showQuiz = (tipo === 'quiz' || tipo === 'mixta');
            container.style.display = showQuiz ? 'block' : 'none';
            if (showQuiz) {
                this.renderQuizQuestions();
            }
        }
    },

    renderQuizQuestions() {
        const list = document.getElementById('quiz-questions-list');
        const alertBox = document.getElementById('quiz-summary-alert');
        if (!list) return;

        if (this.quizQuestions.length === 0) {
            list.innerHTML = '';
            if (alertBox) {
                alertBox.innerHTML = `Sin preguntas añadidas. Haz clic en <strong>➕ Añadir Pregunta</strong> o en <strong>✨ Preguntas de Muestra</strong>.`;
                alertBox.className = 'mt-3 p-2 text-center text-warning';
            }
            return;
        }

        const notaMax = parseFloat(document.getElementById('act-nota-max')?.value) || 10;
        const ptsPorPregunta = (notaMax / this.quizQuestions.length).toFixed(2);

        if (alertBox) {
            alertBox.innerHTML = `<strong>${this.quizQuestions.length} preguntas configuradas</strong>. Cada acierto sumará <strong>${ptsPorPregunta} pts</strong> de forma automática.`;
            alertBox.className = 'mt-3 p-2 text-center text-success';
        }

        list.innerHTML = this.quizQuestions.map((q, qIndex) => {
            const optionsHtml = (q.options || ['', '', '', '']).map((opt, optIndex) => {
                const optLetter = ['A', 'B', 'C', 'D'][optIndex];
                const isChecked = q.answer === optIndex ? 'checked' : '';
                return `
                    <div class="input-group input-group-sm mb-1">
                        <span class="input-group-text" style="background:var(--bg-secondary); color:var(--text-color); font-weight:700;">
                            <input type="radio" name="correct-q-${qIndex}" value="${optIndex}" ${isChecked} 
                                onchange="ActivitiesManager.setCorrectOption(${qIndex}, ${optIndex})"
                                title="Marcar como respuesta correcta" style="cursor:pointer; margin-right:0.35rem;">
                            ${optLetter}
                        </span>
                        <input type="text" class="form-control" placeholder="Opción ${optLetter}" value="${this.escape(opt)}"
                            oninput="ActivitiesManager.updateQuestionOption(${qIndex}, ${optIndex}, this.value)"
                            style="background:var(--bg-primary); color:var(--text-color); border-color:var(--border-color);">
                    </div>
                `;
            }).join('');

            return `
                <div class="card p-3" style="background:var(--surface); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong style="color:var(--primary); font-size:0.9rem;">Pregunta #${qIndex + 1}</strong>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="ActivitiesManager.removeQuizQuestion(${qIndex})" title="Eliminar pregunta" style="font-size:0.75rem; padding:0.2rem 0.5rem;">
                            🗑️ Eliminar
                        </button>
                    </div>
                    <div class="mb-2">
                        <label style="font-size:0.8rem; font-weight:600; color:var(--text-color);">Enunciado de la Pregunta:</label>
                        <input type="text" class="form-control form-control-sm" placeholder="Ej. ¿Qué figura retórica consiste en exagerar desmedidamente la realidad?" 
                            value="${this.escape(q.question)}" oninput="ActivitiesManager.updateQuestionText(${qIndex}, this.value)"
                            style="background:var(--bg-primary); color:var(--text-color); border-color:var(--border-color);">
                    </div>
                    <div class="mb-2">
                        <label style="font-size:0.75rem; color:var(--text-muted);">Opciones de respuesta (Marca el círculo de la opción correcta):</label>
                        <div class="mt-1">${optionsHtml}</div>
                    </div>
                    <div>
                        <label style="font-size:0.75rem; color:var(--text-muted);">Explicación / Retroalimentación Pedagógica (Se muestra tras calificar):</label>
                        <input type="text" class="form-control form-control-sm" placeholder="Ej. La hipérbole es una exageración intencional para dar énfasis." 
                            value="${this.escape(q.explanation || '')}" oninput="ActivitiesManager.updateQuestionExplanation(${qIndex}, this.value)"
                            style="background:var(--bg-primary); color:var(--text-color); border-color:var(--border-color); font-size:0.8rem;">
                    </div>
                </div>
            `;
        }).join('');
    },

    addQuizQuestion(qData = null) {
        if (qData) {
            this.quizQuestions.push(qData);
        } else {
            this.quizQuestions.push({
                question: '',
                options: ['', '', '', ''],
                answer: 0,
                explanation: ''
            });
        }
        this.renderQuizQuestions();
    },

    removeQuizQuestion(index) {
        this.quizQuestions.splice(index, 1);
        this.renderQuizQuestions();
    },

    updateQuestionText(qIndex, text) {
        if (this.quizQuestions[qIndex]) {
            this.quizQuestions[qIndex].question = text;
        }
    },

    updateQuestionOption(qIndex, optIndex, text) {
        if (this.quizQuestions[qIndex] && this.quizQuestions[qIndex].options) {
            this.quizQuestions[qIndex].options[optIndex] = text;
        }
    },

    setCorrectOption(qIndex, optIndex) {
        if (this.quizQuestions[qIndex]) {
            this.quizQuestions[qIndex].answer = parseInt(optIndex, 10);
        }
    },

    updateQuestionExplanation(qIndex, text) {
        if (this.quizQuestions[qIndex]) {
            this.quizQuestions[qIndex].explanation = text;
        }
    },

    loadSampleQuestions() {
        this.quizQuestions = [
            {
                question: '¿Qué figura literaria se presenta en el verso: "Las perlas de tu boca brillaban al sonreír"?',
                options: [
                    'Metáfora (identificación entre perlas y dientes)',
                    'Hipérbole (exageración desmedida)',
                    'Personificación (cualidad humana a un objeto)',
                    'Onomatopeya (imitación de un sonido natural)'
                ],
                answer: 0,
                explanation: 'Es una metáfora porque se sustituye el término real (los dientes) por el término imaginario (perlas) por su blancura y brillo.'
            },
            {
                question: '¿Cuál es el objetivo principal de una crónica periodística?',
                options: [
                    'Exponer fórmulas científicas rigurosas',
                    'Relatar sucesos reales de forma cronológica combinando datos con la mirada valorativa del autor',
                    'Crear una historia ficticia con personajes de fantasía',
                    'Publicitar un producto comercial con fines de venta inmediata'
                ],
                answer: 1,
                explanation: 'La crónica relata cronológicamente acontecimientos verdaderos mientras transmite la perspectiva y estilo del periodista.'
            },
            {
                question: 'En la oración: "Estudió con dedicación; por lo tanto, obtuvo una calificación sobresaliente", el conector "por lo tanto" es de tipo:',
                options: [
                    'Adversativo o de oposición',
                    'Consecutivo o de efecto',
                    'Causal o de motivo',
                    'Temporal de anterioridad'
                ],
                answer: 1,
                explanation: '"Por lo tanto" es un conector consecutivo que introduce el resultado o consecuencia directa de la premisa previa.'
            },
            {
                question: '¿Qué rasgo define primordialmente a los textos de divulgación científica en Lengua y Literatura?',
                options: [
                    'El uso excesivo de jerga críptica inaccesible',
                    'La invención libre de hechos no demostrados',
                    'Transmitir hallazgos y teorías científicas con rigurosidad y en un lenguaje claro para todo público',
                    'La ausencia total de datos y fuentes verificables'
                ],
                answer: 2,
                explanation: 'La divulgación científica tiende un puente entre el rigor académico y la comprensión del público general.'
            }
        ];
        this.renderQuizQuestions();
        Toast.show('Se han cargado 4 preguntas modelo de Lengua y Literatura para 9no EGB', 'info');
    },

    async handleSaveActivity(e) {
        e.preventDefault();
        const id = document.getElementById('act-id').value;
        const titulo = document.getElementById('act-titulo').value.trim();
        const tipo = document.getElementById('act-tipo') ? document.getElementById('act-tipo').value : 'quiz';
        const descripcion = document.getElementById('act-descripcion').value.trim();
        const nota_maxima = parseFloat(document.getElementById('act-nota-max').value) || 10;
        const fecha_limite = document.getElementById('act-fecha-limite').value || null;
        const activa = document.getElementById('act-activa').checked ? 1 : 0;

        if (!titulo) {
            Toast.show('El título es requerido', 'warning');
            return;
        }

        // Si es tipo quiz o mixta, validar preguntas
        if (tipo === 'quiz' || tipo === 'mixta') {
            if (this.quizQuestions.length === 0) {
                Toast.show('Debes añadir al menos una pregunta al cuestionario o cargar las preguntas de muestra', 'warning');
                return;
            }

            for (let i = 0; i < this.quizQuestions.length; i++) {
                const q = this.quizQuestions[i];
                if (!q.question || !q.question.trim()) {
                    Toast.show(`Por favor escribe el enunciado para la pregunta #${i + 1}`, 'warning');
                    return;
                }
                for (let optIdx = 0; optIdx < 4; optIdx++) {
                    if (!q.options[optIdx] || !q.options[optIdx].trim()) {
                        Toast.show(`Completa la opción ${['A','B','C','D'][optIdx]} de la pregunta #${i + 1}`, 'warning');
                        return;
                    }
                }
            }
        }

        const isEdit = !!id;
        const url = isEdit ? `${this.API_ACTIVITIES}/update.php` : `${this.API_ACTIVITIES}/create.php`;

        const payload = { 
            titulo, 
            tipo, 
            descripcion, 
            nota_maxima, 
            fecha_limite, 
            activa 
        };
        if (isEdit) payload.id = id;
        if (tipo === 'quiz' || tipo === 'mixta') {
            payload.preguntas = this.quizQuestions;
        }

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                Toast.show(isEdit ? 'Actividad actualizada' : 'Actividad y Quiz creados con éxito', 'success');
                const modalElem = document.getElementById('activityModal');
                const modal = bootstrap.Modal.getInstance(modalElem);
                if (modal) modal.hide();
                await this.loadActivities();
            } else {
                Toast.show(data.error || 'Error al guardar actividad', 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            Toast.show('Error de conexión', 'error');
        }
    },

    async toggleStatus(id, activa) {
        try {
            const res = await fetch(`${this.API_ACTIVITIES}/toggle.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id, activa: activa ? 1 : 0 })
            });
            const data = await res.json();
            if (data.success) {
                Toast.show(`Actividad ${activa ? 'activada' : 'pausada'}`, 'info');
                await this.loadActivities();
            } else {
                Toast.show(data.error || 'Error al cambiar estado', 'error');
                await this.loadActivities();
            }
        } catch (err) {
            console.error('Error toggling status:', err);
            Toast.show('Error de conexión', 'error');
        }
    },

    async confirmDelete(id, titulo) {
        if (!confirm(`¿Eliminar la actividad "${titulo}"? Se eliminarán también las entregas y notas asociadas.`)) {
            return;
        }

        try {
            const res = await fetch(`${this.API_ACTIVITIES}/delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                Toast.show('Actividad eliminada', 'success');
                await this.loadActivities();
            } else {
                Toast.show(data.error || 'No se pudo eliminar', 'error');
            }
        } catch (err) {
            console.error('Error deleting activity:', err);
            Toast.show('Error al intentar eliminar', 'error');
        }
    },

    // ── CALIFICACIONES (Docente califica entregas) ───────────
    async loadSubmissionsForGrading(actividadId = null) {
        const tableBody = document.getElementById('submissions-table-body');
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">Cargando entregas de estudiantes...</td></tr>`;
        }

        try {
            const url = actividadId 
                ? `${this.API_GRADES}/list.php?actividad_id=${actividadId}`
                : `${this.API_GRADES}/list.php`;
            const res = await fetch(url, { credentials: 'include' });
            const data = await res.json();

            if (data.success) {
                this.submissions = data.submissions || [];
                this.renderSubmissions();
            } else {
                Toast.show(data.error || 'Error al cargar entregas', 'error');
            }
        } catch (err) {
            console.error('Error cargando entregas:', err);
            Toast.show('Error de conexión al cargar entregas', 'error');
        }
    },

    renderSubmissions() {
        const tableBody = document.getElementById('submissions-table-body');
        if (!tableBody) return;

        const totalItems = this.submissions.length;
        const totalPages = Math.ceil(totalItems / this.subPageSize) || 1;
        if (this.subPage > totalPages) this.subPage = totalPages;

        if (totalItems === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No hay entregas pendientes para calificar.</td></tr>`;
            this.renderSubPagination(0, 1);
            return;
        }

        const startIndex = (this.subPage - 1) * this.subPageSize;
        const pageItems = this.submissions.slice(startIndex, startIndex + this.subPageSize);

        tableBody.innerHTML = pageItems.map(sub => {
            const hasGrade = sub.calificacion !== null && sub.calificacion !== undefined;
            const gradeBadge = hasGrade
                ? `<span class="badge" style="background:#10b981; color:#fff; font-size:0.85rem;">⭐ ${parseFloat(sub.calificacion).toFixed(2)} / ${parseFloat(sub.nota_maxima || 10).toFixed(0)}</span>`
                : `<span class="badge" style="background:#f59e0b; color:#fff; font-size:0.85rem;">⏳ Pendiente</span>`;

            return `
                <tr>
                    <td><strong>#${sub.id}</strong></td>
                    <td>
                        <div style="font-weight:600; color:var(--text-color);">${this.escape(sub.estudiante_nombre)} ${this.escape(sub.estudiante_apellido)}</div>
                        <small style="color:var(--text-muted);">${this.escape(sub.estudiante_email)}</small>
                    </td>
                    <td>
                        <div style="font-weight:500;">${this.escape(sub.actividad_titulo)}</div>
                    </td>
                    <td style="font-size:0.85rem; color:var(--text-muted);">
                        ${sub.entregado_en ? new Date(sub.entregado_en).toLocaleString('es-EC') : '—'}
                    </td>
                    <td>${gradeBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary" onclick="ActivitiesManager.viewContent(${sub.id})" title="Ver trabajo del estudiante">
                            👁️ Ver Respuesta
                        </button>
                    </td>
                    <td style="text-align:right;">
                        <button class="btn btn-sm btn-primary" onclick="ActivitiesManager.openGradeModal(${sub.id})" style="font-size:0.85rem;">
                            ${hasGrade ? '✏️ Modificar Nota' : '⭐ Asignar Nota'}
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderSubPagination(totalItems, totalPages);
    },

    renderSubPagination(totalItems, totalPages) {
        let container = document.getElementById('submissions-pagination');
        if (!container) {
            const tableCard = document.querySelector('.card .table-responsive')?.parentElement;
            if (tableCard) {
                container = document.createElement('div');
                container.id = 'submissions-pagination';
                tableCard.appendChild(container);
            } else return;
        }

        if (totalItems === 0) {
            container.innerHTML = '';
            return;
        }

        const start = (this.subPage - 1) * this.subPageSize + 1;
        const end = Math.min(this.subPage * this.subPageSize, totalItems);

        let html = `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem 1.25rem; border-top:1px solid var(--border-color); flex-wrap:wrap; gap:1rem; font-size:0.875rem;">
                <div style="color:var(--text-muted);">
                    Mostrando <strong>${start}-${end}</strong> de <strong>${totalItems}</strong> entregas
                </div>
                <div style="display:flex; align-items:center; gap:0.35rem;">
                    <button class="btn btn-sm btn-outline-secondary" ${this.subPage <= 1 ? 'disabled' : ''} onclick="ActivitiesManager.goToSubPage(${this.subPage - 1})">
                        ◀ Anterior
                    </button>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.subPage - 1 && i <= this.subPage + 1)) {
                html += `
                    <button class="btn btn-sm ${i === this.subPage ? 'btn-primary' : 'btn-outline-secondary'}" onclick="ActivitiesManager.goToSubPage(${i})" style="min-width:32px;">
                        ${i}
                    </button>
                `;
            } else if (i === this.subPage - 2 || i === this.subPage + 2) {
                html += `<span style="padding:0 0.25rem; color:var(--text-muted);">...</span>`;
            }
        }

        html += `
                    <button class="btn btn-sm btn-outline-secondary" ${this.subPage >= totalPages ? 'disabled' : ''} onclick="ActivitiesManager.goToSubPage(${this.subPage + 1})">
                        Siguiente ▶
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    },

    goToSubPage(page) {
        this.subPage = page;
        this.renderSubmissions();
    },

    viewContent(submissionId) {
        const sub = this.submissions.find(s => s.id == submissionId);
        if (!sub) return;

        let modalElem = document.getElementById('viewSubmissionModal');
        if (!modalElem) {
            this.injectViewSubmissionModal();
            modalElem = document.getElementById('viewSubmissionModal');
        }

        const hasGrade = sub.calificacion !== null && sub.calificacion !== undefined;
        const studentInitials = (sub.estudiante_nombre ? sub.estudiante_nombre.charAt(0) : 'E') + 
                                (sub.estudiante_apellido ? sub.estudiante_apellido.charAt(0) : '');

        const metaElem = document.getElementById('view-sub-meta');
        if (metaElem) metaElem.textContent = `Entrega #${sub.id} · Actividad #${sub.activity_id}`;

        const avatarElem = document.getElementById('view-sub-avatar');
        if (avatarElem) avatarElem.textContent = studentInitials.toUpperCase();

        const nameElem = document.getElementById('view-sub-student-name');
        if (nameElem) nameElem.textContent = `${sub.estudiante_nombre} ${sub.estudiante_apellido}`;

        const emailElem = document.getElementById('view-sub-student-email');
        if (emailElem) emailElem.textContent = sub.estudiante_email || 'Sin correo registrado';

        const actTitleElem = document.getElementById('view-sub-act-title');
        if (actTitleElem) actTitleElem.textContent = sub.actividad_titulo || 'Actividad Asignada';

        const dateStr = sub.entregado_en 
            ? new Date(sub.entregado_en).toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' })
            : 'Fecha no registrada';
        const dateElem = document.getElementById('view-sub-date');
        if (dateElem) dateElem.textContent = `📅 ${dateStr}`;

        // Badge de estado
        const badgeContainer = document.getElementById('view-sub-status-badge');
        if (badgeContainer) {
            if (hasGrade) {
                badgeContainer.innerHTML = `<span class="badge" style="background:#10b981; color:#fff; font-size:0.85rem; padding:0.4rem 0.75rem;">⭐ Calificado: ${parseFloat(sub.calificacion).toFixed(2)} / ${parseFloat(sub.nota_maxima || 10).toFixed(0)} pts</span>`;
            } else {
                badgeContainer.innerHTML = `<span class="badge" style="background:#f59e0b; color:#fff; font-size:0.85rem; padding:0.4rem 0.75rem;">⏳ Pendiente de Calificar</span>`;
            }
        }

        // Contenido / Texto
        const contentBox = document.getElementById('view-sub-content');
        if (contentBox) {
            if (sub.contenido && sub.contenido.trim() !== '') {
                contentBox.textContent = sub.contenido;
                contentBox.style.fontStyle = 'normal';
                contentBox.style.color = 'var(--text-color)';
            } else {
                contentBox.textContent = 'ℹ️ El estudiante no ingresó texto complementario (la tarea fue respondida mediante cuestionario interactivo o archivo adjunto).';
                contentBox.style.fontStyle = 'italic';
                contentBox.style.color = 'var(--text-muted)';
            }
        }

        // Archivo adjunto
        const fileContainer = document.getElementById('view-sub-file-container');
        if (fileContainer) {
            if (sub.archivo_url && sub.archivo_url.trim() !== '') {
                fileContainer.style.display = 'block';
                const filename = sub.archivo_url.split('/').pop() || 'archivo_adjunto';
                const filenameElem = document.getElementById('view-sub-filename');
                if (filenameElem) filenameElem.textContent = filename;
                const fileLink = document.getElementById('view-sub-filelink');
                if (fileLink) {
                    fileLink.href = sub.archivo_url;
                    fileLink.download = filename;
                }
            } else {
                fileContainer.style.display = 'none';
            }
        }

        // Retroalimentación previa
        const feedbackContainer = document.getElementById('view-sub-feedback-container');
        if (feedbackContainer) {
            if (hasGrade) {
                feedbackContainer.style.display = 'block';
                const gradeElem = document.getElementById('view-sub-feedback-grade');
                if (gradeElem) gradeElem.textContent = `⭐ Calificación registrada: ${parseFloat(sub.calificacion).toFixed(2)} / ${parseFloat(sub.nota_maxima || 10).toFixed(0)} pts`;
                
                const textElem = document.getElementById('view-sub-feedback-text');
                if (textElem) {
                    textElem.textContent = sub.retroalimentacion && sub.retroalimentacion.trim() !== '' 
                        ? `"${sub.retroalimentacion}"` 
                        : '(Sin comentarios adicionales del docente)';
                }
                
                const califDate = sub.calificado_en ? new Date(sub.calificado_en).toLocaleString('es-EC') : '';
                const dateNoteElem = document.getElementById('view-sub-feedback-date');
                if (dateNoteElem) dateNoteElem.textContent = califDate ? `Calificado el ${califDate}` : '';
            } else {
                feedbackContainer.style.display = 'none';
            }
        }

        // Botón de acción (Calificar / Modificar nota)
        const actionBtn = document.getElementById('view-sub-action-btn');
        if (actionBtn) {
            actionBtn.innerHTML = hasGrade ? '✏️ Modificar Calificación' : '⭐ Calificar Esta Entrega';
            actionBtn.onclick = () => {
                const bsViewModal = bootstrap.Modal.getInstance(modalElem);
                if (bsViewModal) bsViewModal.hide();
                setTimeout(() => {
                    this.openGradeModal(sub.id);
                }, 300);
            };
        }

        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElem);
            modal.show();
        }
    },

    injectViewSubmissionModal() {
        const div = document.createElement('div');
        div.innerHTML = `
            <div class="modal fade" id="viewSubmissionModal" tabindex="-1" aria-labelledby="viewSubmissionModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content" style="background:var(--surface); color:var(--text-color); border:1px solid var(--border-color); border-radius:var(--radius-lg); box-shadow:0 20px 40px rgba(0,0,0,0.18);">
                        <div class="modal-header" style="border-bottom:1px solid var(--border-color); padding:1.25rem 1.5rem;">
                            <div>
                                <h5 class="modal-title" id="viewSubmissionModalLabel" style="display:flex; align-items:center; gap:0.5rem; font-weight:700; margin:0;">
                                    <span>📄</span> Detalle de Entrega del Estudiante
                                </h5>
                                <small id="view-sub-meta" style="color:var(--text-muted); font-size:0.8rem;"></small>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="padding:1.5rem;">
                            <div style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.15rem 1.25rem; margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
                                <div style="display:flex; align-items:center; gap:0.9rem;">
                                    <div id="view-sub-avatar" style="width:48px; height:48px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.25rem; font-weight:700; box-shadow:0 4px 10px rgba(99,102,241,0.3);">
                                        C
                                    </div>
                                    <div>
                                        <h6 id="view-sub-student-name" style="margin:0; font-weight:700; color:var(--text-color); font-size:1.05rem;">Estudiante</h6>
                                        <div id="view-sub-student-email" style="font-size:0.82rem; color:var(--text-muted); margin-top:0.15rem;">email@sanlorenzo.edu.ec</div>
                                    </div>
                                </div>
                                <div style="text-align:right;">
                                    <div id="view-sub-status-badge"></div>
                                    <small id="view-sub-date" style="display:block; color:var(--text-muted); font-size:0.75rem; margin-top:0.35rem; font-weight:500;"></small>
                                </div>
                            </div>
                            <div style="margin-bottom:1.25rem; padding:0.85rem 1.1rem; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                                <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:700; color:var(--text-muted); display:block;">Actividad Correspondiente</span>
                                <h5 id="view-sub-act-title" style="margin:0.25rem 0 0; font-size:1.05rem; font-weight:700; color:var(--primary);">Título de la Actividad</h5>
                            </div>
                            <div style="margin-bottom:1.25rem;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>✍️</span> Respuesta y Contenido Enviado
                                </span>
                                <div id="view-sub-content" style="background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.25rem; font-size:0.92rem; line-height:1.65; white-space:pre-wrap; word-break:break-word; max-height:260px; overflow-y:auto; color:var(--text-color);">
                                    Contenido...
                                </div>
                            </div>
                            <div id="view-sub-file-container" style="display:none; margin-bottom:1.25rem;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>📎</span> Archivo Adjunto de la Entrega
                                </span>
                                <div style="background:var(--bg-secondary); border:1px dashed var(--border-color); border-radius:var(--radius-md); padding:0.85rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1rem;">
                                    <div style="display:flex; align-items:center; gap:0.65rem; overflow:hidden;">
                                        <span style="font-size:1.6rem;">📄</span>
                                        <span id="view-sub-filename" style="font-size:0.88rem; font-weight:600; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">archivo.pdf</span>
                                    </div>
                                    <a href="#" id="view-sub-filelink" target="_blank" class="btn btn-sm btn-outline-primary" style="white-space:nowrap; font-weight:600;">
                                        📥 Abrir / Descargar
                                    </a>
                                </div>
                            </div>
                            <div id="view-sub-feedback-container" style="display:none;">
                                <span style="font-size:0.88rem; font-weight:700; color:var(--text-color); display:flex; align-items:center; gap:0.4rem; margin-bottom:0.5rem;">
                                    <span>💬</span> Evaluación Registrada por el Docente
                                </span>
                                <div style="background:rgba(16, 185, 129, 0.08); border:1px solid rgba(16, 185, 129, 0.25); border-radius:var(--radius-md); padding:1rem 1.25rem;">
                                    <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem; flex-wrap:wrap; gap:0.5rem;">
                                        <strong id="view-sub-feedback-grade" style="color:#10b981; font-size:1.02rem;">⭐ 10.00 / 10 pts</strong>
                                        <small id="view-sub-feedback-date" style="color:var(--text-muted); font-size:0.75rem; font-weight:500;"></small>
                                    </div>
                                    <div id="view-sub-feedback-text" style="font-size:0.88rem; color:var(--text-color); font-style:italic; line-height:1.55;"></div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="border-top:1px solid var(--border-color); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button type="button" class="btn btn-primary" id="view-sub-action-btn">
                                ⭐ Asignar Calificación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(div.firstElementChild);
    },

    openGradeModal(submissionId) {
        const modalElem = document.getElementById('gradeModal');
        if (!modalElem) return;

        const sub = this.submissions.find(s => s.id == submissionId);
        if (!sub) return;

        document.getElementById('grade-sub-id').value = sub.id;
        document.getElementById('grade-student-name').textContent = `${sub.estudiante_nombre} ${sub.estudiante_apellido}`;
        document.getElementById('grade-act-title').textContent = sub.actividad_titulo;
        document.getElementById('grade-max-note').textContent = parseFloat(sub.nota_maxima || 10).toFixed(2);
        
        const notaInput = document.getElementById('grade-nota');
        notaInput.max = sub.nota_maxima || 10;
        notaInput.value = sub.calificacion !== null ? sub.calificacion : '';

        document.getElementById('grade-feedback').value = sub.retroalimentacion || '';

        const modal = new bootstrap.Modal(modalElem);
        modal.show();
    },

    async handleSaveGrade(e) {
        e.preventDefault();
        const submission_id = document.getElementById('grade-sub-id').value;
        const nota = parseFloat(document.getElementById('grade-nota').value);
        const retroalimentacion = document.getElementById('grade-feedback').value.trim();

        if (isNaN(nota) || nota < 0) {
            Toast.show('Por favor ingresa una nota válida mayor o igual a 0', 'warning');
            return;
        }

        try {
            const res = await fetch(`${this.API_GRADES}/assign.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    submission_id: submission_id,
                    nota,
                    retroalimentacion
                })
            });
            const data = await res.json();

            if (data.success) {
                Toast.show('¡Calificación asignada exitosamente! Se notificó al estudiante.', 'success');
                const modalElem = document.getElementById('gradeModal');
                const modal = bootstrap.Modal.getInstance(modalElem);
                if (modal) modal.hide();
                await this.loadSubmissionsForGrading();
            } else {
                Toast.show(data.error || 'Error al guardar calificación', 'error');
            }
        } catch (err) {
            console.error('Error guardando nota:', err);
            Toast.show('Error de conexión', 'error');
        }
    },

    escape(text) {
        if (!text) return '';
        return String(text).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    }
};

window.ActivitiesManager = ActivitiesManager;
