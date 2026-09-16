/**
 * Lengua y Literatura 9no EGB - Módulo de Reportes Académicos (Panel Docente)
 * Gestión de filtrado dinámico, cálculo de estadísticas y exportación a Excel, PDF y Word.
 */

const ReportsManager = {
    API_GRADES: '/api/grades/list.php',
    API_ACTIVITIES: '/api/activities/list.php',

    rawSubmissions: [],
    filteredSubmissions: [],
    activitiesList: [],
    currentUser: null,

    // Paginación y ordenamiento
    currentPage: 1,
    pageSize: 10,
    sortField: 'fecha',
    sortOrder: 'desc',

    // Filtros activos
    filters: {
        search: '',
        activityId: 'all',
        activityType: 'all',
        status: 'all',
        performance: 'all',
        dateFrom: '',
        dateTo: ''
    },

    async init(user = null) {
        this.currentUser = user;
        this.bindEvents();
        await Promise.all([
            this.loadActivities(),
            this.loadSubmissions()
        ]);
    },

    bindEvents() {
        // Buscador de texto
        const searchInput = document.getElementById('report-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value.trim().toLowerCase();
                this.applyFilters();
            });
        }

        // Filtro por Actividad
        const actSelect = document.getElementById('report-filter-activity');
        if (actSelect) {
            actSelect.addEventListener('change', (e) => {
                this.filters.activityId = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro por Tipo de Actividad
        const typeSelect = document.getElementById('report-filter-type');
        if (typeSelect) {
            typeSelect.addEventListener('change', (e) => {
                this.filters.activityType = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro por Estado
        const statusSelect = document.getElementById('report-filter-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Filtro por Rendimiento
        const perfSelect = document.getElementById('report-filter-performance');
        if (perfSelect) {
            perfSelect.addEventListener('change', (e) => {
                this.filters.performance = e.target.value;
                this.applyFilters();
            });
        }

        // Filtros de Fecha
        const dateFromInput = document.getElementById('report-date-from');
        if (dateFromInput) {
            dateFromInput.addEventListener('change', (e) => {
                this.filters.dateFrom = e.target.value;
                this.applyFilters();
            });
        }

        const dateToInput = document.getElementById('report-date-to');
        if (dateToInput) {
            dateToInput.addEventListener('change', (e) => {
                this.filters.dateTo = e.target.value;
                this.applyFilters();
            });
        }

        // Botón Restablecer
        const btnReset = document.getElementById('btn-reset-filters');
        if (btnReset) {
            btnReset.addEventListener('click', () => this.resetFilters());
        }

        // Selector de tamaño de página
        const pageSizeSelect = document.getElementById('report-page-size');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = e.target.value === 'all' ? 999999 : parseInt(e.target.value, 10);
                this.currentPage = 1;
                this.renderTable();
            });
        }

        // Botones de Exportación
        const btnExcel = document.getElementById('btn-export-excel');
        if (btnExcel) {
            btnExcel.addEventListener('click', () => this.exportToExcel());
        }

        const btnPdf = document.getElementById('btn-export-pdf');
        if (btnPdf) {
            btnPdf.addEventListener('click', () => this.exportToPDF());
        }

        const btnWord = document.getElementById('btn-export-word');
        if (btnWord) {
            btnWord.addEventListener('click', () => this.exportToWord());
        }

        const btnCsv = document.getElementById('btn-export-csv');
        if (btnCsv) {
            btnCsv.addEventListener('click', () => {
                const dateStr = new Date().toISOString().split('T')[0];
                const rows = this.filteredSubmissions.map((s, index) => {
                    const hasGrade = s.calificacion !== null && s.calificacion !== undefined;
                    const nota = hasGrade ? parseFloat(s.calificacion).toFixed(2) : 'Sin Calificar';
                    const estado = hasGrade ? 'Calificada' : 'Pendiente';
                    const escala = hasGrade ? this.getEscalaCualitativa(parseFloat(s.calificacion)) : 'N/A';

                    return {
                        'N°': index + 1,
                        'ID Entrega': s.id,
                        'Estudiante': `${s.estudiante_nombre} ${s.estudiante_apellido}`,
                        'Correo Institucional': s.estudiante_email,
                        'Actividad': s.actividad_titulo,
                        'Tipo': (s.actividad_tipo || 'archivo').toUpperCase(),
                        'Fecha de Entrega': s.entregado_en || 'N/A',
                        'Calificación (10.00)': nota,
                        'Escala Cualitativa': escala,
                        'Estado': estado,
                        'Observaciones Docente': s.retroalimentacion || 'Sin observaciones'
                    };
                });
                this.exportToCSV(rows, `Reporte_Calificaciones_Lengua9no_${dateStr}.csv`);
            });
        }

        const btnPrint = document.getElementById('btn-print-preview');
        if (btnPrint) {
            btnPrint.addEventListener('click', () => window.print());
        }
    },

    async loadActivities() {
        try {
            const res = await fetch(this.API_ACTIVITIES, { credentials: 'include' });
            const data = await res.json();
            if (data.success && Array.isArray(data.activities)) {
                this.activitiesList = data.activities;
                this.populateActivitySelect();
            }
        } catch (err) {
            console.warn('Advertencia al cargar actividades para filtros:', err);
        }
    },

    populateActivitySelect() {
        const select = document.getElementById('report-filter-activity');
        if (!select) return;

        let optionsHtml = `<option value="all">Todas las Actividades (${this.activitiesList.length})</option>`;
        this.activitiesList.forEach(act => {
            const tipoEmoji = act.tipo === 'quiz' ? '🎯' : (act.tipo === 'mixta' ? '🔀' : '📄');
            optionsHtml += `<option value="${act.id}">${tipoEmoji} #${act.id} - ${this.escape(act.titulo)}</option>`;
        });
        select.innerHTML = optionsHtml;
    },

    async loadSubmissions() {
        const tbody = document.getElementById('report-table-body');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:2.5rem; color:var(--text-muted);"><div class="spinner-border spinner-border-sm text-primary me-2"></div> Cargando registros y calificaciones del sistema...</td></tr>`;
        }

        try {
            const res = await fetch(this.API_GRADES, { credentials: 'include' });
            const data = await res.json();

            if (data.success && Array.isArray(data.submissions)) {
                this.rawSubmissions = data.submissions;
            } else {
                this.rawSubmissions = this.getMockSubmissions();
            }
        } catch (err) {
            console.warn('Error de conexión con API, utilizando respaldo de datos:', err);
            this.rawSubmissions = this.getMockSubmissions();
        }

        this.applyFilters();
    },

    getMockSubmissions() {
        return [
            {
                id: 101,
                activity_id: 1,
                actividad_titulo: "Taller 1: Análisis de Figuras Literarias en Poemas",
                actividad_tipo: "archivo",
                estudiante_id: 3,
                estudiante_nombre: "Carlos",
                estudiante_apellido: "Mendoza",
                estudiante_email: "estudiante@demo.com",
                entregado_en: "2026-09-12 14:30:00",
                estado: "calificada",
                calificacion: "9.50",
                nota_maxima: "10.00",
                retroalimentacion: "Excelente identificación de metáforas e hipérboles en el texto lírico."
            },
            {
                id: 102,
                activity_id: 2,
                actividad_titulo: "Quiz Interactivo 1: Métrica, Rima y Recursos Estilísticos",
                actividad_tipo: "quiz",
                estudiante_id: 3,
                estudiante_nombre: "Carlos",
                estudiante_apellido: "Mendoza",
                estudiante_email: "estudiante@demo.com",
                entregado_en: "2026-09-13 10:15:00",
                estado: "calificada",
                calificacion: "10.00",
                nota_maxima: "10.00",
                retroalimentacion: "Calificación automática 100% de aciertos. Felicitaciones."
            },
            {
                id: 103,
                activity_id: 1,
                actividad_titulo: "Taller 1: Análisis de Figuras Literarias en Poemas",
                actividad_tipo: "archivo",
                estudiante_id: 4,
                estudiante_nombre: "María",
                estudiante_apellido: "Fernández",
                estudiante_email: "maria.fernandez@sanlorenzo.edu.ec",
                entregado_en: "2026-09-13 16:20:00",
                estado: "calificada",
                calificacion: "8.50",
                nota_maxima: "10.00",
                retroalimentacion: "Buen trabajo. Cuidar la ortografía acentual en versos agudos."
            },
            {
                id: 104,
                activity_id: 2,
                actividad_titulo: "Quiz Interactivo 1: Métrica, Rima y Recursos Estilísticos",
                actividad_tipo: "quiz",
                estudiante_id: 4,
                estudiante_nombre: "María",
                estudiante_apellido: "Fernández",
                estudiante_email: "maria.fernandez@sanlorenzo.edu.ec",
                entregado_en: "2026-09-14 09:40:00",
                estado: "calificada",
                calificacion: "7.50",
                nota_maxima: "10.00",
                retroalimentacion: "Revisar los conceptos de rima consonante y asonante."
            },
            {
                id: 105,
                activity_id: 1,
                actividad_titulo: "Taller 1: Análisis de Figuras Literarias en Poemas",
                actividad_tipo: "archivo",
                estudiante_id: 5,
                estudiante_nombre: "Mateo",
                estudiante_apellido: "Guerrero",
                estudiante_email: "mateo.guerrero@sanlorenzo.edu.ec",
                entregado_en: "2026-09-14 18:05:00",
                estado: "calificada",
                calificacion: "6.00",
                nota_maxima: "10.00",
                retroalimentacion: "Requiere refuerzo pedagógico en la estructura del poema y licencias poéticas."
            },
            {
                id: 106,
                activity_id: 3,
                actividad_titulo: "Ensayo Argumentativo: El Impacto de la Tecnología",
                actividad_tipo: "mixta",
                estudiante_id: 3,
                estudiante_nombre: "Carlos",
                estudiante_apellido: "Mendoza",
                estudiante_email: "estudiante@demo.com",
                entregado_en: "2026-09-15 11:00:00",
                estado: "entregada",
                calificacion: null,
                nota_maxima: "10.00",
                retroalimentacion: null
            },
            {
                id: 107,
                activity_id: 3,
                actividad_titulo: "Ensayo Argumentativo: El Impacto de la Tecnología",
                actividad_tipo: "mixta",
                estudiante_id: 5,
                estudiante_nombre: "Mateo",
                estudiante_apellido: "Guerrero",
                estudiante_email: "mateo.guerrero@sanlorenzo.edu.ec",
                entregado_en: "2026-09-15 13:45:00",
                estado: "entregada",
                calificacion: null,
                nota_maxima: "10.00",
                retroalimentacion: null
            },
            {
                id: 108,
                activity_id: 2,
                actividad_titulo: "Quiz Interactivo 1: Métrica, Rima y Recursos Estilísticos",
                actividad_tipo: "quiz",
                estudiante_id: 6,
                estudiante_nombre: "Valeria",
                estudiante_apellido: "Ríos",
                estudiante_email: "valeria.rios@sanlorenzo.edu.ec",
                entregado_en: "2026-09-15 15:10:00",
                estado: "calificada",
                calificacion: "9.00",
                nota_maxima: "10.00",
                retroalimentacion: "Muy buen desempeño en el cuestionario interactivo."
            }
        ];
    },

    applyFilters() {
        this.filteredSubmissions = this.rawSubmissions.filter(sub => {
            // Filtro de Búsqueda
            if (this.filters.search) {
                const fullName = `${sub.estudiante_nombre || ''} ${sub.estudiante_apellido || ''}`.toLowerCase();
                const email = (sub.estudiante_email || '').toLowerCase();
                const actTitle = (sub.actividad_titulo || '').toLowerCase();
                if (!fullName.includes(this.filters.search) && !email.includes(this.filters.search) && !actTitle.includes(this.filters.search)) {
                    return false;
                }
            }

            // Filtro por Actividad
            if (this.filters.activityId !== 'all') {
                if (String(sub.activity_id) !== String(this.filters.activityId)) {
                    return false;
                }
            }

            // Filtro por Tipo de Actividad
            if (this.filters.activityType !== 'all') {
                const actTipo = sub.actividad_tipo || 'archivo';
                if (actTipo !== this.filters.activityType) {
                    return false;
                }
            }

            // Filtro por Estado
            if (this.filters.status !== 'all') {
                const isCalificada = sub.calificacion !== null && sub.calificacion !== undefined && sub.estado === 'calificada';
                if (this.filters.status === 'calificada' && !isCalificada) return false;
                if (this.filters.status === 'pendiente' && isCalificada) return false;
            }

            // Filtro por Rendimiento
            if (this.filters.performance !== 'all') {
                const hasGrade = sub.calificacion !== null && sub.calificacion !== undefined;
                const grade = hasGrade ? parseFloat(sub.calificacion) : null;

                if (this.filters.performance === 'sobresaliente') {
                    if (grade === null || grade < 9.00) return false;
                } else if (this.filters.performance === 'muy_bueno') {
                    if (grade === null || grade < 8.00 || grade >= 9.00) return false;
                } else if (this.filters.performance === 'bueno') {
                    if (grade === null || grade < 7.00 || grade >= 8.00) return false;
                } else if (this.filters.performance === 'refuerzo') {
                    if (grade === null || grade >= 7.00) return false;
                } else if (this.filters.performance === 'sin_calificar') {
                    if (hasGrade) return false;
                }
            }

            // Filtro por Rango de Fechas
            if (this.filters.dateFrom) {
                const subDate = new Date(sub.entregado_en);
                const fromDate = new Date(this.filters.dateFrom + 'T00:00:00');
                if (subDate < fromDate) return false;
            }

            if (this.filters.dateTo) {
                const subDate = new Date(sub.entregado_en);
                const toDate = new Date(this.filters.dateTo + 'T23:59:59');
                if (subDate > toDate) return false;
            }

            return true;
        });

        // Ordenamiento
        this.sortData();

        // Actualizar KPIs y Tabla
        this.updateKPIs();
        this.currentPage = 1;
        this.renderTable();
    },

    sortData() {
        this.filteredSubmissions.sort((a, b) => {
            let valA, valB;
            if (this.sortField === 'estudiante') {
                valA = `${a.estudiante_apellido} ${a.estudiante_nombre}`.toLowerCase();
                valB = `${b.estudiante_apellido} ${b.estudiante_nombre}`.toLowerCase();
            } else if (this.sortField === 'actividad') {
                valA = (a.actividad_titulo || '').toLowerCase();
                valB = (b.actividad_titulo || '').toLowerCase();
            } else if (this.sortField === 'nota') {
                valA = a.calificacion !== null ? parseFloat(a.calificacion) : -1;
                valB = b.calificacion !== null ? parseFloat(b.calificacion) : -1;
            } else { // 'fecha' por defecto
                valA = new Date(a.entregado_en || 0).getTime();
                valB = new Date(b.entregado_en || 0).getTime();
            }

            if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    },

    setSort(field) {
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortOrder = (field === 'nota' || field === 'fecha') ? 'desc' : 'asc';
        }
        this.sortData();
        this.renderTable();
        this.updateSortHeaders();
    },

    updateSortHeaders() {
        ['estudiante', 'actividad', 'fecha', 'nota'].forEach(field => {
            const th = document.getElementById(`th-${field}`);
            if (th) {
                th.classList.remove('sorted-asc', 'sorted-desc');
                if (this.sortField === field) {
                    th.classList.add(this.sortOrder === 'asc' ? 'sorted-asc' : 'sorted-desc');
                }
            }
        });
    },

    resetFilters() {
        this.filters = {
            search: '',
            activityId: 'all',
            activityType: 'all',
            status: 'all',
            performance: 'all',
            dateFrom: '',
            dateTo: ''
        };

        const searchEl = document.getElementById('report-search');
        if (searchEl) searchEl.value = '';

        const actEl = document.getElementById('report-filter-activity');
        if (actEl) actEl.value = 'all';

        const typeEl = document.getElementById('report-filter-type');
        if (typeEl) typeEl.value = 'all';

        const statusEl = document.getElementById('report-filter-status');
        if (statusEl) statusEl.value = 'all';

        const perfEl = document.getElementById('report-filter-performance');
        if (perfEl) perfEl.value = 'all';

        const fromEl = document.getElementById('report-date-from');
        if (fromEl) fromEl.value = '';

        const toEl = document.getElementById('report-date-to');
        if (toEl) toEl.value = '';

        this.applyFilters();
        if (typeof Toast !== 'undefined') {
            Toast.show('Filtros restablecidos', 'info');
        }
    },

    updateKPIs() {
        const total = this.filteredSubmissions.length;
        const totalRaw = this.rawSubmissions.length;

        const graded = this.filteredSubmissions.filter(s => s.calificacion !== null && s.calificacion !== undefined);
        const pending = this.filteredSubmissions.filter(s => s.calificacion === null || s.calificacion === undefined);

        let sumGrade = 0;
        let passingCount = 0;

        graded.forEach(s => {
            const grade = parseFloat(s.calificacion);
            sumGrade += grade;
            if (grade >= 7.00) passingCount++;
        });

        const avgGrade = graded.length > 0 ? (sumGrade / graded.length).toFixed(2) : '—';
        const passRate = graded.length > 0 ? ((passingCount / graded.length) * 100).toFixed(1) + '%' : '—';

        // Elementos DOM
        const kpiTotal = document.getElementById('kpi-total-entregas');
        if (kpiTotal) kpiTotal.textContent = total;

        const kpiTotalSubtitle = document.getElementById('kpi-total-subtitle');
        if (kpiTotalSubtitle) {
            kpiTotalSubtitle.textContent = `De ${totalRaw} entregas registradas`;
        }

        const kpiPromedio = document.getElementById('kpi-promedio-general');
        if (kpiPromedio) {
            kpiPromedio.textContent = avgGrade !== '—' ? `${avgGrade} / 10` : '—';
            kpiPromedio.style.color = avgGrade !== '—' 
                ? (parseFloat(avgGrade) >= 8.5 ? '#10b981' : (parseFloat(avgGrade) >= 7.0 ? '#f59e0b' : '#ef4444'))
                : 'inherit';
        }

        const kpiAprobacion = document.getElementById('kpi-tasa-aprobacion');
        if (kpiAprobacion) kpiAprobacion.textContent = passRate;

        const kpiPendientes = document.getElementById('kpi-pendientes');
        if (kpiPendientes) kpiPendientes.textContent = pending.length;
    },

    renderTable() {
        const tbody = document.getElementById('report-table-body');
        if (!tbody) return;

        const totalItems = this.filteredSubmissions.length;
        const totalPages = Math.ceil(totalItems / this.pageSize) || 1;
        if (this.currentPage > totalPages) this.currentPage = totalPages;

        if (totalItems === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center; padding:3rem 1.5rem; color:var(--text-muted);">
                        <div style="font-size:2.5rem; margin-bottom:0.75rem;">🔍</div>
                        <h5 style="color:var(--text-color); margin-bottom:0.25rem;">No se encontraron registros</h5>
                        <p style="font-size:0.88rem; margin:0;">Intenta ajustar o limpiar los filtros seleccionados para ver más resultados.</p>
                        <button class="btn btn-sm btn-outline-primary mt-3" onclick="ReportsManager.resetFilters()">Restablecer Filtros</button>
                    </td>
                </tr>
            `;
            this.renderPagination(0, 1);
            return;
        }

        const startIndex = (this.currentPage - 1) * this.pageSize;
        const pageItems = this.filteredSubmissions.slice(startIndex, startIndex + this.pageSize);

        tbody.innerHTML = pageItems.map(sub => {
            const hasGrade = sub.calificacion !== null && sub.calificacion !== undefined;
            const gradeNum = hasGrade ? parseFloat(sub.calificacion) : 0;
            const maxNote = parseFloat(sub.nota_maxima || 10).toFixed(0);

            // Badge de Calificación
            let gradeBadge = '';
            if (hasGrade) {
                if (gradeNum >= 9.0) {
                    gradeBadge = `<span class="badge" style="background:#10b981; color:#fff; font-weight:700; font-size:0.85rem;">⭐ ${gradeNum.toFixed(2)} / ${maxNote}</span>`;
                } else if (gradeNum >= 7.0) {
                    gradeBadge = `<span class="badge" style="background:#0284c7; color:#fff; font-weight:700; font-size:0.85rem;">👍 ${gradeNum.toFixed(2)} / ${maxNote}</span>`;
                } else {
                    gradeBadge = `<span class="badge" style="background:#ef4444; color:#fff; font-weight:700; font-size:0.85rem;">⚠️ ${gradeNum.toFixed(2)} / ${maxNote}</span>`;
                }
            } else {
                gradeBadge = `<span class="badge" style="background:#f59e0b; color:#fff; font-weight:600; font-size:0.82rem;">⏳ Pendiente</span>`;
            }

            // Tipo de actividad badge
            let tipoBadge = '';
            const actTipo = sub.actividad_tipo || 'archivo';
            if (actTipo === 'quiz') {
                tipoBadge = `<span class="badge" style="background:rgba(139,92,246,0.15); color:#7c3aed; font-size:0.75rem; font-weight:600;">🎯 Quiz</span>`;
            } else if (actTipo === 'mixta') {
                tipoBadge = `<span class="badge" style="background:rgba(245,158,11,0.15); color:#b45309; font-size:0.75rem; font-weight:600;">🔀 Mixta</span>`;
            } else {
                tipoBadge = `<span class="badge" style="background:rgba(100,116,139,0.15); color:#475569; font-size:0.75rem; font-weight:600;">📄 Tarea</span>`;
            }

            // Formato de fecha
            const dateFormatted = sub.entregado_en 
                ? new Date(sub.entregado_en).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' })
                : '—';

            const avatarLetter = (sub.estudiante_nombre || 'E').charAt(0).toUpperCase();

            const feedbackPreview = sub.retroalimentacion 
                ? `<span title="${this.escape(sub.retroalimentacion)}" style="color:var(--text-muted); font-size:0.82rem; font-style:italic; display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">💬 "${this.escape(sub.retroalimentacion)}"</span>`
                : `<span style="color:var(--text-muted); font-size:0.8rem;">Sin observaciones</span>`;

            return `
                <tr>
                    <td style="font-size:0.85rem; color:var(--text-muted);"><strong>#${sub.id}</strong></td>
                    <td>
                        <div style="display:flex; align-items:center; gap:0.65rem;">
                            <div style="width:34px; height:34px; border-radius:50%; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; flex-shrink:0;">
                                ${avatarLetter}
                            </div>
                            <div>
                                <div style="font-weight:600; color:var(--text-color); font-size:0.92rem;">
                                    ${this.escape(sub.estudiante_nombre)} ${this.escape(sub.estudiante_apellido)}
                                </div>
                                <small style="color:var(--text-muted); font-size:0.78rem;">${this.escape(sub.estudiante_email)}</small>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div style="font-weight:600; color:var(--text-color); font-size:0.88rem; max-width:280px;">
                            ${this.escape(sub.actividad_titulo)}
                        </div>
                        <div class="mt-1">${tipoBadge}</div>
                    </td>
                    <td style="font-size:0.85rem; color:var(--text-muted); white-space:nowrap;">
                        📅 ${dateFormatted}
                    </td>
                    <td>
                        ${hasGrade 
                            ? `<span class="badge" style="background:rgba(16,185,129,0.15); color:#059669; font-size:0.75rem; font-weight:600;">✅ Evaluada</span>`
                            : `<span class="badge" style="background:rgba(245,158,11,0.15); color:#d97706; font-size:0.75rem; font-weight:600;">⏳ Por Calificar</span>`
                        }
                    </td>
                    <td>
                        <div>${gradeBadge}</div>
                    </td>
                    <td>
                        ${feedbackPreview}
                    </td>
                    <td style="text-align:right; white-space:nowrap;">
                        <a href="calificar.html?actividad_id=${sub.activity_id}" class="btn btn-sm btn-outline-primary" style="font-size:0.78rem; padding:0.25rem 0.6rem;" title="Gestionar calificación">
                            ✏️ Calificar
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination(totalItems, totalPages);
    },

    renderPagination(totalItems, totalPages) {
        const pagContainer = document.getElementById('report-pagination');
        const infoContainer = document.getElementById('report-pagination-info');

        if (infoContainer) {
            if (totalItems === 0) {
                infoContainer.textContent = 'Mostrando 0 registros';
            } else {
                const start = (this.currentPage - 1) * this.pageSize + 1;
                const end = Math.min(this.currentPage * this.pageSize, totalItems);
                infoContainer.textContent = `Mostrando ${start} a ${end} de ${totalItems} entregas`;
            }
        }

        if (!pagContainer) return;

        if (totalPages <= 1) {
            pagContainer.innerHTML = '';
            return;
        }

        let html = `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="ReportsManager.goToPage(${this.currentPage - 1})" aria-label="Anterior">«</button>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                html += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <button class="page-link" onclick="ReportsManager.goToPage(${i})">${i}</button>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        html += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="ReportsManager.goToPage(${this.currentPage + 1})" aria-label="Siguiente">»</button>
            </li>
        `;

        pagContainer.innerHTML = html;
    },

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredSubmissions.length / this.pageSize) || 1;
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
        window.scrollTo({ top: 400, behavior: 'smooth' });
    },

    /**
     * Descarga de archivos a prueba de fallos en cualquier navegador (Edge/Chrome/Windows).
     * Utiliza el endpoint del servidor /api/grades/download_file.php para enviar
     * Content-Disposition: attachment; filename="..." garantizando el nombre y extensión exacta.
     */
    downloadViaServer(base64Data, filename, mimeType) {
        try {
            let form = document.getElementById('server-export-download-form');
            if (!form) {
                form = document.createElement('form');
                form.id = 'server-export-download-form';
                form.method = 'POST';
                form.action = '/api/grades/download_file.php';
                form.style.display = 'none';

                const inputFn = document.createElement('input');
                inputFn.type = 'hidden';
                inputFn.name = 'filename';
                inputFn.id = 'server-export-filename';
                form.appendChild(inputFn);

                const inputMime = document.createElement('input');
                inputMime.type = 'hidden';
                inputMime.name = 'mime_type';
                inputMime.id = 'server-export-mime';
                form.appendChild(inputMime);

                const inputData = document.createElement('input');
                inputData.type = 'hidden';
                inputData.name = 'data';
                inputData.id = 'server-export-data';
                form.appendChild(inputData);

                document.body.appendChild(form);
            }

            document.getElementById('server-export-filename').value = filename;
            document.getElementById('server-export-mime').value = mimeType;
            document.getElementById('server-export-data').value = base64Data;
            form.submit();
            return true;
        } catch (err) {
            console.error('Error enviando formulario de descarga:', err);
            return false;
        }
    },

    // ══════════════════════════════════════════════════════════
    // EXPORTACIONES: EXCEL, PDF Y WORD
    // ══════════════════════════════════════════════════════════

    /**
     * Exportación a Excel (.xlsx) con SheetJS y descarga con nombre real
     */
    exportToExcel() {
        if (this.filteredSubmissions.length === 0) {
            if (typeof Toast !== 'undefined') Toast.show('No hay datos filtrados para exportar', 'warning');
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const teacherName = this.currentUser ? `${this.currentUser.nombre} ${this.currentUser.apellido}` : 'Docente Responsable';

        // 1. Preparar filas detalladas
        const rows = this.filteredSubmissions.map((s, index) => {
            const hasGrade = s.calificacion !== null && s.calificacion !== undefined;
            const nota = hasGrade ? parseFloat(s.calificacion).toFixed(2) : 'Sin Calificar';
            const estado = hasGrade ? 'Calificada' : 'Pendiente';
            const escala = hasGrade ? this.getEscalaCualitativa(parseFloat(s.calificacion)) : 'N/A';

            return {
                'N°': index + 1,
                'ID Entrega': s.id,
                'Estudiante': `${s.estudiante_nombre} ${s.estudiante_apellido}`,
                'Correo Institucional': s.estudiante_email,
                'Actividad': s.actividad_titulo,
                'Tipo': (s.actividad_tipo || 'archivo').toUpperCase(),
                'Fecha de Entrega': s.entregado_en || 'N/A',
                'Calificación (10.00)': nota,
                'Escala Cualitativa': escala,
                'Estado': estado,
                'Observaciones Docente': s.retroalimentacion || 'Sin observaciones'
            };
        });

        // Verificar si la librería XLSX está disponible
        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();

            // Hoja 1: Detalle de Calificaciones
            const wsDetalle = XLSX.utils.json_to_sheet(rows);

            // Anchos sugeridos de columnas
            wsDetalle['!cols'] = [
                { wch: 5 },   // N°
                { wch: 12 },  // ID Entrega
                { wch: 28 },  // Estudiante
                { wch: 32 },  // Correo
                { wch: 38 },  // Actividad
                { wch: 12 },  // Tipo
                { wch: 20 },  // Fecha
                { wch: 18 },  // Calificación
                { wch: 22 },  // Escala
                { wch: 14 },  // Estado
                { wch: 45 }   // Observaciones
            ];

            XLSX.utils.book_append_sheet(wb, wsDetalle, "Sábana de Calificaciones");

            // Hoja 2: Resumen Ejecutivo y KPIs
            const graded = this.filteredSubmissions.filter(s => s.calificacion !== null);
            let sumGrade = 0, passed = 0;
            graded.forEach(s => {
                const g = parseFloat(s.calificacion);
                sumGrade += g;
                if (g >= 7.0) passed++;
            });
            const avg = graded.length > 0 ? (sumGrade / graded.length).toFixed(2) : 'N/A';
            const passPct = graded.length > 0 ? ((passed / graded.length) * 100).toFixed(1) + '%' : 'N/A';

            const resumenRows = [
                { "Parámetro": "Institución Educativa", "Valor": "Unidad Educativa Fiscomisional San Lorenzo" },
                { "Parámetro": "Asignatura", "Valor": "Lengua y Literatura - 9no Grado EGB" },
                { "Parámetro": "Docente Responsable", "Valor": teacherName },
                { "Parámetro": "Fecha de Emisión", "Valor": new Date().toLocaleString('es-EC') },
                { "Parámetro": "Total de Entregas Filtradas", "Valor": this.filteredSubmissions.length },
                { "Parámetro": "Total Entregas Calificadas", "Valor": graded.length },
                { "Parámetro": "Entregas Pendientes", "Valor": this.filteredSubmissions.length - graded.length },
                { "Parámetro": "Promedio General del Curso", "Valor": `${avg} / 10.00` },
                { "Parámetro": "Tasa de Aprobación (>= 7.00)", "Valor": passPct }
            ];

            const wsResumen = XLSX.utils.json_to_sheet(resumenRows);
            wsResumen['!cols'] = [{ wch: 32 }, { wch: 45 }];
            XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Ejecutivo");

            // Generar en base64 y descargar a través del servidor para nombre y extensión garantizados
            const b64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
            const filename = `Reporte_Calificaciones_Lengua9no_${dateStr}.xlsx`;
            const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

            this.downloadViaServer(b64Data, filename, mime);
            if (typeof Toast !== 'undefined') Toast.show('Excel generado y descargado con éxito (.xlsx)', 'success');
        } else {
            // Fallback a descarga desde servidor
            window.location.href = `/api/grades/export.php?format=excel`;
        }
    },

    exportToCSV(rows, filename) {
        if (!rows.length) return;
        const headers = Object.keys(rows[0]);
        const csvContent = [
            "\uFEFF" + headers.join(";"), // UTF-8 BOM para apertura correcta en Excel
            ...rows.map(row => headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(";"))
        ].join("\r\n");

        const base64Data = btoa(unescape(encodeURIComponent(csvContent)));
        this.downloadViaServer(base64Data, filename, 'text/csv;charset=utf-8;');
    },

    /**
     * Exportación a Word (.doc) con descarga garantizada
     */
    exportToWord() {
        if (this.filteredSubmissions.length === 0) {
            if (typeof Toast !== 'undefined') Toast.show('No hay datos filtrados para exportar', 'warning');
            return;
        }

        const dateStr = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });
        const teacherName = this.currentUser ? `${this.currentUser.nombre} ${this.currentUser.apellido}` : 'Docente Responsable';

        // Calcular estadísticas
        const graded = this.filteredSubmissions.filter(s => s.calificacion !== null);
        let sumGrade = 0, passed = 0;
        graded.forEach(s => {
            const g = parseFloat(s.calificacion);
            sumGrade += g;
            if (g >= 7.0) passed++;
        });
        const avg = graded.length > 0 ? (sumGrade / graded.length).toFixed(2) : 'N/A';
        const passPct = graded.length > 0 ? ((passed / graded.length) * 100).toFixed(1) + '%' : 'N/A';

        // Filas HTML de la tabla
        let tableRowsHtml = '';
        this.filteredSubmissions.forEach((s, idx) => {
            const hasGrade = s.calificacion !== null && s.calificacion !== undefined;
            const nota = hasGrade ? parseFloat(s.calificacion).toFixed(2) : 'Pendiente';
            const escala = hasGrade ? this.getEscalaCualitativa(parseFloat(s.calificacion)) : 'Sin calificación';

            tableRowsHtml += `
                <tr style="background-color:${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="padding:6px; border:1px solid #cbd5e1; text-align:center;">${idx + 1}</td>
                    <td style="padding:6px; border:1px solid #cbd5e1; font-weight:bold;">${this.escape(s.estudiante_nombre)} ${this.escape(s.estudiante_apellido)}<br><small style="color:#64748b; font-weight:normal;">${this.escape(s.estudiante_email)}</small></td>
                    <td style="padding:6px; border:1px solid #cbd5e1;">${this.escape(s.actividad_titulo)}<br><span style="font-size:10px; color:#475569;">[${(s.actividad_tipo || 'archivo').toUpperCase()}]</span></td>
                    <td style="padding:6px; border:1px solid #cbd5e1; text-align:center;">${s.entregado_en || '—'}</td>
                    <td style="padding:6px; border:1px solid #cbd5e1; text-align:center; font-weight:bold; color:${hasGrade ? '#1e293b' : '#d97706'}; font-size:13px;">${nota}</td>
                    <td style="padding:6px; border:1px solid #cbd5e1; text-align:center; font-size:11px;">${escala}</td>
                    <td style="padding:6px; border:1px solid #cbd5e1; font-size:11px; color:#334155;">${this.escape(s.retroalimentacion || 'Sin observaciones')}</td>
                </tr>
            `;
        });

        // Contenido completo de Word con namespaces MS Office
        const wordHtml = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>Reporte Académico - Lengua y Literatura 9no EGB</title>
                <style>
                    body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; margin: 2cm; }
                    h1 { color: #1e3a8a; font-size: 16pt; text-align: center; margin-bottom: 4px; text-transform: uppercase; }
                    h2 { color: #3b82f6; font-size: 13pt; text-align: center; margin-top: 0; margin-bottom: 20px; }
                    .header-box { border: 2px solid #1e3a8a; background-color: #f1f5f9; padding: 12px; margin-bottom: 20px; border-radius: 4px; }
                    .header-grid { width: 100%; border-collapse: collapse; }
                    .header-grid td { padding: 4px 8px; font-size: 10pt; }
                    .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .kpi-table td { border: 1px solid #cbd5e1; padding: 8px; text-align: center; background-color: #f8fafc; }
                    .kpi-title { font-size: 9pt; color: #64748b; text-transform: uppercase; font-weight: bold; }
                    .kpi-val { font-size: 14pt; color: #1e3a8a; font-weight: bold; margin-top: 4px; }
                    .data-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10pt; }
                    .data-table th { background-color: #1e3a8a; color: #ffffff; padding: 8px 6px; border: 1px solid #1e3a8a; font-size: 10pt; text-align: center; }
                    .signatures { width: 100%; margin-top: 60px; border-collapse: collapse; }
                    .signatures td { width: 50%; text-align: center; padding: 20px 40px; }
                    .sig-line { border-top: 1px solid #475569; width: 80%; margin: 0 auto 6px auto; }
                </style>
            </head>
            <body>
                <h1>UNIDAD EDUCATIVA FISCOMISIONAL SAN LORENZO</h1>
                <h2>INFORME Y SÁBANA DE CALIFICACIONES - LENGUA Y LITERATURA 9º EGB</h2>

                <div class="header-box">
                    <table class="header-grid">
                        <tr>
                            <td><strong>Docente:</strong> ${teacherName}</td>
                            <td><strong>Fecha de Emisión:</strong> ${dateStr}</td>
                        </tr>
                        <tr>
                            <td><strong>Asignatura:</strong> Lengua y Literatura</td>
                            <td><strong>Año de Educación:</strong> Noveno Grado EGB</td>
                        </tr>
                        <tr>
                            <td><strong>Período Lectivo:</strong> 2026 - Régimen Escolar</td>
                            <td><strong>Total Evaluaciones:</strong> ${this.filteredSubmissions.length} entregas</td>
                        </tr>
                    </table>
                </div>

                <table class="kpi-table">
                    <tr>
                        <td>
                            <div class="kpi-title">Total Entregas</div>
                            <div class="kpi-val">${this.filteredSubmissions.length}</div>
                        </td>
                        <td>
                            <div class="kpi-title">Promedio General</div>
                            <div class="kpi-val">${avg} / 10</div>
                        </td>
                        <td>
                            <div class="kpi-title">Tasa de Aprobación</div>
                            <div class="kpi-val">${passPct}</div>
                        </td>
                        <td>
                            <div class="kpi-title">Pendientes</div>
                            <div class="kpi-val">${this.filteredSubmissions.length - graded.length}</div>
                        </td>
                    </tr>
                </table>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width:4%;">#</th>
                            <th style="width:24%;">Estudiante</th>
                            <th style="width:26%;">Actividad / Tarea</th>
                            <th style="width:14%;">Fecha Entrega</th>
                            <th style="width:9%;">Nota /10</th>
                            <th style="width:11%;">Cualitativa</th>
                            <th style="width:12%;">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml}
                    </tbody>
                </table>

                <table class="signatures">
                    <tr>
                        <td>
                            <div class="sig-line"></div>
                            <strong>${teacherName}</strong><br>
                            Docente de Lengua y Literatura
                        </td>
                        <td>
                            <div class="sig-line"></div>
                            <strong>Rectorado / Inspección General</strong><br>
                            U.E.F. San Lorenzo
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;

        const fileDate = new Date().toISOString().split('T')[0];
        const base64Data = btoa(unescape(encodeURIComponent('\ufeff' + wordHtml)));
        const filename = `Informe_Academico_Lengua9no_${fileDate}.doc`;
        const mime = 'application/msword';

        this.downloadViaServer(base64Data, filename, mime);

        if (typeof Toast !== 'undefined') {
            Toast.show('Documento de Word (.doc) generado y descargado', 'success');
        }
    },

    /**
     * Exportación a PDF (.pdf) formal con descarga de archivo garantizada
     */
    exportToPDF() {
        if (this.filteredSubmissions.length === 0) {
            if (typeof Toast !== 'undefined') Toast.show('No hay datos filtrados para exportar', 'warning');
            return;
        }

        const teacherName = this.currentUser ? `${this.currentUser.nombre} ${this.currentUser.apellido}` : 'Docente Responsable';
        const fileDate = new Date().toISOString().split('T')[0];
        const dateStr = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

        // Estadísticas
        const graded = this.filteredSubmissions.filter(s => s.calificacion !== null);
        let sumGrade = 0, passed = 0;
        graded.forEach(s => {
            const g = parseFloat(s.calificacion);
            sumGrade += g;
            if (g >= 7.0) passed++;
        });
        const avg = graded.length > 0 ? (sumGrade / graded.length).toFixed(2) : 'N/A';
        const passPct = graded.length > 0 ? ((passed / graded.length) * 100).toFixed(1) + '%' : 'N/A';

        // 1. Preparar HTML estructurado para el reporte PDF
        const printContainer = document.getElementById('printable-report-content');
        let rowsHtml = '';
        this.filteredSubmissions.forEach((s, i) => {
            const hasGrade = s.calificacion !== null && s.calificacion !== undefined;
            const nota = hasGrade ? parseFloat(s.calificacion).toFixed(2) : 'Pendiente';
            const escala = hasGrade ? this.getEscalaCualitativa(parseFloat(s.calificacion)) : 'Sin calificar';

            rowsHtml += `
                <tr style="border-bottom:1px solid #cbd5e1; background-color:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                    <td style="padding:6px 8px; text-align:center; font-size:10px;">${i + 1}</td>
                    <td style="padding:6px 8px; font-size:10px; font-weight:bold; color:#1e293b;">
                        ${this.escape(s.estudiante_nombre)} ${this.escape(s.estudiante_apellido)}
                        <br><span style="font-size:8.5px; color:#64748b; font-weight:normal;">${this.escape(s.estudiante_email)}</span>
                    </td>
                    <td style="padding:6px 8px; font-size:10px; color:#1e293b;">
                        ${this.escape(s.actividad_titulo)}
                        <br><span style="font-size:8.5px; color:#475569; font-weight:bold;">[${(s.actividad_tipo || 'archivo').toUpperCase()}]</span>
                    </td>
                    <td style="padding:6px 8px; text-align:center; font-size:9.5px; white-space:nowrap; color:#475569;">
                        ${s.entregado_en ? new Date(s.entregado_en).toLocaleDateString('es-EC') : '—'}
                    </td>
                    <td style="padding:6px 8px; text-align:center; font-size:11px; font-weight:bold; color:${hasGrade && parseFloat(s.calificacion) >= 7 ? '#059669' : '#dc2626'};">
                        ${nota}
                    </td>
                    <td style="padding:6px 8px; text-align:center; font-size:9px; color:#334155;">${escala}</td>
                    <td style="padding:6px 8px; font-size:9px; color:#475569;">${this.escape(s.retroalimentacion || 'Sin observaciones')}</td>
                </tr>
            `;
        });

        const reportTemplateHtml = `
            <div style="padding:28px 24px; font-family:'Segoe UI', Arial, sans-serif; color:#1e293b; background:#ffffff; width:750px; box-sizing:border-box;">
                <!-- Cabecera Institucional -->
                <div style="text-align:center; border-bottom:3px solid #1e3a8a; padding-bottom:12px; margin-bottom:16px;">
                    <div style="font-size:18px; font-weight:800; color:#1e3a8a; letter-spacing:0.5px; text-transform:uppercase;">UNIDAD EDUCATIVA FISCOMISIONAL SAN LORENZO</div>
                    <div style="font-size:13px; font-weight:700; color:#2563eb; margin-top:3px; text-transform:uppercase;">INFORME PEDAGÓGICO DE RENDIMIENTO Y CALIFICACIONES</div>
                    <div style="font-size:11px; color:#64748b; margin-top:2px;">ASIGNATURA: LENGUA Y LITERATURA — NOVENO AÑO DE EDUCACIÓN GENERAL BÁSICA (9º EGB)</div>
                </div>

                <!-- Metadatos del Reporte -->
                <div style="display:flex; justify-content:space-between; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:4px; padding:8px 14px; margin-bottom:14px; font-size:10px;">
                    <div><strong>Docente Responsable:</strong> ${teacherName}</div>
                    <div><strong>Fecha de Emisión:</strong> ${dateStr}</div>
                    <div><strong>Evaluaciones Registradas:</strong> ${this.filteredSubmissions.length} entregas</div>
                </div>

                <!-- KPIs Consolidado -->
                <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
                    <tr>
                        <td style="border:1px solid #cbd5e1; padding:8px; text-align:center; background:#f8fafc; width:25%;">
                            <div style="font-size:9px; color:#64748b; font-weight:bold; text-transform:uppercase;">Total Entregas</div>
                            <div style="font-size:16px; font-weight:bold; color:#1e3a8a; margin-top:2px;">${this.filteredSubmissions.length}</div>
                        </td>
                        <td style="border:1px solid #cbd5e1; padding:8px; text-align:center; background:#f8fafc; width:25%;">
                            <div style="font-size:9px; color:#64748b; font-weight:bold; text-transform:uppercase;">Promedio General</div>
                            <div style="font-size:16px; font-weight:bold; color:${parseFloat(avg) >= 7 ? '#059669' : '#dc2626'}; margin-top:2px;">${avg} / 10</div>
                        </td>
                        <td style="border:1px solid #cbd5e1; padding:8px; text-align:center; background:#f8fafc; width:25%;">
                            <div style="font-size:9px; color:#64748b; font-weight:bold; text-transform:uppercase;">Tasa de Aprobación</div>
                            <div style="font-size:16px; font-weight:bold; color:#0284c7; margin-top:2px;">${passPct}</div>
                        </td>
                        <td style="border:1px solid #cbd5e1; padding:8px; text-align:center; background:#f8fafc; width:25%;">
                            <div style="font-size:9px; color:#64748b; font-weight:bold; text-transform:uppercase;">Por Calificar</div>
                            <div style="font-size:16px; font-weight:bold; color:#d97706; margin-top:2px;">${this.filteredSubmissions.length - graded.length}</div>
                        </td>
                    </tr>
                </table>

                <!-- Tabla de Datos -->
                <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
                    <thead>
                        <tr style="background:#1e3a8a; color:#ffffff;">
                            <th style="padding:7px 5px; font-size:10px; text-align:center; width:4%; border:1px solid #1e3a8a;">#</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:left; width:25%; border:1px solid #1e3a8a;">Estudiante</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:left; width:27%; border:1px solid #1e3a8a;">Actividad</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:center; width:12%; border:1px solid #1e3a8a;">Fecha</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:center; width:10%; border:1px solid #1e3a8a;">Nota /10</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:center; width:11%; border:1px solid #1e3a8a;">Escala</th>
                            <th style="padding:7px 5px; font-size:10px; text-align:left; width:11%; border:1px solid #1e3a8a;">Observaciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>

                <!-- Pie de Firmas -->
                <div style="display:flex; justify-content:space-around; margin-top:40px; padding-top:20px; page-break-inside:avoid;">
                    <div style="text-align:center; width:220px;">
                        <div style="border-top:1px solid #475569; margin-bottom:6px;"></div>
                        <strong style="font-size:10.5px;">${teacherName}</strong><br>
                        <span style="font-size:9.5px; color:#64748b;">Docente de Lengua y Literatura</span>
                    </div>
                    <div style="text-align:center; width:220px;">
                        <div style="border-top:1px solid #475569; margin-bottom:6px;"></div>
                        <strong style="font-size:10.5px;">Rectorado / Inspección General</strong><br>
                        <span style="font-size:9.5px; color:#64748b;">U.E.F. San Lorenzo</span>
                    </div>
                </div>
            </div>
        `;

        // Actualizar contenido en printContainer para @media print
        if (printContainer) {
            printContainer.innerHTML = reportTemplateHtml;
        }

        // Si html2pdf está cargado, renderizar directamente desde el HTML template
        if (typeof html2pdf !== 'undefined') {
            if (typeof Toast !== 'undefined') Toast.show('Generando documento PDF...', 'info');

            const opt = {
                margin: [8, 8, 8, 8],
                filename: `Reporte_Calificaciones_Lengua9no_${fileDate}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true,
                    letterRendering: true,
                    logging: false
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Ejecutar la cadena con toPdf().get('pdf') directamente desde el template HTML
            html2pdf().set(opt).from(reportTemplateHtml).toPdf().get('pdf').then((pdf) => {
                const pdfDataUri = pdf.output('datauristring');

                if (!pdfDataUri || pdfDataUri.length < 1000) {
                    console.warn('PDF data URI vacío o insuficiente, invocando impresión nativa');
                    window.print();
                    return;
                }

                const filename = `Reporte_Calificaciones_Lengua9no_${fileDate}.pdf`;
                const mime = 'application/pdf';
                ReportsManager.downloadViaServer(pdfDataUri, filename, mime);
                if (typeof Toast !== 'undefined') Toast.show('PDF descargado con éxito (.pdf)', 'success');
            }).catch(err => {
                console.error('Error generando PDF con html2pdf:', err);
                if (typeof Toast !== 'undefined') Toast.show('Abriendo diálogo de impresión / PDF...', 'info');
                window.print();
            });
        } else {
            // Fallback a impresión nativa del navegador / Guardar como PDF
            window.print();
        }
    },

    getEscalaCualitativa(nota) {
        if (nota >= 9.0) return "Domina los aprendizajes (DAR)";
        if (nota >= 7.0) return "Alcanza los aprendizajes (AAR)";
        if (nota >= 4.01) return "Próximo a alcanzar (PAAR)";
        return "No alcanza los aprendizajes (NAAR)";
    },

    escape(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};
