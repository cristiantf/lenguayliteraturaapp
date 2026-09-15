-- ===========================================================================
-- Lengua y Literatura 9no EGB - Datos Iniciales Completos (Seed)
-- Unidad Educativa Fiscomisional San Lorenzo
-- ===========================================================================

USE lengua_literatura_9no;

-- Limpieza previa segura para re-ejecución
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_log;
TRUNCATE TABLE notifications;
TRUNCATE TABLE grades;
TRUNCATE TABLE submissions;
TRUNCATE TABLE activity_files;
TRUNCATE TABLE quiz_templates;
TRUNCATE TABLE activities;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ===========================================================================
-- 1. USUARIOS (1 Admin, 1 Docente, 5 Estudiantes)
-- Contraseñas hasheadas con bcrypt real:
-- Admin: Admin2026!
-- Docente: Docente2026!
-- Estudiantes: Est2026!
-- ===========================================================================
INSERT INTO users (id, nombre, apellido, email, password_hash, rol, activo) VALUES
(1, 'Administrador', 'Sistema', 'admin@sanlorenzo.edu.ec',
 '$2y$10$CxF.4Xcdn3PSu/mYk.KGzeSUNtuPjJLRW6JSnuhW9.MnhniK5VB8K', 'admin', TRUE),

(2, 'María', 'González Torres', 'maria.gonzalez@sanlorenzo.edu.ec',
 '$2y$10$LnxlRgJxHV1/GZY/1Mo.Hepq7QFoIUZKb9iAmO/nEq3gPEHs8y6N2', 'docente', TRUE),

(3, 'Carlos', 'Ramírez López', 'carlos.ramirez@sanlorenzo.edu.ec',
 '$2y$10$U3OQMmjWCDSjOtFX3ueC2eG6Po8OfchQFC3RlkJw4Tcf6030h7J.S', 'estudiante', TRUE),

(4, 'Ana', 'Morales Pérez', 'ana.morales@sanlorenzo.edu.ec',
 '$2y$10$U3OQMmjWCDSjOtFX3ueC2eG6Po8OfchQFC3RlkJw4Tcf6030h7J.S', 'estudiante', TRUE),

(5, 'Luis', 'Fernández Castro', 'luis.fernandez@sanlorenzo.edu.ec',
 '$2y$10$U3OQMmjWCDSjOtFX3ueC2eG6Po8OfchQFC3RlkJw4Tcf6030h7J.S', 'estudiante', TRUE),

(6, 'Sofía', 'Herrera Medina', 'sofia.herrera@sanlorenzo.edu.ec',
 '$2y$10$U3OQMmjWCDSjOtFX3ueC2eG6Po8OfchQFC3RlkJw4Tcf6030h7J.S', 'estudiante', TRUE),

(7, 'Diego', 'Paredes Villacís', 'diego.paredes@sanlorenzo.edu.ec',
 '$2y$10$U3OQMmjWCDSjOtFX3ueC2eG6Po8OfchQFC3RlkJw4Tcf6030h7J.S', 'estudiante', TRUE);

-- ===========================================================================
-- 2. ACTIVIDADES (6 actividades para demostrar paginación y estados)
-- ===========================================================================
INSERT INTO activities (id, docente_id, titulo, descripcion, tipo, fecha_inicio, fecha_limite, nota_maxima, activa) VALUES
(1, 2, 'Análisis de la Escritura Cuneiforme',
 'Investiga sobre el origen de la escritura cuneiforme en Mesopotamia. Redacta un ensayo de mínimo 300 palabras explicando su importancia histórica y su influencia en los sistemas de escritura posteriores. Incluye al menos 2 fuentes bibliográficas.',
 'archivo', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 10.00, TRUE),

(2, 2, 'Quiz — Unidad 1: La aventura de escribir',
 'Cuestionario de repaso sobre los contenidos de la Unidad 1: pictogramas, ideogramas, fonogramas, escritura cuneiforme, alfabeto fenicio y la entrevista.',
 'quiz', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 10.00, TRUE),

