# 🛠️ Desarrollo y Estructura del Proyecto: Plataforma Educativa Lengua y Literatura 9º EGB

Este documento detalla el desarrollo y la estructura de las diferentes partes del proyecto, haciendo un énfasis especial en los paneles de control (dashboards) diseñados para cada uno de los roles principales: **Administrador**, **Docente** y **Estudiante**.

---

## 1. Arquitectura General del Proyecto

La plataforma está construida utilizando una arquitectura de microservicios y un enfoque de **Full-Stack desacoplado**:
- **Frontend (Capa de Presentación):** Desarrollado con HTML5, CSS3 y JavaScript moderno. Utiliza Bootstrap 5 para garantizar que la interfaz sea responsiva y amigable (Mobile First). Se comunica con el servidor a través de peticiones asíncronas (`fetch`).
- **Backend (API REST):** Construido en PHP 8. Provee los servicios necesarios (endpoints) para manejar la lógica de negocio, control de sesión, autenticación (con bcrypt) y acceso a datos de manera segura.
- **Base de Datos (Capa de Persistencia):** Base de datos relacional (MySQL / MariaDB) con uso de PDO y consultas preparadas para evitar inyecciones SQL.

---

## 2. Los Paneles de Control (Dashboards)

El sistema de gestión académica se divide en tres paneles principales, accesibles dependiendo del rol del usuario tras la autenticación. Se encuentran ubicados en la carpeta `dashboard/`.

### 2.1 Panel de Administrador (`/dashboard/admin/`)
El panel de administración es el centro de mando del sistema. Su objetivo es mantener el control global de los usuarios y de las actividades que ocurren en la plataforma.

*   **`index.html` (Panel Principal):** Muestra métricas globales, como la cantidad total de usuarios activos, actividades generadas en la plataforma y estadísticas de uso general.
*   **`usuarios.html` (Gestión de Usuarios):** Implementa un CRUD completo (Crear, Leer, Actualizar, Borrar) para gestionar a los estudiantes, docentes y otros administradores. Permite resetear contraseñas y activar o desactivar accesos.
*   **`actividades.html` (Supervisión Global):** Brinda acceso a todas las actividades creadas por los distintos docentes en el sistema, asegurando la auditoría pedagógica.
*   **`notificaciones.html` (Comunicados):** Módulo para el envío de notificaciones masivas. Permite al administrador enviar mensajes a toda la institución o segmentados por roles (solo a docentes, o solo a estudiantes).

### 2.2 Panel de Docente (`/dashboard/docente/`)
El panel del docente está enfocado en la creación de contenido pedagógico, evaluación y seguimiento de sus estudiantes.

*   **`index.html` (Panel Principal):** Un resumen inmediato del estado de las clases: tareas pendientes por calificar, notificaciones recientes de entregas y promedios generales.
*   **`actividades.html` (Gestión y Constructor):** El corazón del rol docente. Aquí puede asignar trabajos escritos y usar el **Constructor de Quizzes**. Este constructor permite armar cuestionarios interactivos, definir las respuestas correctas y establecer mensajes de retroalimentación (feedback) que el estudiante verá tras equivocarse o acertar.
*   **`calificar.html` (Centro de Calificaciones):** Una interfaz dedicada a la revisión de entregas. El docente visualiza los ensayos o respuestas de sus estudiantes, asigna puntajes manuales y añade observaciones.
*   **`reportes.html` (Métricas y Rendimiento):** Pantalla enfocada a la analítica de aprendizaje. Permite exportar notas y observar el rendimiento grupal para identificar vacíos en el aprendizaje.

### 2.3 Panel de Estudiante (`/dashboard/estudiante/`)
El panel del estudiante está diseñado para ser interactivo, gamificado y claro, facilitando el aprendizaje autónomo.

*   **`index.html` (Panel Principal):** Una vista de tipo "agenda" que le recuerda al estudiante sus tareas pendientes, fechas de vencimiento y últimos logros.
*   **`actividades.html` (Organizador y Quizzes):** Cuenta con filtros (`Pendientes`, `Entregadas`, `Calificadas`) para mantener el orden. Desde aquí se lanzan los **Quizzes Interactivos**, los cuales cuentan con una interfaz inmersiva y, al finalizar, proveen calificación automática inmediata, mostrando al estudiante su puntaje y una retroalimentación didáctica pregunta por pregunta.
*   **`calificaciones.html` (Boleta de Notas):** Historial del rendimiento académico. El estudiante puede revisar todas las notas que ha obtenido, junto con las rúbricas y observaciones detalladas dejadas por el docente.

---

## 3. Módulos Adicionales y Portal Público
Además de los paneles de control, el proyecto cuenta con un portal público:
- **Páginas Educativas (`/views/`):** Contiene el laboratorio de figuras literarias, talleres de ensayos y resúmenes teóricos.
- **Manejo de Estados y Sesiones:** El control de rutas protegidas se maneja combinando validaciones en PHP (backend) y restricciones dinámicas usando JavaScript (frontend) para asegurar que un estudiante no pueda acceder al panel de un docente, ni viceversa.
