# 📋 Especificación Detallada de Casos de Uso: Lengua y Literatura 9.º EGB

Este documento contiene la especificación formal y exhaustiva de los casos de uso que componen el comportamiento de la plataforma interactiva de **Lengua y Literatura (9.º Grado de Educación General Básica Superior)** de la **Unidad Educativa Fiscomisional San Lorenzo**.

---

## 1. Definición de Actores

| Actor | Tipo | Descripción |
| :--- | :--- | :--- |
| **Estudiante de 9.º EGB** | Primario | Usuario principal que interactúa con la plataforma para leer contenidos, redactar borradores de ensayo, interactuar con tarjetas didácticas y realizar cuestionarios de autoevaluación formativa. |
| **Docente / Tutor de Lengua** | Secundario | Profesional de la educación que utiliza la plataforma como recurso didáctico de apoyo pedagógico en el aula, asignando actividades y verificando el dominio temático de los estudiantes. |
| **Sistema Frontend (Navegador Web)** | De Soporte | Entorno de ejecución en el cliente encargado de procesar eventos, validar respuestas, almacenar preferencias en `localStorage` y manipular el DOM sin necesidad de un backend remoto. |

---

## 2. Matriz de Casos de Uso del Sistema

| ID | Nombre del Caso de Uso | Actor Primario | Prioridad |
| :--- | :--- | :--- | :--- |
| **CU-01** | Explorar Bloques Curriculares y Consultar Detalle Extendido | Estudiante / Docente | Alta |
| **CU-02** | Visualizar Lecciones Clave de 9.º EGB en Modales Interactivos | Estudiante / Docente | Alta |
| **CU-03** | Redactar y Previsualizar Esquema en Taller de Ensayo Argumentativo | Estudiante | Alta |
| **CU-04** | Realizar Autoevaluación Interactiva y Obtener Calificación sobre 10 pts | Estudiante | Crítica |
| **CU-05** | Entrenar Recursos Poéticos en el Laboratorio de Figuras Literarias | Estudiante | Media |
| **CU-06** | Conmutar y Persistir el Tema de Color (Claro / Oscuro) | Estudiante / Docente | Media |
| **CU-07** | Navegar entre Secciones mediante Enlaces Anclados y Scroll Suave | Estudiante / Docente | Baja |
| **CU-08** | Iniciar Sesión y Redirección al Panel Correspondiente según Rol | Admin / Docente / Estudiante | Crítica |
| **CU-09** | Crear y Configurar Quizzes de Opción Múltiple (Panel Docente) | Docente | Alta |
| **CU-10** | Organizar Actividades, Responder Quiz y Obtener Calificación Automática | Estudiante | Crítica |
| **CU-11** | Gestionar Cuentas de Usuario y Emitir Comunicados Globales | Administrador | Alta |

---

## 3. Especificación Formal de Casos de Uso

---

### CU-01: Explorar Bloques Curriculares y Consultar Detalle Extendido

- **Identificador:** CU-01
- **Nombre:** Exploración y Consulta Detallada de Módulos Curriculares.
- **Actor Principal:** Estudiante / Docente.
- **Precondiciones:** La plataforma web debe haber cargado correctamente el archivo `index.html` y los datos del catálogo `MODULES_DATA` en `js/main.js`.
- **Disparador:** El usuario se desplaza a la sección `#modulos` y hace clic en el botón *"Ver Detalle"* de cualquiera de los 5 bloques.

#### Flujo Principal (Happy Path):
1. El usuario visualiza las 5 tarjetas de los bloques curriculares (Lengua y Cultura, Comunicación Oral, Lectura Crítica, Escritura Académica, Literatura & Poesía).
2. El usuario hace clic en el botón `"Ver Detalle"` (`.js-open-module`) de una tarjeta específica que contiene el atributo `data-module-id="N"` (donde $N \in [1..5]$).
3. El sistema intercepta el evento de clic y obtiene el identificador del bloque.
4. El sistema consulta en memoria el objeto `MODULES_DATA[N]`.
5. El sistema construye dinámicamente el marcado HTML con:
   - Título del módulo (`#modal-title`).
   - Insignia del bloque (`#modal-badge`).
   - Descripción contextual.
   - Lista desglosada de temas principales.
   - Contenido temático desarrollado por secciones.
