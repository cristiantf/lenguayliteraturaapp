/**
 * Lengua y Literatura 9no EGB - Motor de Evaluación y Diagnóstico
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Dinámicamente carga y evalúa las preguntas desde quizData.js
 */

let currentQuestions = [];

function renderQuiz(unitFilter = 'all') {
    const container = document.getElementById('quiz-questions-container');
    if (!container || typeof QUIZ_QUESTIONS === 'undefined') return;

    // Filter questions
    if (unitFilter === 'all') {
        currentQuestions = [...QUIZ_QUESTIONS];
    } else {
        const unit = parseInt(unitFilter);
        currentQuestions = QUIZ_QUESTIONS.filter(q => q.unit === unit);
    }

    // Render HTML
    let html = '';
    currentQuestions.forEach((q, index) => {
        let optionsHtml = '';
        q.options.forEach((opt, optIndex) => {
            optionsHtml += `
                <label class="quiz-option-label">
                    <input type="radio" name="q${q.id}" value="${optIndex}">
                    <span>${opt}</span>
                </label>
            `;
        });

        html += `
            <div class="quiz-question-block" data-question-id="${q.id}">
                <div class="quiz-question-header">
                    <span class="badge badge-primary">Pregunta ${index + 1}</span>
                    <span class="badge badge-emerald">Unidad ${q.unit} - ${q.topic}</span>
                </div>
                <h2 class="quiz-question-title">
                    ${index + 1}. ${q.question}
                </h2>
                ${optionsHtml}
                <div class="quiz-feedback-box" id="feedback-q${q.id}" style="display:none; margin-top:1rem; padding:1rem; border-radius:8px; background:#f8fafc; border:1px solid #e2e8f0; font-size:0.9rem;">
                    <!-- Feedback injected here -->
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function initAutoevaluacion() {
    // Escuchar el selector de unidad
    const unitSelector = document.getElementById('unit-selector');
    if (unitSelector) {
        unitSelector.addEventListener('change', (e) => {
            renderQuiz(e.target.value);
            const form = document.getElementById('autoevaluacion-form');
            if (form) form.reset();
            if (typeof closeFloatingToast === 'function') closeFloatingToast();
        });
    }

    // Render inicial
    renderQuiz('all');

    const btnCalcular = document.getElementById('btn-calcular-calificacion');
    if (!btnCalcular) return;

    btnCalcular.addEventListener('click', () => {
        if (currentQuestions.length === 0) return;

        let answeredCount = 0;
        let correctCount = 0;

        currentQuestions.forEach((q) => {
            const selectedOpt = document.querySelector(`input[name="q${q.id}"]:checked`);
            const feedbackBox = document.getElementById(`feedback-q${q.id}`);
            
            if (selectedOpt) {
                answeredCount++;
                const selectedValue = parseInt(selectedOpt.value);
                const isCorrect = selectedValue === q.answer;
                
                if (isCorrect) correctCount++;

                // Mostrar retroalimentación individual
                if (feedbackBox) {
                    feedbackBox.style.display = 'block';
                    feedbackBox.style.borderColor = isCorrect ? '#10b981' : '#e11d48';
                    feedbackBox.style.backgroundColor = isCorrect ? '#ecfdf5' : '#fff1f2';
                    feedbackBox.innerHTML = `
                        <strong style="color: ${isCorrect ? '#047857' : '#be123c'}">${isCorrect ? '✅ Correcto' : '❌ Incorrecto'}</strong><br>
                        <span style="color: var(--text-main); margin-top: 0.5rem; display: block;">${q.explanation}</span>
                    `;
                }
            } else {
                if (feedbackBox) feedbackBox.style.display = 'none';
            }
        });

        // Validar que se hayan respondido todas
        if (answeredCount < currentQuestions.length) {
            const toastError = `
                <div style="display:flex; align-items:center; justify-content:space-between; gap:1rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                        <span style="font-size:1.6rem;">⚠️</span>
                        <div>
                            <strong style="color:var(--accent-rose); display:block; font-size:0.95rem;">Preguntas Incompletas</strong>
                            <span style="font-size:0.85rem; color:var(--text-muted);">Has respondido ${answeredCount} de ${currentQuestions.length} preguntas. Responde todas para calificar.</span>
                        </div>
                    </div>
                    <button type="button" class="btn-close" onclick="closeFloatingToast()" aria-label="Cerrar"></button>
                </div>
            `;
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(toastError);
            }
            return;
        }

        const totalScore = ((correctCount / currentQuestions.length) * 10).toFixed(1); // Calificación sobre 10.0
        const percentage = (correctCount / currentQuestions.length) * 100;

        let badgeColor = 'badge-emerald';
        let icon = '🎉';
        let titleMessage = '¡Excelente Trabajo!';
        let descMessage = `Has demostrado un gran dominio en estos temas.`;

        if (percentage >= 70 && percentage < 90) {
            badgeColor = 'badge-primary';
            icon = '👍';
            titleMessage = '¡Buen Resultado!';
            descMessage = `Te recomendamos revisar las preguntas falladas para perfeccionar.`;
        } else if (percentage < 70) {
            badgeColor = 'badge-amber';
            icon = '📚';
            titleMessage = '¡Sigue Practicando!';
            descMessage = `Te sugerimos repasar el material de estudio para reforzar tus conocimientos.`;
        }

        // Crear el mensaje flotante de retroalimentación
        const toastHTML = `
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; margin-bottom:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <span style="font-size:2rem;">${icon}</span>
                    <div>
                        <span class="badge ${badgeColor}" style="font-size:0.85rem; padding: 0.3rem 0.75rem;">Calificación: ${totalScore} / 10 pts</span>
                        <h4 style="font-size:1.1rem; font-weight:700; margin-top:0.35rem; color:var(--text-main);">${titleMessage}</h4>
                    </div>
                </div>
                <button type="button" class="btn-close" onclick="closeFloatingToast()" aria-label="Cerrar"></button>
            </div>
            <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:0;">${descMessage}</p>
        `;

        if (typeof showFloatingToast === 'function') {
            showFloatingToast(toastHTML);
        }
        
        // Scroll to top of quiz to see feedback
        window.scrollTo({ top: document.querySelector('.quiz-section').offsetTop - 50, behavior: 'smooth' });
    });

    // Soporte para reiniciar cuestionario
    const btnReiniciar = document.getElementById('btn-reiniciar-cuestionario');
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            const form = document.getElementById('autoevaluacion-form');
            if (form) form.reset();
            
            // Ocultar feedback boxes
            document.querySelectorAll('.quiz-feedback-box').forEach(box => {
                box.style.display = 'none';
            });
            
            if (typeof closeFloatingToast === 'function') closeFloatingToast();
            window.scrollTo({ top: document.querySelector('.quiz-section').offsetTop - 50, behavior: 'smooth' });
        });
    }
}

// Exportación global y modular
if (typeof window !== 'undefined') {
    window.initAutoevaluacion = initAutoevaluacion;
}
