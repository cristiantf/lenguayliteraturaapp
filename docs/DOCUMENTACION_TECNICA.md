# ⚙️ Documentación Técnica del Sistema: Lengua y Literatura 9.º EGB

Este documento constituye el manual de referencia técnica, desarrollo y mantenimiento de la plataforma interactiva y de gestión académica de **Lengua y Literatura para 9.º Grado de Educación General Básica Superior** de la **Unidad Educativa Fiscomisional San Lorenzo**.

---

## 1. Requerimientos del Sistema y Compatibilidad

La plataforma ha sido desarrollada bajo una arquitectura **Full-Stack desacoplada**:
- **Frontend:** HTML5 semántico, Vanilla CSS3 estructurado en tokens, JavaScript modular (ES6+) y Bootstrap 5.3.3.
- **Backend:** PHP 8.0+ con arquitectura REST, codificación estricta en JSON, autenticación mediante sesiones de servidor seguras (cookies HttpOnly/SameSite) y PDO para MySQL.
- **Base de Datos:** MySQL 5.7+ o MariaDB 10.3+ con soporte de tipos JSON nativos y llaves foráneas en cascada.

### Compatibilidad de Navegadores
| Navegador | Versión Mínima Soportada | Estado de Compatibilidad |
| :--- | :--- | :--- |
| **Google Chrome / Chromium** | 90+ | Totalmente Compatible (Soporte CSS Grid, Flexbox, Custom Properties, Fetch API) |
| **Mozilla Firefox** | 88+ | Totalmente Compatible |
| **Microsoft Edge** | 90+ | Totalmente Compatible |
| **Apple Safari (macOS / iOS)** | 14.1+ | Totalmente Compatible |
| **Opera** | 76+ | Totalmente Compatible |
| **Navegadores Móviles (Android / iOS)** | Cualquier versión moderna | Optimizado con diseño táctil y responsive |

---

## 2. Dependencias Externas y Recursos CDN

1. **Bootstrap 5.3.3**
   - CSS: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css`
   - JS Bundle: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js`
   - *Uso:* Rejilla responsiva, componentes modales accesibles y utilidades de espaciado.
2. **Google Fonts**
   - Tipografías: `Outfit` (sans-serif para UI y textos de lectura) y `Playfair Display` (serif refinada para títulos principales y literatura).

---

## 3. Catálogo y Especificación de la API REST (`/api/`)

Todos los endpoints retornan respuestas en formato `application/json` con cabeceras CORS/credenciales configuradas en [`api/config/session.php`](../api/config/session.php).

### 3.1 Módulo de Autenticación (`/api/auth/`)

| Endpoint | Método | Roles Permitidos | Parámetros (JSON) | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/api/auth/login.php` | `POST` | Público | `{ email, password }` | Verifica credenciales con `password_verify()`, regenera el session ID y almacena el perfil en `$_SESSION`. |
| `/api/auth/check.php` | `GET` | Cualquiera | Ninguno | Retorna el estado de la sesión activa y los datos del usuario autenticado. |
| `/api/auth/logout.php` | `POST` | Autenticado | Ninguno | Destruye la sesión en el servidor y limpia la cookie de sesión. |

### 3.2 Módulo de Actividades y Quizzes (`/api/activities/`)

| Endpoint | Método | Roles Permitidos | Parámetros | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/api/activities/list.php` | `GET` | Todos | Ninguno | **Admin:** Retorna todas las actividades del plantel.<br>**Docente:** Retorna las actividades creadas por el docente.<br>**Estudiante:** Retorna actividades activas con sus entregas y notas personales. |
| `/api/activities/create.php` | `POST` | `docente`, `admin` | `{ titulo, tipo, descripcion, nota_maxima, fecha_limite, activa, preguntas? }` | Inserta la actividad y, si `tipo` es `quiz` o `mixta`, almacena las preguntas en `quiz_templates`. |
| `/api/activities/quiz.php` | `GET` | Todos | `?activity_id=X` | Retorna las preguntas del quiz. **Seguridad:** Oculta las respuestas correctas a estudiantes que no hayan finalizado el examen. |
| `/api/activities/submit.php` | `POST` | `estudiante` | `{ actividad_id, respuesta_texto?, quiz_respuestas?, archivo? }` | Registra la entrega. **Auto-calificación:** Si es quiz, evalúa las respuestas contra la plantilla, calcula la nota proporcional a `nota_maxima`, crea el registro en `grades` con retroalimentación inmediata y notifica a estudiante y docente. |
| `/api/activities/update.php` | `POST` | `docente`, `admin` | `{ id, titulo, tipo, descripcion, nota_maxima, fecha_limite, activa, preguntas? }` | Actualiza la actividad y su plantilla de preguntas. |
| `/api/activities/delete.php` | `POST` | `docente`, `admin` | `{ id }` | Elimina la actividad y sus registros dependientes en cascada. |
| `/api/activities/toggle.php` | `POST` | `docente`, `admin` | `{ id, activa }` | Alterna el estado activo/pausado de la actividad. |

### 3.3 Módulo de Calificaciones (`/api/grades/`)

| Endpoint | Método | Roles Permitidos | Parámetros | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `/api/grades/list.php` | `GET` | `docente`, `admin` | `?actividad_id=X` | Lista las entregas de los estudiantes para una actividad dada, permitiendo consultar respuestas, archivos y notas. |
| `/api/grades/student.php` | `GET` | `estudiante` | Ninguno | Retorna el consolidado de calificaciones y retroalimentaciones del estudiante logueado. |
| `/api/grades/assign.php` | `POST` | `docente`, `admin` | `{ submission_id, nota, retroalimentacion }` | Registra o actualiza la nota manual de una entrega y notifica al estudiante. |