6. El sistema inyecta el HTML en `#modal-body-content`.
7. El sistema activa la clase CSS `.active` sobre `#module-modal` y bloquea el desplazamiento del fondo (`document.body.style.overflow = 'hidden'`).
8. El usuario lee los contenidos extendidos del módulo.
9. El usuario cierra la ventana modal haciendo clic en el botón de cerrar (`#modal-close`) o pulsando sobre el fondo oscuro exterior.
10. El sistema remueve la clase `.active` y restaura el scroll del documento (`document.body.style.overflow = ''`).

#### Flujos Alternativos:
- **FA-01: Identificador de módulo inexistente o no encontrado:**
  - Si por alguna razón el atributo `data-module-id` no coincide con un índice válido en `MODULES_DATA`, el sistema detiene la ejecución silenciosamente sin abrir el modal ni generar errores de JavaScript en la consola.

#### Reglas de Negocio:
- **RN-01.1:** El catálogo de módulos debe contemplar estrictamente los 5 bloques del currículo de Lengua y Literatura para Básica Superior (EGB).
- **RN-01.2:** La ventana modal debe impedir el desplazamiento vertical de la página de fondo mientras permanezca abierta para evitar desorientación del estudiante.

---

### CU-02: Visualizar Lecciones Clave de 9.º EGB en Modales Interactivos

- **Identificador:** CU-02
- **Nombre:** Consulta de Lecciones Clave Formativas en Modales Bootstrap.
- **Actor Principal:** Estudiante / Docente.
- **Precondiciones:** Conexión a CDN de Bootstrap 5.3.3 cargada o biblioteca accesible.
- **Disparador:** El usuario hace clic en el botón *"📖 Ver Lección"* en una de las tarjetas temáticas de la sección `#lecciones`.

#### Flujo Principal:
1. El usuario se ubica en la sección `#lecciones` ("Lecciones Clave del Nivel").
2. El usuario selecciona una de las tres lecciones disponibles:
   - *Tarjeta 1: La Novela Policial* (Literatura).
   - *Tarjeta 2: Uso de la 'G' y la 'J'* (Ortografía y Gramática).
   - *Tarjeta 3: El Texto Expositivo* (Redacción Académica).
3. El usuario hace clic en el botón `"📖 Ver Lección"` correspondiente, el cual contiene los atributos nativos de Bootstrap `data-bs-toggle="modal"` y `data-bs-target="#[idModal]"`.
4. El motor de Bootstrap 5 despliega con animación fluida la ventana modal asociada (`#modalNovelaPolicial`, `#modalUsoGJ` o `#modalTextoExpositivo`).
5. El usuario consulta los conceptos estructurados:
   - Para la Novela Policial: definición, elementos (enigma, detective, pistas, sospechosos) y autores clásicos (Edgar Allan Poe, Conan Doyle, Agatha Christie).
   - Para el Uso de G/J: reglas de prefijos (*geo-*, *gest-*), secuencia *-gen-*, verbos terminados en *-ger* / *-gir*, terminaciones *-aje* / *-eje*, verbos en *-jear* y formas irregulares verbales con sus excepciones.
   - Para el Texto Expositivo: objetivo comunicativo, estructura tripartita (Introducción, Desarrollo, Conclusión) y recursos explicativos (definición, ejemplificación, conectores).
6. El usuario concluye la lectura y presiona el botón `"Cerrar Lección"` o el icono de cierre superior (`btn-close`).
7. La ventana modal se oculta con animación suave.

#### Reglas de Negocio:
- **RN-02.1:** Los modales deben conservar compatibilidad con teclado (cerrar con la tecla `Escape`) y accesibilidad para lectores de pantalla mediante atributos `aria-labelledby` y `aria-hidden`.

---

### CU-03: Redactar y Previsualizar Esquema en Taller de Ensayo Argumentativo

- **Identificador:** CU-03
- **Nombre:** Taller de Redacción de Ensayo Argumentativo en Tiempo Real.
- **Actor Principal:** Estudiante de 9.º EGB.
- **Precondiciones:** Carga exitosa de la función `initEssayBuilder()` en el navegador.
- **Disparador:** El estudiante escribe o modifica el contenido de cualquiera de los campos del formulario `#essay-form`.

