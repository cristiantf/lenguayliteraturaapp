/**
 * Lengua y Literatura 9no EGB - Orquestador Principal de la Plataforma
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Arquitectura modular escalable: Este archivo inicializa de forma contextual
 * los componentes y módulos activos en la vista actual.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización Global (presente en todas las vistas)
    if (typeof initThemeToggle === 'function') {
        initThemeToggle();
    }

    if (typeof initNavigation === 'function') {
        initNavigation();
    }

    // 2. Inicialización Contextual de Módulos Específicos

    // Vista de Módulos Curriculares (Modal dinámico)
    if (document.getElementById('module-modal') || document.querySelector('.js-open-module')) {
        if (typeof initModuleDetailsModal === 'function') {
            initModuleDetailsModal();
        }
    }

    // Vista de Taller de Redacción de Ensayo
    if (document.getElementById('essay-form') || document.getElementById('essay-preview-output')) {
        if (typeof initEssayBuilder === 'function') {
            initEssayBuilder();
        }
    }

    // Vista de Fichas de Conceptos — Renderizado Dinámico desde flashcardsData.js
    if (document.getElementById('flashcards-dynamic-container')) {
        if (typeof initFlashcardsRenderer === 'function') {
            initFlashcardsRenderer();
        }
    }
    // Vista de Laboratorio de Figuras Literarias (Flashcards 3D estáticas)
    else if (document.querySelector('.flashcard')) {
        if (typeof initFlashcards === 'function') {
            initFlashcards();
        }
    }

    // Vista de Cuestionario y Autoevaluación
    if (document.getElementById('btn-calcular-calificacion') || document.getElementById('autoevaluacion-form')) {
        if (typeof initAutoevaluacion === 'function') {
            initAutoevaluacion();
        }
    }
});
