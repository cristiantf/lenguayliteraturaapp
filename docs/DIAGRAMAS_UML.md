# 📐 Diagramas UML del Proyecto: Lengua y Literatura 9.º EGB

Este documento contiene la especificación y el modelado formal del sistema mediante el Lenguaje Unificado de Modelado (**UML**), representado a través de diagramas en sintaxis estándar de **Mermaid**.

---

## 1. Diagrama de Casos de Uso

Representa los actores principales del ecosistema y sus interacciones con las capacidades funcionales de la plataforma web.

```mermaid
flowchart LR
    %% Actores
    subgraph ACTORES["Actores del Sistema"]
        ADM["👨‍💼 Administrador"]
        DOC["👩‍🏫 Docente"]
        EST["👨‍🎓 Estudiante 9º EGB"]
        SRV["🖥️ Backend PHP & MySQL"]
    end

    %% Casos de Uso
    subgraph PLATAFORMA["Plataforma Educativa Full-Stack"]
        CU01(["CU-01: Explorar Unidades Curriculares y Fichas"])
        CU02(["CU-02: Visualizar Lecciones Clave"])
        CU03(["CU-03: Redactar Ensayo en Taller"])
        CU04(["CU-04: Autoevaluación Diagnóstica Pública"])
        CU05(["CU-05: Laboratorio 3D de Figuras Retóricas"])
        CU06(["CU-06: Conmutar Modo Claro/Oscuro"])
        CU08(["CU-08: Iniciar Sesión por Rol"])
        CU09(["CU-09: Constructor de Quizzes Auto-Calificables"])
        CU10(["CU-10: Quiz Player Interactivo y Auto-Calificación"])
        CU11(["CU-11: Gestión de Usuarios y Comunicados"])
    end

    %% Relaciones de Administrador
    ADM --> CU08
    ADM --> CU11

    %% Relaciones de Docente
    DOC --> CU08
    DOC --> CU09
    DOC --> CU01

    %% Relaciones de Estudiante
    EST --> CU01
    EST --> CU05
    EST --> CU08
    EST --> CU10
    EST --> CU06

    %% Procesamiento del Backend
    CU08 --> SRV
    CU09 --> SRV
    CU10 --> SRV
    CU11 --> SRV
```

---

## 2. Diagrama de Clases y Estructuras de Datos

Modela la organización orientada a objetos y estructuras modulares presentes en la capa lógica (`js/main.js`), sus propiedades, métodos y relaciones de dependencia.

```mermaid
classDiagram
    direction TB

    class App {
        +init() void
    }

    class ThemeController {
        -String currentTheme
        +initThemeToggle() void
        +updateThemeIcon(theme: String) void
        -getSavedTheme() String
    }

    class ModuleController {
        -HTMLElement modalElement
        +initModuleDetailsModal() void
        +renderModuleModalContent(data: ModuleData) void
        +openModal(moduleId: Number) void
        +closeModal() void
    }

    class ModuleData {
        +String title
        +String badge
        +String description
        +List~String~ topics
        +List~DetailBlock~ details
    }

    class DetailBlock {
        +String title
        +String text
    }

    class EssayBuilderController {
        -HTMLInputElement topicInput
        -HTMLInputElement thesisInput
        -HTMLTextAreaElement argInput
        -HTMLElement previewBox
        +initEssayBuilder() void
        +updatePreview() void
    }

    class QuizEvaluationEngine {
        -HTMLButtonElement btnCalcular
        +initAutoevaluacion() void
        +validateAllAnswered(answers: Map) Boolean
        +calculateScore(answers: Map) Number
        +generateFeedbackMessage(score: Number) String
    }

    class QuizQuestion {
        +String question
        +List~String~ options
        +Number answer
        +String explanation
    }

    class NotificationService {
        +showFloatingToast(contentHTML: String) void
        +closeFloatingToast() void
    }

    class FlashcardController {
        -NodeList flashcards
        +initFlashcards() void
        +toggleFlip(cardElement: HTMLElement) void
    }

    %% Relaciones
    App --> ThemeController : inicializa
    App --> ModuleController : inicializa
    App --> EssayBuilderController : inicializa
    App --> QuizEvaluationEngine : inicializa
    App --> FlashcardController : inicializa

    ModuleController ..> ModuleData : consume datos de
    ModuleData *-- DetailBlock : contiene bloques de

    QuizEvaluationEngine ..> NotificationService : envía diagnóstico a
    QuizEvaluationEngine ..> QuizQuestion : evalúa con banco de
```