#### Flujo Principal:
1. El estudiante se desplaza a la sección `#taller` ("Taller de Ensayo Argumentativo").
2. El estudiante visualiza el formulario con 3 campos de redacción guiada:
   - **Campo 1:** Tema General de Investigación (`#essay-topic`).
   - **Campo 2:** Postura o Tesis Principal (`#essay-thesis`).
   - **Campo 3:** Argumento de Respaldo o Evidencia (`#essay-arg`).
3. El estudiante introduce texto en alguno de los campos (disparando el evento del DOM `input`).
4. El sistema captura la entrada en tiempo real y ejecuta la función `updatePreview()`.
5. El sistema sanea los valores ingresados utilizando `.trim()`.
6. Si existe contenido en al menos uno de los campos, el sistema renderiza en `#essay-preview-output` una ficha de previsualización que muestra:
   - 🎯 **Tema central:** Texto ingresado o indicador de campo pendiente.
   - 💡 **Tesis argumentativa:** Texto formateado entre comillas con énfasis visual.
   - 🛡️ **Argumento principal:** Texto de respaldo y evidencia ingresado.
7. El estudiante puede continuar editando y ve reflejados sus ajustes de inmediato sin recarga de pantalla.

#### Flujos Alternativos:
- **FA-03.1: Vaciado de todos los campos:**
  - Si el estudiante borra completamente el contenido de los tres campos, el sistema restablece automáticamente el mensaje orientador predeterminado: *"Escribe en los campos de arriba para generar el esquema de tu ensayo argumentativo en tiempo real."*

#### Reglas de Negocio:
- **RN-03.1:** El formulario no debe recargar la página ante una pulsación involuntaria de la tecla *Enter* (`onsubmit="event.preventDefault();"`).
- **RN-03.2:** La previsualización debe ser 100% reactiva en el cliente, fomentando el aprendizaje por ensayo y error.

---

### CU-04: Realizar Autoevaluación Interactiva y Obtener Calificación

- **Identificador:** CU-04
- **Nombre:** Resolución de Autoevaluación Formativa y Cálculo de Calificación sobre 10 Puntos.
- **Actor Principal:** Estudiante de 9.º EGB.
- **Precondiciones:** El formulario `#autoevaluacion-form` debe estar completamente renderizado.
- **Disparador:** El estudiante hace clic en el botón `"#btn-calcular-calificacion"` ("📊 Calcular Calificación").

#### Flujo Principal:
1. El estudiante revisa las 3 preguntas clave del cuestionario de 9.º EGB:
   - **Pregunta 1 (Literatura):** Elemento indispensable en la trama de una novela policial.
   - **Pregunta 2 (Ortografía):** Opción con cumplimiento estricto de reglas de G y J.
   - **Pregunta 3 (Redacción):** Propósito comunicativo primordial del texto expositivo.
2. El estudiante selecciona una opción de respuesta (radio button) para cada una de las 3 preguntas (`q1`, `q2`, `q3`).
3. El estudiante hace clic en el botón `"📊 Calcular Calificación"`.
4. El sistema consulta las opciones marcadas mediante selectores CSS (`input[name="qN"]:checked`).
5. El sistema verifica que las 3 preguntas tengan una opción seleccionada (ninguna sea `null`).
6. El sistema extrae los valores enteros de las respuestas seleccionadas:
   - Respuesta correcta: `value="1"`
   - Respuesta incorrecta: `value="0"`
7. El sistema calcula la sumatoria de aciertos: `correctCount = val1 + val2 + val3` (Rango entre 0 y 3).
8. El sistema calcula la calificación cuantitativa en la escala estándar de 10.0 puntos:
   $$\text{Calificación} = \left(\frac{\text{correctCount}}{3}\right) \times 10$$
   formateada a un decimal (ej. 10.0, 6.7, 3.3, 0.0).