(3, 2, 'Redacción de una Entrevista a un Personaje Histórico',
 'Elige un personaje histórico relevante (escritor, científico o líder) y diseña un guion de entrevista formal con introducción, 8 preguntas abiertas y conclusión reflexiva.',
 'archivo', NOW(), DATE_ADD(NOW(), INTERVAL 10 DAY), 10.00, TRUE),

(4, 2, 'Taller de Figuras Literarias: Metáforas y Metonimias',
 'Identifica 5 figuras literarias presentes en los poemas seleccionados del modernismo ecuatoriano. Explica el significado connotativo de cada una.',
 'archivo', NOW(), DATE_ADD(NOW(), INTERVAL 12 DAY), 10.00, TRUE),

(5, 2, 'Ensayo Argumentativo sobre la Comunicación Digital',
 'Escribe un texto argumentativo de 400 palabras analizando el impacto de las redes sociales en los hábitos de lectura de los adolescentes.',
 'archivo', NOW(), DATE_ADD(NOW(), INTERVAL 14 DAY), 10.00, TRUE),

(6, 2, 'Glosario de Términos Lingüísticos y Literarios',
 'Elabora un glosario con 15 términos clave estudiados en el primer trimestre, incluyendo definición propia y un ejemplo contextualizado.',
 'archivo', NOW(), DATE_ADD(NOW(), INTERVAL 20 DAY), 10.00, TRUE);

-- ===========================================================================
-- 3. PLANTILLA QUIZ PARA ACTIVIDAD 2
-- ===========================================================================
INSERT INTO quiz_templates (activity_id, preguntas) VALUES
(2, '[
    {"question": "¿Qué diferencia hay entre un pictograma y un ideograma?", "options": ["Ambos representan sonidos del habla", "El pictograma dibuja un objeto concreto; el ideograma representa una idea o concepto abstracto", "El ideograma es más antiguo que el pictograma", "No hay diferencia, son sinónimos"], "answer": 1, "explanation": "El pictograma representa objetos de forma directa mediante dibujos, mientras que el ideograma simboliza ideas o conceptos abstractos."},
    {"question": "¿Cuál fue la principal contribución del alfabeto fenicio a la historia de la escritura?", "options": ["Inventó las vocales", "Creó el primer sistema de escritura pictográfico", "Introdujo un sistema de signos que representaban sonidos consonánticos individuales, simplificando la escritura", "Desarrolló la escritura cuneiforme"], "answer": 2, "explanation": "Los fenicios crearon un alfabeto de signos consonánticos que simplificó enormemente la escritura."},
    {"question": "¿Cuál es el propósito principal de una entrevista periodística?", "options": ["Narrar una historia ficticia para entretener al público", "Obtener información, opiniones o testimonios de una persona mediante preguntas y respuestas", "Redactar un editorial con la opinión del periodista", "Presentar datos estadísticos sin contexto"], "answer": 1, "explanation": "La entrevista es un género dialógico cuyo propósito es obtener información directa de una fuente."}
]');

-- ===========================================================================
-- 4. ENTREGAS DE ESTUDIANTES (Submissions)
-- ===========================================================================
INSERT INTO submissions (id, activity_id, estudiante_id, respuesta_texto, fecha_entrega, estado) VALUES
-- Carlos Ramírez (ID: 3)
(1, 1, 3, 'La escritura cuneiforme, nacida en Sumeria hace más de 5000 años, marcó el inicio de la historia registrada. Desarrollada inicialmente para fines contables en tablillas de arcilla, evolucionó hacia un sistema capaz de registrar leyes como el Código de Hammurabi y literatura como la Epopeya de Gilgamesh. Su importancia radica en que permitió la preservación del conocimiento humano a través de generaciones.', DATE_SUB(NOW(), INTERVAL 2 DAY), 'calificada'),
(2, 2, 3, 'Quiz completado exitosamente en línea.', DATE_SUB(NOW(), INTERVAL 1 DAY), 'calificada'),
(3, 3, 3, 'Guion de entrevista a Medardo Ángel Silva sobre la melancolía y el simbolismo en la poesía guayaquileña de principios del siglo XX. Incluye preguntas sobre sus lecturas de Verlaine y Baudelaire.', NOW(), 'entregada'),