---

## 3. Diagramas de Secuencia

### 3.1 Flujo de Autoevaluación Interactiva y Cálculo de Calificación
Describe la interacción desde que el alumno selecciona las opciones del cuestionario hasta la presentación del resultado flotante.

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante
    participant Form as Formulario Cuestionario (DOM)
    participant Engine as QuizEvaluationEngine
    participant Notifier as NotificationService
    participant Toast as Toast Flotante (DOM)

    Estudiante->>Form: Selecciona opciones de radio (q1, q2, q3)
    Estudiante->>Form: Clic en "📊 Calcular Calificación"
    Form->>Engine: Dispara evento 'click' en #btn-calcular-calificacion
    Engine->>Form: Consulta inputs seleccionados (q1:checked, q2:checked, q3:checked)
    
    alt Alguna pregunta no fue respondida
        Form-->>Engine: Retorna null en al menos una pregunta
        Engine->>Notifier: showFloatingToast(mensajeDeAdvertencia)
        Notifier->>Toast: Inserta mensaje "Preguntas Incompletas (⚠️)"
        Toast-->>Estudiante: Visualiza alerta de validación
    else Las 3 preguntas fueron contestadas
        Form-->>Engine: Retorna valores seleccionados (val1, val2, val3)
        Engine->>Engine: correctCount = val1 + val2 + val3
        Engine->>Engine: totalScore = (correctCount / 3) * 10.0
        Engine->>Engine: Compone mensaje cualitativo y desglose de aciertos
        Engine->>Notifier: showFloatingToast(toastHTML con nota y feedback)
        Notifier->>Toast: Renderiza modal flotante animado
        Toast-->>Estudiante: Visualiza calificación (ej. 10.0/10 pts) y retroalimentación
    end

    opt Cierre manual del feedback
        Estudiante->>Toast: Clic en botón de cerrar (x)
        Toast->>Notifier: Invoca closeFloatingToast()
        Notifier->>Toast: Remueve elemento #floating-feedback-toast del DOM
    end
```

---

### 3.2 Consulta Dinámica de Detalle de Módulo Curricular
Ilustra el proceso de extracción de datos del bloque y su inyección en la ventana modal personalizada.

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante
    participant Boton as Botón .js-open-module
    participant Controller as ModuleController
    participant Repo as MODULES_DATA
    participant Modal as Modal #module-modal (DOM)

    Estudiante->>Boton: Clic en "Ver Detalle" (data-module-id="1")
    Boton->>Controller: Captura evento de clic
    Controller->>Boton: Lee atributo 'data-module-id'
    Controller->>Repo: Consulta MODULES_DATA[1]
    Repo-->>Controller: Retorna objeto {title, badge, description, topics, details}
    
    Controller->>Controller: renderModuleModalContent(data) (Genera HTML dinámico)
    Controller->>Modal: Actualiza #modal-title, #modal-badge y #modal-body-content
    Controller->>Modal: Agrega clase CSS '.active'
    Controller->>Modal: body.style.overflow = 'hidden' (Bloquea scroll)
    Modal-->>Estudiante: Despliega ventana modal con información completa

    alt Cierre por botón cerrar
        Estudiante->>Modal: Clic en botón cerrar (#modal-close)
    else Cierre por clic fuera
        Estudiante->>Modal: Clic en overlay exterior (#module-modal)
    end

    Modal->>Controller: Dispara manejador de cierre
    Controller->>Modal: Remueve clase '.active'
    Controller->>Modal: body.style.overflow = '' (Restaura scroll de página)
    Modal-->>Estudiante: Modal cerrado
```