9. El sistema clasifica el resultado pedagógico:
   - **3 Aciertos (10.0 / 10):** Icono 🎉, Insignia Esmeralda (`badge-emerald`), Título *"¡Excelente Trabajo!"* y mensaje de felicitación por dominio integral.
   - **2 Aciertos (6.7 / 10):** Icono 👍, Insignia Primaria (`badge-primary`), Título *"¡Buen Resultado!"* e indicación de repasar el tema fallido.
   - **0 o 1 Aciertos ($\le$ 3.3 / 10):** Icono 📚, Insignia Ámbar (`badge-amber`), Título *"¡Sigue Practicando!"* e invitación a releer los modales de lecciones.
10. El sistema genera un desglose analítico pregunta por pregunta indicando con marcas visuales (✅ Correcto / ❌ Incorrecto con retroalimentación explícita de la respuesta esperada).
11. El sistema invoca `showFloatingToast(toastHTML)` para presentar la notificación flotante personalizada con animaciones suaves de entrada.
12. El estudiante revisa su puntaje y puede cerrar la notificación con el botón de cierre manual (`btn-close`).

#### Flujos Alternativos:
- **FA-04.1: Envío con preguntas incompletas:**
  - En el paso 5, si una o más preguntas no han sido contestadas (`q1 === null || q2 === null || q3 === null`), el sistema interrumpe el cálculo de nota y despliega un Toast de advertencia con icono ⚠️: *"Preguntas Incompletas: Por favor responde las 3 preguntas antes de calcular tu calificación."* El estudiante completa las respuestas pendientes y vuelve a pulsar el botón.

#### Reglas de Negocio:
- **RN-04.1:** La calificación debe expresarse obligatoriamente sobre 10.0 puntos, conforme a la escala de calificaciones del sistema educativo ecuatoriano.
- **RN-04.2:** Solo puede existir una ventana flotante de feedback visible en pantalla al mismo tiempo; cualquier toast previo debe ser eliminado del DOM antes de renderizar uno nuevo.

---

### CU-05: Entrenar Recursos Poéticos en el Laboratorio de Figuras Literarias

- **Identificador:** CU-05
- **Nombre:** Entrenamiento de Figuras Literarias con Flashcards 3D.
- **Actor Principal:** Estudiante de 9.º EGB.
- **Precondiciones:** Sección `#figuras` cargada con soporte de transformaciones 3D en el navegador.
- **Disparador:** El estudiante hace clic sobre cualquiera de las 4 tarjetas didácticas interactivas.

#### Flujo Principal:
1. El estudiante se desplaza a la sección `#figuras` ("Laboratorio de Figuras Literarias").
2. El estudiante observa las tarjetas en su cara frontal, que presentan el nombre de la figura:
   - Metáfora
   - Símil o Comparación
   - Hipérbole
   - Personificación
3. El estudiante intenta recordar la definición y un ejemplo de memoria.
4. El estudiante hace clic sobre la tarjeta deseada.
5. El sistema detecta el evento de clic en el contenedor `.flashcard` y alterna la clase CSS `.flipped`.
6. La hoja de estilos ejecuta una transición tridimensional suave (`transform: rotateY(180deg)` con `transform-style: preserve-3d`).
7. El estudiante visualiza el reverso de la tarjeta con la definición conceptual en negrita y un ejemplo literario poético ilustrativo.
8. Si el estudiante hace clic nuevamente en la tarjeta, esta vuelve a girar a su estado original (cara frontal).

#### Reglas de Negocio:
- **RN-05.1:** Cada tarjeta debe girar de manera independiente sin afectar el estado de las demás flashcards del laboratorio.

---

### CU-06: Conmutar y Persistir el Tema de Color (Claro / Oscuro)

- **Identificador:** CU-06
- **Nombre:** Gestión de Preferencia Visual y Modo Oscuro / Claro.
- **Actor Principal:** Estudiante / Docente.
- **Precondiciones:** Acceso habilitado a la API `localStorage` del navegador.
- **Disparador:** El usuario hace clic en el botón `#theme-toggle` del encabezado.

