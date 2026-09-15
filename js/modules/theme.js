/**
 * Lengua y Literatura 9no EGB - Controlador de Tema (Modo Claro / Oscuro)
 * Unidad Educativa Fiscomisional San Lorenzo
 */

function initThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (toggleBtn) {
        // Remover listeners previos clonando o asignando directo
        toggleBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        };
    }
}

function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
        toggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        toggleBtn.setAttribute('title', theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro');
        toggleBtn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro');
    }
}

const Theme = {
    init: initThemeToggle,
    updateIcon: updateThemeIcon
};

// Exportación global y modular
if (typeof window !== 'undefined') {
    window.Theme = Theme;
    window.initThemeToggle = initThemeToggle;
    window.updateThemeIcon = updateThemeIcon;
}