---

### 3.3 Redacción Reactiva en el Taller de Ensayo Argumentativo
Muestra la respuesta inmediata a la pulsación de teclas durante la construcción de la tesis y argumentos.

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante
    participant Input as Inputs del Taller (Tema, Tesis, Argumento)
    participant Builder as EssayBuilderController
    participant Output as Previsualización (#essay-preview-output)

    Estudiante->>Input: Escribe tema, tesis o argumento (Evento 'input')
    Input->>Builder: Notifica cambio de valor en tiempo real
    Builder->>Input: Lee valores (topic.trim(), thesis.trim(), arg.trim())
    
    alt Todos los campos están vacíos
        Builder->>Output: Muestra mensaje por defecto en color muted
    else Al menos un campo contiene texto
        Builder->>Builder: Estructura tarjeta visual con iconos (🎯, 💡, 🛡️)
        Builder->>Output: Actualiza innerHTML con la ficha de borrador estructurado
    end

    Output-->>Estudiante: Observa actualización instantánea sin recargar la página
```

---

## 4. Diagramas de Estados (State Machine)

### 4.1 Ciclo de Vida del Tema Visual (Dark / Light Mode)
Modela las transiciones del tema de acuerdo con las acciones del usuario y las preferencias del navegador.

```mermaid
stateDiagram-v2
    [*] --> DeteccionInicial : Carga de la página (DOMContentLoaded)

    state DeteccionInicial {
        [*] --> VerificarLocalStorage
        VerificarLocalStorage --> TemaAlmacenado : 'theme' existe en localStorage
        VerificarLocalStorage --> ConsultarSistema : 'theme' no definido
        ConsultarSistema --> ModoOscuro : prefers-color-scheme es dark
        ConsultarSistema --> ModoClaro : prefers-color-scheme es light
        TemaAlmacenado --> ModoOscuro : Valor es 'dark'
        TemaAlmacenado --> ModoClaro : Valor es 'light'
    }

    DeteccionInicial --> ModoClaroActivo : Aplica data-theme="light"
    DeteccionInicial --> ModoOscuroActivo : Aplica data-theme="dark"

    state ModoClaroActivo {
        ModoClaroActivo : data-theme="light"
        ModoClaroActivo : Icono del botón = "🌙"
        ModoClaroActivo : Variables claras aplicadas
    }

    state ModoOscuroActivo {
        ModoOscuroActivo : data-theme="dark"
        ModoOscuroActivo : Icono del botón = "☀️"
        ModoOscuroActivo : Variables oscuras aplicadas
    }

    ModoClaroActivo --> ModoOscuroActivo : Clic en #theme-toggle / Guarda en localStorage
    ModoOscuroActivo --> ModoClaroActivo : Clic en #theme-toggle / Guarda en localStorage
```

---

### 4.2 Estados del Motor de Autoevaluación
Modela el estado del cuestionario formativo.

```mermaid
stateDiagram-v2
    [*] --> NoIniciado : Carga del Formulario

    state NoIniciado {
        NoIniciado : Sin opciones seleccionadas
        NoIniciado : Sin resultado visible
    }

    NoIniciado --> EnProgreso : Estudiante marca alguna respuesta
    
    state EnProgreso {
        EnProgreso : Respuestas parciales registradas
    }

    EnProgreso --> Validando : Clic en "📊 Calcular Calificación"

    state Validando <<choice>>
    Validando --> ErrorIncompleto : Faltan preguntas por contestar
    Validando --> Evaluado : Las 3 preguntas respondidas

    state ErrorIncompleto {
        ErrorIncompleto : Muestra toast de advertencia ⚠️
    }

    ErrorIncompleto --> EnProgreso : El estudiante completa preguntas faltantes

    state Evaluado {
        [*] --> DesgloseResultado
        DesgloseResultado --> NivelExcelente : 3 aciertos (10.0 pts)
        DesgloseResultado --> NivelBueno : 2 aciertos (6.7 pts)
        DesgloseResultado --> NivelRefuerzo : 0 o 1 acierto (<= 3.3 pts)
    }

    Evaluado --> EnProgreso : El estudiante modifica una respuesta
```

---

## 5. Diagrama de Actividades / Recorrido Pedagógico del Estudiante

Muestra el flujo de navegación y aprendizaje que sigue un estudiante de 9.º EGB en la plataforma.

```mermaid
flowchart TD
    INICIO([Acceso a la Plataforma Web]) --> BIENVENIDA[Lectura de Hero Section y Metas de 9º EGB]
    BIENVENIDA --> ELECCION{¿Qué actividad desea realizar?}

    %% Ruta 1: Bloques Curriculares
    ELECCION -->|Consultar Contenidos| MODULOS[Revisión de Bloques Curriculares 01 al 05]
    MODULOS --> VER_DETALLE[Clic en 'Ver Detalle' de un Bloque]
    VER_DETALLE --> MODAL_INFO[Lectura de Temas y Desarrollo Conceptual]
    MODAL_INFO --> CERRAR_MODAL[Cierra modal y continúa exploración]
    CERRAR_MODAL --> ELECCION

    %% Ruta 2: Lecciones Específicas
    ELECCION -->|Lecciones Temáticas| LECCIONES[Sección de Lecciones Clave]
    LECCIONES --> SELEC_LECCION{Selecciona Lección}
    SELEC_LECCION -->|Literatura| POLICIAL[Modal: La Novela Policial y Enigma]
    SELEC_LECCION -->|Ortografía| ORTOGRAFIA[Modal: Reglas de Uso de G y J]
    SELEC_LECCION -->|Redacción| EXPOSITIVO[Modal: Estructura del Texto Expositivo]
    POLICIAL --> CIERRA_LEC[Cierra Lección]
    ORTOGRAFIA --> CIERRA_LEC
    EXPOSITIVO --> CIERRA_LEC
    CIERRA_LEC --> ELECCION

    %% Ruta 3: Taller de Ensayo
    ELECCION -->|Práctica de Escritura| TALLER[Taller de Ensayo Argumentativo]
    TALLER --> ESCRIBIR[Redacta Tema, Tesis y Evidencia]
    ESCRIBIR --> PREVIEW[Revisa previsualización estructurada en tiempo real]
    PREVIEW --> ELECCION

    %% Ruta 4: Figuras Literarias
    ELECCION -->|Lírica y Poesía| FIGURAS[Laboratorio de Figuras Literarias]
    FIGURAS --> FLIP_CARD[Gira Flashcards para descubrir concepto y ejemplos]
    FLIP_CARD --> ELECCION

    %% Ruta 5: Autoevaluación
    ELECCION -->|Comprobar Aprendizaje| QUIZ[Autoevaluación Interactiva 9º EGB]
    QUIZ --> RESPONDER[Marca las 3 preguntas clave]
    RESPONDER --> CALCULAR[Clic en 'Calcular Calificación']
    CALCULAR --> VALIDACION{¿Están completas?}
    VALIDACION -->|No| TOAST_WARN[Visualiza Toast de Advertencia y completa]
    TOAST_WARN --> RESPONDER
    VALIDACION -->|Sí| TOAST_SCORE[Visualiza Calificación sobre 10 y Diagnóstico]
    TOAST_SCORE --> FIN([Fin de la Sesión de Estudio])
```

---

## 6. Diagrama de Componentes de Software

Muestra la integración de módulos lógicos internos con las librerías del cliente:

```mermaid
componentDiagram
    package "Plataforma Web (Lengua-Literatura-9no)" {
        [index.html] as HTML
        [css/style.css] as CSS
        [js/main.js] as JS

        folder "Módulos Lógicos en main.js" {
            [ThemeManager] as TM
            [ModuleManager] as MM
            [EssayBuilder] as EB
            [QuizEngine] as QE
            [Flashcards] as FC
            [ToastNotification] as TN
        }
    }

    cloud "Servicios en la Nube / CDN" {
        [Bootstrap 5.3.3 CSS & JS Bundle] as BS_CDN
        [Google Fonts: Outfit & Playfair Display] as GF_CDN
    }

    HTML --> CSS : Vincula estilos
    HTML --> JS : Ejecuta script principal
    HTML ..> BS_CDN : Carga estilos y componentes modales
    CSS ..> GF_CDN : Importa familias tipográficas
    
    JS *-- TM
    JS *-- MM
    JS *-- EB
    JS *-- QE
    JS *-- FC
    JS *-- TN
```

---

## 7. Diagrama Entidad-Relación (ER) de la Base de Datos

Modela la persistencia relacional en MySQL de los usuarios, actividades, cuestionarios, entregas, calificaciones y notificaciones:

```mermaid
erDiagram
    USERS ||--o{ ACTIVITIES : "crea (docente)"
    USERS ||--o{ SUBMISSIONS : "entrega (estudiante)"
    USERS ||--o{ GRADES : "evalua (docente)"
    USERS ||--o{ NOTIFICATIONS : "recibe"
    USERS ||--o{ AUDIT_LOGS : "genera"

    ACTIVITIES ||--|| QUIZ_TEMPLATES : "define"
    ACTIVITIES ||--o{ SUBMISSIONS : "recibe"

    SUBMISSIONS ||--o| GRADES : "obtiene"

    USERS {
        int id PK
        string nombre
        string apellido
        string email UK
        string password
        enum rol "admin, docente, estudiante"
        boolean activo
        timestamp created_at
    }

    ACTIVITIES {
        int id PK
        int docente_id FK
        string titulo
        text descripcion
        enum tipo "archivo, quiz, mixta"
        datetime fecha_inicio
        datetime fecha_limite
        decimal nota_maxima
        boolean activa
    }

    QUIZ_TEMPLATES {
        int id PK
        int activity_id FK
        json preguntas "Array de preguntas, opciones, respuesta y explicacion"
    }

    SUBMISSIONS {
        int id PK
        int activity_id FK
        int estudiante_id FK
        text respuesta_texto
        string archivo_url
        json quiz_respuestas "Respuestas marcadas"
        decimal quiz_score
        enum estado "entregada, calificada, retrasada"
        timestamp fecha_entrega
    }

    GRADES {
        int id PK
        int submission_id FK
        int docente_id FK
        decimal nota
        text retroalimentacion
        timestamp fecha_calificacion
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string tipo
        string titulo
        text mensaje
        string url
        boolean leida
        timestamp created_at
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string accion
        string tabla_afectada
        int registro_id
        string ip
        timestamp created_at
    }
```

---

## 8. Diagrama de Secuencia: Auto-Calificación de Quizzes

Ilustra la interacción dinámica entre el estudiante, la interfaz interactiva, la API REST en PHP y la base de datos MySQL:

```mermaid
sequenceDiagram
    autonumber
    actor Estudiante
    participant UI as Quiz Player Modal (JS)
    participant API as submit.php (PHP 8)
    participant DB as MySQL (lengua_literatura_9no)

    Estudiante->>UI: Selecciona opciones A, B, C, D
    Estudiante->>UI: Clic en "🚀 Enviar y Calificar"
    UI->>API: POST /api/activities/submit.php {actividad_id, quiz_respuestas}
    
    API->>DB: SELECT preguntas FROM quiz_templates WHERE activity_id = ?
    DB-->>API: Plantilla de preguntas y respuestas correctas

    Note over API: Computa aciertos y calcula nota proporcional a nota_maxima
    
    API->>DB: INSERT INTO submissions (estado = 'calificada', quiz_score = ?)
    API->>DB: INSERT INTO grades (nota = ?, retroalimentacion = 'Auto-calificación...')
    API->>DB: INSERT INTO notifications (Estudiante + Docente)

    API-->>UI: 201 Created {quiz_score, quiz_correct, quiz_feedback}

    UI-->>Estudiante: Muestra vista festiva 🎉 con Nota, Porcentaje y Desglose didáctico
```