#### Flujo Principal:
1. El usuario visualiza el botón de tema en el menú superior (icono 🌙 si está en modo claro o ☀️ si está en modo oscuro).
2. El usuario hace clic sobre el botón `#theme-toggle`.
3. El sistema consulta el atributo actual `data-theme` en la etiqueta raíz `<html>`.
4. El sistema determina el nuevo tema a aplicar (si era `'dark'`, cambia a `'light'`, y viceversa).
5. El sistema asigna el nuevo valor al atributo: `document.documentElement.setAttribute('data-theme', newTheme)`.
6. El sistema guarda la preferencia en el almacenamiento local: `localStorage.setItem('theme', newTheme)`.
7. El sistema actualiza el icono y el texto de ayuda contextual (`title` y `aria-label`).
8. La interfaz transiciona de forma fluida todos sus fondos, tarjetas, textos y sombras gracias a las variables CSS.

#### Flujos Alternativos:
- **FA-06.1: Primera visita del usuario (sin preferencia previa guardada):**
  - Al cargar la página, si no existe la clave `'theme'` en `localStorage`, el sistema consulta la configuración del sistema operativo mediante `window.matchMedia('(prefers-color-scheme: dark)')`. Si el usuario tiene el sistema operativo en modo oscuro, la plataforma se inicializa automáticamente en modo oscuro; de lo contrario, en modo claro.

#### Reglas de Negocio:
- **RN-06.1:** La preferencia de tema debe persistir indefinidamente entre recargas de página y sesiones posteriores en el mismo navegador.

---

### CU-07: Navegar entre Secciones mediante Enlaces Anclados y Scroll Suave

- **Identificador:** CU-07
- **Nombre:** Navegación Asistida con Desplazamiento Suave (Smooth Scroll).
- **Actor Principal:** Estudiante / Docente.
- **Precondiciones:** El documento debe tener renderizados los enlaces con identificadores ancla (`href="#..."`).
- **Disparador:** El usuario hace clic en un enlace de navegación del encabezado, del cuerpo o del pie de página.

#### Flujo Principal:
1. El usuario hace clic en un enlace que contiene una referencia ancla (ej. `#modulos`, `#taller`, `#figuras`, `#cuestionario`).
2. El controlador `initSmoothScroll()` intercepta el evento de clic mediante `preventDefault()`.
3. El sistema identifica el elemento de destino mediante `document.querySelector(targetId)`.
4. Si el destino existe en el DOM, el sistema invoca `target.scrollIntoView({ behavior: 'smooth', block: 'start' })`.
5. La ventana del navegador se desplaza de forma fluida y continua hasta la sección seleccionada, mejorando la experiencia de lectura.

#### Reglas de Negocio:
- **RN-07.1:** Los enlaces con `href="#"` vacío o huérfano deben ser ignorados por el controlador para evitar saltos indeseados a la parte superior de la página.

---

### CU-08: Iniciar Sesión y Redirección al Panel Correspondiente según Rol

- **Identificador:** CU-08
- **Nombre:** Autenticación de Usuario y Control de Acceso por Roles.
- **Actores Principales:** Administrador, Docente, Estudiante.
- **Precondiciones:** El usuario debe estar registrado activamente en la base de datos `users`.
- **Disparador:** El usuario ingresa a `login.html`, introduce sus credenciales y hace clic en "Ingresar a la Plataforma".

#### Flujo Principal:
1. El usuario introduce su correo institucional y su contraseña.
2. El cliente valida que los campos no estén vacíos y envía una petición `POST` a `/api/auth/login.php`.
3. El backend busca el usuario por email y valida el hash con `password_verify()`.
4. Si es correcto, el servidor regenera el ID de sesión, guarda los datos del perfil en `$_SESSION` y responde con `success: true` y el rol del usuario.
5. El cliente procesa la respuesta y redirige al dashboard asignado:
   - Administrador ➔ `/dashboard/admin/index.html`
   - Docente ➔ `/dashboard/docente/index.html`
   - Estudiante ➔ `/dashboard/estudiante/index.html`

#### Flujos Alternativos:
- **FA-08.1: Credenciales inválidas:** El sistema responde HTTP 401 con el mensaje *"Correo o contraseña incorrectos"*; el cliente muestra una alerta visual y no redirige.
- **FA-08.2: Cuenta desactivada:** Si `activo = 0`, el sistema deniega el acceso informando que la cuenta ha sido suspendida.