-- Ana Morales (ID: 4)
(4, 1, 4, 'Ensayo sobre los pictogramas sumerios y su transición al cuneiforme. Se explica la importancia del estilete de caña y la forma de cuña que dio nombre a este sistema de escritura.', DATE_SUB(NOW(), INTERVAL 3 DAY), 'calificada'),
(5, 2, 4, 'Quiz completado en el portal.', DATE_SUB(NOW(), INTERVAL 2 DAY), 'calificada'),

-- Luis Fernández (ID: 5)
(6, 1, 5, 'Trabajo de investigación sobre Mesopotamia, los escribas y el valor administrativo de los cilindros sellos y tablillas cuneiformes.', DATE_SUB(NOW(), INTERVAL 2 DAY), 'calificada'),
(7, 3, 5, 'Entrevista imaginaria a Juan Montalvo sobre "Los Siete Tratados" y su visión de la libertad de expresión.', NOW(), 'entregada'),

-- Sofía Herrera (ID: 6)
(8, 1, 6, 'Monografía breve: Del barro al alfabeto digital. Un recorrido desde las tablillas de Uruk hasta los hipertextos actuales.', DATE_SUB(NOW(), INTERVAL 1 DAY), 'calificada');

-- ===========================================================================
-- 5. CALIFICACIONES ASIGNADAS (Grades)
-- ===========================================================================
INSERT INTO grades (submission_id, docente_id, nota, retroalimentacion, fecha_calificacion) VALUES
(1, 2, 9.50, 'Excelente estructura argumentativa y adecuado uso de fuentes históricas sobre Mesopotamia.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(2, 2, 10.00, '¡Puntaje perfecto en el quiz de la Unidad 1! Demuestras dominio de los conceptos.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(4, 2, 8.75, 'Buen trabajo. Profundiza un poco más en la evolución fonética del sistema cuneiforme.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 2, 9.00, 'Muy buen desempeño en las preguntas conceptuales sobre el alfabeto fenicio.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(6, 2, 8.00, 'Trabajo correcto. Recuerda citar formalmente la bibliografía utilizada al final.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(8, 2, 10.00, '¡Brillante ensayo! Muy buena conexión analítica entre el soporte físico de la arcilla y el mundo contemporáneo.', NOW());

-- ===========================================================================
-- 6. NOTIFICACIONES DE DEMOSTRACIÓN
-- ===========================================================================
INSERT INTO notifications (usuario_id, tipo, titulo, mensaje, enlace, leida) VALUES
-- Para Carlos Ramírez (Estudiante 3)
(3, 'actividad_calificada', '¡Actividad calificada!',
 'Tu docente María González ha calificado tu ensayo "Análisis de la Escritura Cuneiforme" con 9.50/10.',
 'dashboard/estudiante/calificaciones.html', FALSE),
(3, 'actividad_calificada', 'Quiz calificado',
 'Tu quiz "Quiz — Unidad 1: La aventura de escribir" fue calificado con 10.00/10.',
 'dashboard/estudiante/calificaciones.html', FALSE),
(3, 'nueva_actividad', 'Nueva actividad asignada',
 'Se ha publicado la actividad "Redacción de una Entrevista a un Personaje Histórico". Plazo: 10 días.',
 'dashboard/estudiante/actividades.html', TRUE),

-- Para María González (Docente 2)
(2, 'entrega_pendiente', 'Nueva entrega para calificar',
 'El estudiante Carlos Ramírez ha enviado su entrega para "Redacción de una Entrevista a un Personaje Histórico".',
 'dashboard/docente/calificar.html', FALSE),
(2, 'entrega_pendiente', 'Nueva entrega para calificar',
 'El estudiante Luis Fernández ha enviado su entrega para "Redacción de una Entrevista a un Personaje Histórico".',
 'dashboard/docente/calificar.html', FALSE),

-- Para Administrador (Usuario 1)
(1, 'nueva_actividad', 'Actividad creada en la plataforma',
 'La docente María González ha registrado 6 actividades académicas para 9º EGB.',
 'dashboard/admin/index.html', FALSE);
