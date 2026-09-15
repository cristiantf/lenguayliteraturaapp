# 📖 Plataforma Educativa Full-Stack de Lengua y Literatura — 9.º Año EGB Superior

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![PHP](https://img.shields.io/badge/PHP_8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap_5-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Institución](https://img.shields.io/badge/Instituci%C3%B3n-U.E.F._San_Lorenzo-4f46e5?style=for-the-badge&logo=book&logoColor=white)](#)
[![Nivel Educativo](https://img.shields.io/badge/Nivel-9no_EGB_Superior-0d9488?style=for-the-badge)](#)
[![Estado](https://img.shields.io/badge/Estado-Producci%C3%B3n-10b981?style=for-the-badge)](#)

---

## 🏫 Presentación Institucional

Bienvenido al repositorio oficial de la **Plataforma Educativa Full-Stack de Lengua y Literatura para Noveno Año de Educación General Básica Superior**, desarrollada para la **Unidad Educativa Fiscomisional San Lorenzo**.

Esta solución tecnológica integra un portal público interactivo de aprendizaje multimedia con una suite completa de **Gestión Académica por Roles (Administrador, Docente y Estudiante)** respaldada por un backend en **PHP 8** y base de datos relacional **MySQL / MariaDB**.

- **Repositorio Oficial:** [https://github.com/cristiantf/lenguayliteraturaapp.git](https://github.com/cristiantf/lenguayliteraturaapp.git)

---

## 🎯 Propósito y Enfoque Pedagógico

1. **Aprender haciendo:** Módulos interactivos que cubren el currículo nacional ecuatoriano (La aventura de escribir, Contar lo que pasa, El lenguaje de la ciencia, Opinar y crear).
2. **Evaluación Formativa y Gamificada:** Generador de quizzes dinámicos con preguntas de opción múltiple y **calificación automática en tiempo real** que fomenta la motivación del estudiante con explicaciones pedagógicas paso a paso.
3. **Organización del Trabajo Escolar:** Paneles dedicados para estudiantes con seguimiento de actividades pendientes, entregadas y calificadas, métricas en tiempo real y buscador instantáneo.
4. **Gestión Docente Eficiente:** Constructor visual de cuestionarios, asignación de tareas escritas, rúbrica de calificaciones y retroalimentación personalizada.
5. **Administración y Auditoría:** Control de accesos por roles, gestión de usuarios, comunicados globales y trazabilidad de eventos del sistema.

---

## 🌟 Módulos y Funcionalidades del Sistema

### 1. Portal Público y Recursos Educativos
- **🌓 Tema Claro / Oscuro:** Selector ergonómico con persistencia en `localStorage`.
- **📚 4 Unidades Curriculares 9no EGB:** Guías de estudio, síntesis teórica, vocabulario y contextualización histórica.
- **🃏 Laboratorio 3D de Figuras Literarias:** Flashcards con animación de giro para el entrenamiento mnemotécnico de metáfora, hipérbole, símil, personificación, anáfora, etc.
- **📝 Taller de Ensayo Argumentativo:** Editor interactivo con previsualización en vivo de tema, tesis y argumentos.
- **📖 Lecciones Clave:** Profundización en novela policial, reglas ortográficas y textos expositivos.

### 2. Panel de Estudiante (`/dashboard/estudiante/`)
- **📊 Métricas en Tiempo Real:** Contadores de actividades Asignadas, Pendientes, Entregadas y Calificadas.
- **🗂️ Organización de Actividades:** Pestañas de filtrado (`Todas`, `⏳ Pendientes`, `📬 Entregadas`, `⭐ Calificadas`, `⏰ Vencidas`) y buscador en vivo.
- **🚀 Reproductor Dinámico de Quiz:**
  - Interfaz interactiva y moderna con barra de progreso.
  - Selección de opciones A, B, C, D con micro-animaciones.
  - **Calificación automática inmediata**: Al terminar, muestra pantalla de celebración, puntaje exacto sobre la nota máxima, porcentaje de aciertos y desglose detallado con explicaciones pedagógicas de cada pregunta.
- **👁️ Detalle de Mi Entrega:** Modal enriquecido para revisar el estado de tareas enviadas, calificaciones y comentarios del docente.
- **⭐ Boleta de Calificaciones:** Historial académico del estudiante con ponderaciones y promedios.

### 3. Panel de Docente (`/dashboard/docente/`)
- **🎯 Constructor de Quizzes Auto-Calificables:**
  - Creación dinámica de preguntas de opción múltiple.
  - Selección de la respuesta correcta y redacción de explicaciones pedagógicas.
  - **✨ Carga Rápida de Preguntas de Muestra**: Preguntas pedagógicas preconfiguradas para 9no EGB con un solo clic.
  - Cálculo automático de puntaje por pregunta proporcional a la nota máxima.
- **📄 Tareas Escritas / Archivos:** Recepción de ensayos, documentos PDF y desarrollos escritos.
- **📝 Centro de Calificación:** Revisión de entregas de estudiantes, asignación de notas manuales y retroalimentación detallada.
- **🔔 Notificaciones Automáticas:** Avisos inmediatos cuando un estudiante entrega una tarea o completa un quiz.

### 4. Panel de Administrador (`/dashboard/admin/`)
- **👥 Gestión de Usuarios (CRUD):** Creación, edición, activación/desactivación y reseteo de contraseñas para administradores, docentes y estudiantes.
- **📢 Emisión de Comunicados Globales:** Envío de notificaciones masivas para toda la institución o segmentos de usuarios.
- **📋 Supervisión Global de Actividades:** Monitoreo del estado de todas las tareas y quizzes del plantel.
- **🛡️ Auditoría y Seguridad:** Registro cronológico de acciones críticas en la base de datos (`audit_logs`).

---

## 📂 Estructura del Proyecto

```text
Lengua-Literatura-9no/
│
├── index.html                     # Portal Público y Hub de Aprendizaje
├── login.html                     # Portal de Acceso Unificado por Roles
├── .htaccess                      # Configuración Apache y seguridad
├── .gitignore                     # Exclusión de temporales y archivos pesados
│
├── api/                           # Backend API REST en PHP 8
│   ├── config/
│   │   ├── database.php           # Conexión PDO a MySQL (Singleton/Helper)
│   │   └── session.php            # Manejo de sesiones seguras y helpers JSON
│   ├── auth/
│   │   ├── login.php              # Autenticación con password_verify()
│   │   ├── check.php              # Verificación de sesión activa
│   │   └── logout.php             # Destrucción segura de sesión
│   ├── activities/
│   │   ├── list.php               # Listado adaptativo según el rol
│   │   ├── create.php             # Creación de actividad y plantilla de quiz
│   │   ├── quiz.php               # Endpoint seguro de preguntas (sanitizado)
│   │   ├── submit.php             # Entrega y auto-calificación inmediata
│   │   ├── update.php             # Modificación de actividades y quizzes
│   │   ├── delete.php             # Eliminación lógica/física de actividades
│   │   └── toggle.php             # Activar o pausar visibilidad para alumnos
│   ├── grades/
│   │   ├── list.php               # Listado de entregas y notas para docente
│   │   ├── student.php            # Boleta de notas para el estudiante
│   │   └── assign.php             # Calificación manual y retroalimentación
│   ├── users/                     # CRUD administrativo de usuarios
│   │   ├── list.php, create.php, update.php, delete.php
│   └── notifications/             # Notificaciones en tiempo real
│       ├── list.php, count.php, read.php, broadcast.php
│
├── dashboard/                     # Vistas de Paneles de Control por Rol
│   ├── admin/                     # index.html, usuarios.html, actividades.html, notificaciones.html
│   ├── docente/                   # index.html, actividades.html, calificar.html
│   └── estudiante/                # index.html, actividades.html, calificaciones.html
│
├── sql/                           # Base de Datos Relacional
│   ├── schema.sql                 # Definición DDL de tablas relacionales
│   ├── seed.sql                   # Datos semilla iniciales y usuarios de prueba
│   └── setup.php                  # Script de auto-instalación de base de datos
│
├── views/                         # Vistas del Portal Público
│   ├── modulos.html               # 4 Unidades curriculares + Modal dinámico
│   ├── lecciones.html             # Lecciones formativas clave
│   ├── taller.html                # Taller de redacción de ensayo
│   ├── figuras.html               # Flashcards 3D de figuras retóricas
│   └── cuestionario.html          # Autoevaluación diagnóstica pública
│
├── css/                           # Sistema de Diseño Modular
│   ├── base.css                   # Tokens CSS, temas dark/light, reset
│   ├── components.css             # Componentes reutilizables
│   ├── style.css                  # Hoja de estilo centralizadora
│   └── views/                     # dashboard.css, login.css, portal.css, etc.
│
├── js/                            # JavaScript Modular del Cliente
│   ├── main.js                    # Inicializador de vistas públicas
│   ├── data/                      # modulesData.js, quizData.js, flashcardsData.js
│   └── modules/                   # auth.js, activitiesManager.js, gradesManager.js,
│                                  # usersManager.js, notifications.js, theme.js, toast.js
│
└── docs/                          # Documentación Técnica Formal
    ├── DOCUMENTACION_TECNICA.md   # Especificación de APIs, Base de Datos y Módulos
    ├── ARQUITECTURA.md            # Arquitectura Full-Stack y Flujo de Datos
    ├── DIAGRAMAS_UML.md           # Diagramas UML (Clases, ER, Secuencia, Actividad)
    └── CASOS_DE_USO.md            # Especificación detallada de casos de uso (CU-01 a CU-11)
```

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos Previos
- **PHP 8.0 o superior** con extensión `pdo_mysql` habilitada.
- **MySQL 5.7+ o MariaDB 10.3+** (ej. XAMPP, WampServer, Laragon o MySQL nativo).
- Navegador web moderno (Chrome, Edge, Firefox, Safari).

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/cristiantf/lenguayliteraturaapp.git
cd lenguayliteraturaapp
```

### Paso 2: Configurar la Base de Datos
1. Inicia los servicios de Apache y MySQL en tu servidor local (ej. XAMPP).
2. Crea la base de datos `lengua_literatura_9no` en phpMyAdmin o consola MySQL:
   ```sql
   CREATE DATABASE lengua_literatura_9no CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Importa los scripts ubicados en `/sql/`:
   - Primero ejecuta [`sql/schema.sql`](sql/schema.sql).
   - Luego ejecuta [`sql/seed.sql`](sql/seed.sql).
4. *(Opcional)* Si prefieres inicializarla vía navegador, accede a:
   `http://localhost/lenguayliteraturaapp/sql/setup.php`

> [!NOTE]
> Las credenciales de conexión por defecto se configuran en [`api/config/database.php`](api/config/database.php) (`host: localhost`, `user: root`, `password: ""` vacía).

### Paso 3: Iniciar el Servidor de Desarrollo
Puedes usar el servidor embebido de PHP directamente en la carpeta del proyecto:
```bash
php -S localhost:8000
```
Luego ingresa en tu navegador a:
`http://localhost:8000`

---

## 🔑 Credenciales de Acceso de Prueba

El script semilla (`sql/seed.sql`) incluye usuarios demostrativos para cada rol:

| Rol | Correo Electrónico | Contraseña | Panel Asignado |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@demo.com` | `admin123` | [`/dashboard/admin/`](dashboard/admin/) |
| **Docente** | `docente@demo.com` | `docente123` | [`/dashboard/docente/`](dashboard/docente/) |
| **Estudiante** | `estudiante@demo.com` | `estudiante123` | [`/dashboard/estudiante/`](dashboard/estudiante/) |

Para ingresar a los paneles, haz clic en **"Iniciar Sesión"** en la barra de navegación del portal o accede directamente a [`login.html`](login.html).

---

## 📚 Documentación Técnica Detallada

Para una comprensión exhaustiva de la implementación y diseño del software, consulta la carpeta [`/docs`](docs/):

- 🏛️ **[Arquitectura de Software (docs/ARQUITECTURA.md)](docs/ARQUITECTURA.md)**: Diagramas de capas cliente-servidor, seguridad de sesiones, flujo de evaluación y persistencia.
- 📐 **[Diagramas UML y Entidad-Relación (docs/DIAGRAMAS_UML.md)](docs/DIAGRAMAS_UML.md)**: Diagrama ER de MySQL, secuencia de auto-calificación, estados de entregas y clases.
- 📋 **[Casos de Uso Detallados (docs/CASOS_DE_USO.md)](docs/CASOS_DE_USO.md)**: Especificación formal de CU-01 a CU-11 con actores, flujos principales y alternativos.
- ⚙️ **[Documentación Técnica de APIs (docs/DOCUMENTACION_TECNICA.md)](docs/DOCUMENTACION_TECNICA.md)**: Catálogo completo de endpoints REST JSON, estructuras de payload, esquema relacional y matriz de pruebas.

---

## 👥 Créditos y Autoría

- **Institución:** Unidad Educativa Fiscomisional San Lorenzo.
- **Área Académica:** Lengua y Literatura — Educación General Básica Superior (9.º Año).
- **Repositorio Oficial:** [cristiantf/lenguayliteraturaapp](https://github.com/cristiantf/lenguayliteraturaapp.git)
- **Año:** 2026.

---

## 📄 Licencia

Este proyecto educativo está disponible bajo la licencia **MIT**, permitiendo su uso, adaptación y extensión para la comunidad educativa.