---

### CU-09: Crear y Configurar Quizzes de Opción Múltiple (Panel Docente)

- **Identificador:** CU-09
- **Nombre:** Creación Dinámica de Actividades Evaluativas Tipo Quiz.
- **Actor Principal:** Docente.
- **Precondiciones:** Sesión activa con rol `docente`.
- **Disparador:** El docente hace clic en "Nueva Actividad" en `dashboard/docente/actividades.html`.

#### Flujo Principal:
1. El docente selecciona el tipo de actividad: *"🎯 Quiz Interactivo (Auto-calificable)"*.
2. El sistema despliega el contenedor del Constructor de Quizzes.
3. El docente puede:
   - Pulsar *"✨ Preguntas de Muestra (Lengua 9no)"* para cargar reactivos pedagógicos preconfigurados, o
   - Pulsar *"➕ Añadir Pregunta"* para redactar un reactivo personalizado con 4 alternativas (A, B, C, D), marcando el círculo de la opción correcta y redactando una explicación pedagógica.
4. El docente asigna la calificación máxima (ej. 10 pts) y la fecha límite de entrega.
5. El docente guarda la actividad.
6. El cliente empaqueta el payload JSON y realiza una petición `POST` a `/api/activities/create.php`.
7. El servidor inserta la actividad en `activities`, las preguntas en `quiz_templates` y notifica a los estudiantes.

---

### CU-10: Organizar Actividades, Responder Quiz y Obtener Calificación Automática

- **Identificador:** CU-10
- **Nombre:** Resolución de Cuestionario Interactivo y Evaluación Inmediata.
- **Actor Principal:** Estudiante.
- **Precondiciones:** Estudiante autenticado y actividad de tipo `quiz` activa y no vencida.
- **Disparador:** El estudiante pulsa *"🚀 Realizar Quiz Dinámico"* en `dashboard/estudiante/actividades.html`.

#### Flujo Principal:
1. El estudiante utiliza las pestañas de filtro (`⏳ Pendientes`) o el buscador para ubicar la actividad.
2. El estudiante pulsa *"🚀 Realizar Quiz Dinámico"*.
3. El sistema realiza una petición `GET` a `/api/activities/quiz.php?activity_id=X`, recuperando las preguntas de forma segura (sin las respuestas correctas).
4. El modal `#quizPlayerModal` se despliega en pantalla completa mostrando la barra de progreso y la primera pregunta.
5. El estudiante selecciona una opción para cada reactivo (A, B, C, D) y avanza mediante el botón *"Siguiente ▶"*.
6. En la última pregunta, el estudiante pulsa *"🚀 Enviar y Calificar"*.
7. El cliente envía las respuestas a `/api/activities/submit.php`.
8. El servidor evalúa las respuestas contra la plantilla, calcula la nota proporcional a la nota máxima, registra la entrega con estado `calificada`, crea el registro en `grades` con retroalimentación automática y notifica a ambas partes.
9. El cliente recibe la calificación y despliega la pantalla de celebración (🎉) mostrando la nota, el porcentaje de aciertos y el desglose de explicaciones pedagógicas pregunta por pregunta.

---

### CU-11: Gestionar Cuentas de Usuario y Emitir Comunicados Globales

- **Identificador:** CU-11
- **Nombre:** Administración de Usuarios y Comunicación Institucional.
- **Actor Principal:** Administrador.
- **Precondiciones:** Sesión activa con rol `admin`.
- **Disparador:** El administrador accede al panel de usuarios o notificaciones.

#### Flujo Principal:
1. El administrador accede a `dashboard/admin/usuarios.html`.
2. Puede registrar nuevos docentes o estudiantes, modificar nombres, actualizar correos o cambiar estados activo/inactivo.
3. El sistema valida los datos y registra la operación en la tabla de auditoría `audit_logs`.
4. El administrador accede a `dashboard/admin/notificaciones.html` y redacta un comunicado institucional.
5. Selecciona el público objetivo (Todos, solo docentes o solo estudiantes).
6. El backend genera registros masivos en la tabla `notifications`, haciéndolos visibles de forma instantánea en la campana de notificaciones de los destinatarios.