### 3.4 Módulo de Notificaciones y Usuarios (`/api/notifications/`, `/api/users/`)

- **`/api/notifications/list.php` (GET):** Retorna las notificaciones recientes del usuario ordenadas cronológicamente.
- **`/api/notifications/read.php` (POST):** Marca una o todas las notificaciones como leídas.
- **`/api/notifications/broadcast.php` (POST - Admin):** Emite comunicados masivos dirigidos a roles específicos o a todos los usuarios.
- **`/api/users/list.php`, `create.php`, `update.php`, `delete.php` (Admin):** CRUD completo para la gestión de cuentas del plantel.

---

## 4. Esquema de Base de Datos Relacional (`sql/schema.sql`)

La base de datos `lengua_literatura_9no` consta de 7 tablas normalizadas en Tercera Forma Normal (3NF):

```sql
-- 1. Usuarios del sistema
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'docente', 'estudiante') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Actividades pedagógicas
CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    docente_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    tipo ENUM('archivo', 'quiz', 'mixta') DEFAULT 'archivo',
    fecha_inicio DATETIME NOT NULL,
    fecha_limite DATETIME NOT NULL,
    nota_maxima DECIMAL(5,2) DEFAULT 10.00,
    activa BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (docente_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Plantillas de Quizzes de opción múltiple
CREATE TABLE quiz_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    preguntas JSON NOT NULL, -- Array de {question, options[4], answer, explanation}
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- 4. Entregas de estudiantes
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    respuesta_texto TEXT,
    archivo_url VARCHAR(255),
    quiz_respuestas JSON, -- Diccionario {preguntaIndex: opcionElegida}
    quiz_score DECIMAL(5,2),
    estado ENUM('entregada', 'calificada', 'retrasada') DEFAULT 'entregada',
    fecha_entrega TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Calificaciones y Rúbricas
CREATE TABLE grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL UNIQUE,
    docente_id INT NOT NULL,
    nota DECIMAL(5,2) NOT NULL,
    retroalimentacion TEXT,
    fecha_calificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Notificaciones en tiempo real
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    url VARCHAR(255),
    leida BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Registro de Auditoría
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    ip VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Módulos JavaScript de Gestión en el Cliente (`/js/modules/`)

1. **`auth.js` (`Auth`):**
   - Métodos: `login(email, password)`, `logout()`, `checkSession()`, `requireRole(roles)`.
   - Controla la protección de rutas en el cliente redirigiendo automáticamente a `login.html` si no hay sesión válida o si el rol no coincide.
2. **`activitiesManager.js` (`ActivitiesManager`):**
   - Administra el panel docente: listado con paginación, filtros de estado, modal de creación/edición.
   - **Quiz Builder:** Constructor interactivo de preguntas de opción múltiple, carga de preguntas modelo de 9no grado (`loadSampleQuestions()`), validaciones de integridad y empaquetado JSON.
3. **`gradesManager.js` (`StudentManager`):**
   - Administra el panel estudiantil: cálculo y renderizado de métricas en tiempo real (Total, Pendientes, Entregadas, Calificadas).
   - Filtrado reactivo por pestañas y búsqueda instantánea por texto.
   - **Quiz Player:** Reproductor inmersivo por pasos (`openQuizPlayer`, `selectQuizOption`, `submitQuiz`) con barra de progreso, pantalla festiva de celebración, cálculo de aciertos y desglose de retroalimentación pedagógica.
4. **`usersManager.js` (`UsersManager`):**
   - Administra el CRUD de usuarios en el panel de administración con paginación, filtros de rol y modales de confirmación.
5. **`notifications.js` (`Notifications`):**
   - Polling inteligente para actualización del contador en campana (🔔) y renderizado de la bandeja flotante de notificaciones.

---

## 6. Plan de Pruebas de Software (Testing Funcional)

| ID | Módulo / Escenario | Acción / Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-01** | Tema Claro / Oscuro | Clic en `#theme-toggle` | Cambia clase `data-theme`, persiste en `localStorage` y actualiza iconos fluidamente. |
| **TC-02** | Login con credenciales válidas | `docente@demo.com` / `docente123` | Autenticación 200 OK, inicia sesión en PHP y redirige a `dashboard/docente/index.html`. |
| **TC-03** | Protección de Rutas | Acceso directo a `dashboard/admin/index.html` sin autenticar | `Auth.requireRole()` intercepta la navegación y redirige a `login.html`. |
| **TC-04** | Constructor de Quizzes (Docente) | Nueva actividad tipo `quiz`, clic en "Preguntas de Muestra" | Se pre-cargan 4 preguntas de 9no grado con sus opciones, respuesta correcta y explicación. Guarda en `activities` y `quiz_templates`. |
| **TC-05** | Seguridad en Quizzes | Consulta GET a `api/activities/quiz.php` por un estudiante | Las preguntas se retornan con las opciones pero **sin** los campos `answer` ni `explanation`. |
| **TC-06** | Resolución y Auto-Calificación de Quiz | Estudiante responde 4 preguntas del Quiz y pulsa "Enviar" | `submit.php` evalúa aciertos, crea submission `calificada`, inserta nota en `grades`, muestra pantalla de celebración (🎉) y desglose pedagógico. |
| **TC-07** | Organización del Panel Estudiante | Clic en pestaña "⏳ Pendientes" o escribir en el buscador | La lista se filtra reactivamente mostrando solo las actividades aplicables sin recargar la página. |
| **TC-08** | Notificaciones en Tiempo Real | Al auto-calificar un quiz | Se crea notificación instantánea para el estudiante con su nota y para el docente informándole la entrega. |
