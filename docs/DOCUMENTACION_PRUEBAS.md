# 🧪 Documentación Técnica de Pruebas (Testing Funcional)

Este documento detalla el **Plan de Pruebas Funcionales** diseñado para asegurar la calidad, fiabilidad y seguridad de la Plataforma Educativa Lengua y Literatura 9º EGB. 

El enfoque principal de estas pruebas es validar los flujos críticos (Happy Paths) y la robustez del sistema frente a comportamientos inesperados, garantizando una experiencia fluida para Administradores, Docentes y Estudiantes.

---

## 📋 1. Plan de Casos de Prueba (Test Cases)

A continuación se detalla la batería de pruebas funcionales manuales (End-to-End) que deben ejecutarse antes de cada paso a producción:

| ID | Módulo / Escenario | Acción / Datos de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- |
| **TC-01** | **Tema Claro / Oscuro** | Clic en el botón `#theme-toggle` del menú superior. | Se cambia la clase `data-theme` en el DOM, se persiste el estado en `localStorage` y se actualizan los iconos (sol/luna) de manera fluida. |
| **TC-02** | **Login (Credenciales válidas)** | Ingresar `docente@demo.com` / `docente123` y pulsar entrar. | Autenticación exitosa (200 OK), el backend inicia sesión PHP segura y redirige al usuario a `dashboard/docente/index.html`. |
| **TC-03** | **Protección de Rutas (Seguridad)** | Intentar acceso directo a `dashboard/admin/index.html` sin estar autenticado. | El módulo `Auth.requireRole()` intercepta la navegación, rechaza el acceso y redirige a `login.html`. |
| **TC-04** | **Constructor de Quizzes (Docente)** | Crear nueva actividad tipo quiz, clic en el botón "Preguntas de Muestra". | Se pre-cargan automáticamente 4 preguntas pedagógicas de 9no grado con sus opciones, respuesta correcta y explicación. Se guarda correctamente en las tablas `activities` y `quiz_templates`. |
| **TC-05** | **Seguridad en Quizzes (Estudiante)** | Se realiza una consulta GET a `api/activities/quiz.php` simulando ser un estudiante. | Las preguntas se retornan con las opciones, **pero el backend sanitiza el JSON omitiendo los campos `answer` (respuesta correcta) y `explanation`** para evitar trampas. |
| **TC-06** | **Auto-Calificación de Quiz** | El estudiante responde las 4 preguntas del Quiz y pulsa "Enviar". | El endpoint `submit.php` evalúa aciertos en el servidor, crea una entrega (`submission`), inserta la nota exacta, y muestra una pantalla de celebración 🎉 con el desglose didáctico. |
| **TC-07** | **Filtros Panel Estudiante** | Clic en la pestaña "⏳ Pendientes" o escribir en el campo del buscador. | La lista de actividades se filtra de forma reactiva (en el cliente) mostrando solo los elementos aplicables sin recargar la página. |
| **TC-08** | **Notificaciones en Tiempo Real** | Completar y auto-calificar un quiz (como estudiante). | Se genera una notificación instantánea (polling) para el estudiante informando su nota, y otra para el docente alertándole de la entrega de su alumno. |
| **TC-09** | **Marcador Virtual Inteligente (PDF)** | Abrir "Libro Digital", avanzar a la página 15, cerrar la pestaña y volver a abrir la vista. | Gracias a la integración de **PDF.js**, la aplicación lee el `localStorage` y renderiza automáticamente el `<canvas>` saltando directo a la página 15. |
| **TC-10** | **Modo Inmersivo (Lector de PDF)** | Estando en el "Libro Digital", pulsar el botón "Modo Inmersivo". | Las barras de herramientas y menús se ocultan. El PDF ocupa el 100% de la pantalla. Al pulsar la tecla `Esc` o el botón flotante (✖), se restaura la interfaz normal. |

---

## 🛡️ 2. Pruebas de Seguridad y Resiliencia

Además de las pruebas funcionales listadas arriba, el sistema ha sido diseñado para mitigar vulnerabilidades comunes:

*   **Prevención SQLi (SQL Injection):** Todas las entradas de usuario se procesan mediante **Consultas Preparadas con PDO** en el backend PHP. (Ej. `$stmt = $db->prepare('SELECT * FROM users WHERE email = :email')`).
*   **Fijación de Sesión:** Tras un login exitoso, el script `api/auth/login.php` ejecuta `session_regenerate_id(true)` para invalidar IDs de sesión antiguos.
*   **Ataques XSS en Cookies:** La cookie de sesión (PHPSESSID) está configurada en `api/config/session.php` con los flags `HttpOnly = true` y `SameSite = Lax`.

---

## 🔄 3. Ejecución de las Pruebas

Para validar el sistema en un entorno local de desarrollo:

1. Levanta el servidor con `php -S localhost:8000`.
2. Asegúrate de tener la base de datos `lengua_literatura_9no` con los datos cargados desde `sql/seed.sql`.
3. Sigue los pasos de acción (`Acción / Datos de Entrada`) descritos en la tabla de Casos de Prueba (TC-01 a TC-10).
4. Verifica que el resultado obtenido sea exactamente el detallado en la columna **Resultado Esperado**.
