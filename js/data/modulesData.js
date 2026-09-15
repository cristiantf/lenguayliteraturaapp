/**
 * Lengua y Literatura 9no EGB - Datos Curriculares de Unidades
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * Contenido basado en el texto escolar "Lengua y Literatura 9"
 * (Ministerio de Educación del Ecuador, EGB Superior).
 * 4 Unidades con 5 bloques temáticos cada una.
 */

const MODULES_DATA = {
    1: {
        title: "Unidad 1 — La aventura de escribir",
        badge: "Unidad 1",
        emoji: "✍️",
        description: "Explora el origen del alfabeto, domina la entrevista, comprende la carta de lector y descubre las canciones tradicionales ecuatorianas.",
        project: "Recopilar un pequeño cancionero con canciones tradicionales de tu región, indicando autor (si se conoce), origen y una breve explicación de su significado cultural.",
        sections: [
            {
                title: "Lengua y Cultura: Del alfabeto fenicio al griego y al romano",
                icon: "📜",
                content: "El sistema de escritura que usamos hoy tiene una larga historia. La escritura cuneiforme sumeria (Mesopotamia) nació como dibujos que representaban objetos (pictogramas), luego ideas (ideogramas) y finalmente sonidos (fonogramas), grabados con un punzón en forma de cuña sobre tablillas de arcilla. Los jeroglíficos egipcios perfeccionaron la idea sumeria grabando signos en piedra. El alfabeto fenicio, creado por navegantes y comerciantes, fue el primer sistema fonético formado solo por consonantes. Los griegos adaptaron el fenicio y añadieron vocales, logrando representar el lenguaje hablado completo con 24 letras. El alfabeto latino (romano) deriva del griego a través del etrusco, y de él viene el español (27 letras según la RAE).",
                keyIdea: "Cada pueblo no «inventó desde cero» su alfabeto, sino que adaptó y mejoró el sistema del pueblo anterior. La escritura es un proceso acumulativo de la humanidad.",
                topics: [
                    "Escritura cuneiforme (sumerios, Mesopotamia)",
                    "Jeroglíficos egipcios",
                    "Alfabeto fenicio (solo consonantes)",
                    "Alfabeto griego (+ vocales, 24 letras)",
                    "Alfabeto latino → español (27 letras)"
                ]
            },
            {
                title: "Comunicación Oral: La entrevista",
                icon: "🎤",
                content: "La entrevista es un intercambio de preguntas y respuestas entre un entrevistador y un entrevistado, cuyo fin es que una audiencia conozca cierta información. Puede tener distintos propósitos: informar, persuadir, evaluar o entretener.",
                keyIdea: "Evita preguntas que se respondan solo con «sí» o «no». Usa qué, quién, cuándo, dónde, cómo y por qué para obtener respuestas más ricas.",
                topics: [
                    "Preparación — elegir persona, definir objetivo, investigar y redactar preguntas",
                    "Diálogo — realizar la entrevista, escucha activa",
                    "Edición — seleccionar y ordenar información relevante",
                    "Publicación — presentar en formato elegido (escrito, audio, video)"
                ]
            },
            {
                title: "Lectura: La carta de lector",
                icon: "📰",
                content: "Es un texto de opinión breve que los ciudadanos envían a un medio de comunicación para expresar su punto de vista sobre un tema de actualidad. Suele incluir: un saludo, la referencia al tema o artículo que motiva la carta, la opinión argumentada del autor y una despedida.",
                keyIdea: "Para elegir fuentes confiables: verifica quién es el autor, prioriza medios reconocidos y fechas recientes, contrasta con más de una fuente, y distingue entre datos verificables y opiniones.",
                topics: [
                    "Estructura: saludo, referencia, opinión argumentada, despedida",
                    "Verificación de fuentes confiables",
                    "Diferencia entre datos verificables y opiniones"
                ]
            },
            {
                title: "Escritura: Temas de lengua para escribir una carta de lector",
                icon: "✏️",
                content: "Domina los recursos gramaticales y de cohesión textual necesarios para redactar textos argumentativos claros y bien estructurados.",
                keyIdea: "La cohesión textual (pronombres, sinónimos, conectores) enlaza las ideas de un texto para que se entienda como una unidad.",
                topics: [
                    "Oraciones subordinadas sustantivas (función de sustantivo dentro de la oración principal)",
                    "Hiperónimos e hipónimos (\"flor\" → \"rosa\", \"margarita\", \"clavel\")",
                    "Cohesión textual — sustitución pronominal",
                    "Conectores lógicos: énfasis, ilustración, contraste, condición, conclusión",
                    "Uso de los dos puntos en cartas (saludo y enumeraciones)"
                ]
            },
            {
                title: "Literatura: Canciones tradicionales ecuatorianas",
                icon: "🎶",
                content: "Las canciones tradicionales (como el pasillo, el albazo o el amorfino) forman parte de la identidad cultural del Ecuador. El amorfino es una composición poético-musical de la costa ecuatoriana, generalmente en pareado o cuarteto, de tono pícaro o de coqueteo, cantada en contrapunto entre un hombre y una mujer.",
                keyIdea: "Las canciones tradicionales son expresiones culturales vivas que reflejan la identidad y las costumbres de cada región del Ecuador.",
                topics: [
                    "El pasillo ecuatoriano",
                    "El albazo",
                    "El amorfino costeño (pareado, tono pícaro, contrapunto)",
                    "Proyecto: Cancionero de canciones tradicionales"
                ]
            }
        ]
    },
    2: {
        title: "Unidad 2 — Contar lo que pasa",
        badge: "Unidad 2",
        emoji: "📰",
        description: "Descubre la escritura en la Edad Media, domina la exposición oral y la noticia, y explora el cuento clásico ecuatoriano.",
        project: "En equipo, escriban un cuento clásico (planteamiento-nudo-desenlace) ambientado en un contexto ecuatoriano reconocible.",
        sections: [
            {
                title: "Lengua y Cultura: La escritura en la Edad Media en Europa",
                icon: "🏰",
                content: "Durante la Edad Media, tras la caída del Imperio Romano, gran parte del conocimiento escrito se conservó gracias a los monasterios, donde los monjes copiaban a mano manuscritos en escritorios (scriptoria). Los textos se escribían sobre pergamino (piel tratada de animales), más resistente que el papiro. Surgieron distintos tipos de letra (carolingia, gótica) y los manuscritos se decoraban con iluminaciones (ilustraciones y letras capitales adornadas). La invención de la imprenta por Gutenberg (siglo XV) marcó el final de esta etapa.",
                keyIdea: "Antes de la imprenta, cada copia de un libro era un trabajo manual larguísimo, por lo que los libros eran escasos y muy valiosos.",
                topics: [
                    "Los scriptoria de los monasterios",
                    "El pergamino como soporte",
                    "Caligrafías: carolingia y gótica",
                    "Iluminaciones en manuscritos",
                    "La imprenta de Gutenberg (siglo XV)"
                ]
            },
            {
                title: "Comunicación Oral: La exposición oral de temas comunitarios",
                icon: "🎙️",
                content: "Una exposición oral es la presentación estructurada de un tema frente a una audiencia, con el fin de informar o generar reflexión. Se estructura en introducción (presenta el tema), desarrollo (ideas principales con datos y ejemplos) y cierre (resume y propone conclusión).",
                keyIdea: "Organiza tus ideas en un guion o fichas, cuida el volumen y ritmo de tu voz, mantén contacto visual con el público y apóyate en recursos visuales.",
                topics: [
                    "Introducción — presenta el tema y capta la atención",
                    "Desarrollo — ideas principales con datos y ejemplos",
                    "Cierre — resumen y conclusión o llamado a la acción",
                    "Uso de guion, fichas y recursos visuales"
                ]
            },
            {
                title: "Lectura: La noticia",
                icon: "📰",
                content: "La noticia es un texto periodístico que informa sobre un hecho reciente y de interés público. Responde a las llamadas 5 preguntas (+1): qué, quién, cuándo, dónde, por qué y cómo. Sigue la estructura de pirámide invertida.",
                keyIdea: "La pirámide invertida ordena la información de lo más a lo menos importante: titular, entradilla (lead) y cuerpo.",
                topics: [
                    "Las 5W+1H: qué, quién, cuándo, dónde, por qué y cómo",
                    "Estructura de pirámide invertida",
                    "Titular — resume el hecho",
                    "Entradilla o lead — responde las preguntas principales",
                    "Cuerpo — detalles de mayor a menor importancia"
                ]
            },
            {
                title: "Escritura: Escribo una noticia",
                icon: "✏️",
                content: "Al redactar una noticia se debe usar un lenguaje claro, objetivo y en tercera persona. Se deben evitar opiniones personales, verificar todos los datos (nombres, cifras, fechas) antes de publicar y citar las fuentes de la información.",
                keyIdea: "La función de la noticia es informar de manera objetiva, no persuadir ni dar una valoración personal.",
                topics: [
                    "Lenguaje claro, objetivo y en tercera persona",
                    "Evitar opiniones personales",
                    "Verificar datos (nombres, cifras, fechas)",
                    "Citar fuentes de información"
                ]
            },
            {
                title: "Literatura: El cuento ecuatoriano",
                icon: "📖",
                content: "El cuento es una narración breve, con pocos personajes y una sola línea argumental (planteamiento, nudo y desenlace). En el Ecuador existe una rica tradición cuentística, con autores como Pablo Palacio, Jorge Icaza o Ángel Felicísimo Rojas, que retratan realidades sociales, rurales o urbanas del país.",
                keyIdea: "El cuento se centra en una sola trama principal, sin subtramas paralelas, lo que lo diferencia de la novela.",
                topics: [
                    "Estructura: planteamiento, nudo y desenlace",
                    "Una sola línea argumental",
                    "Autores ecuatorianos: Pablo Palacio, Jorge Icaza, Ángel F. Rojas",
                    "Proyecto: Cuento clásico ecuatoriano en equipo"
                ]
            }
        ]
    },
    3: {
        title: "Unidad 3 — El lenguaje de la ciencia",
        badge: "Unidad 3",
        emoji: "🔬",
        description: "Conoce los soportes de la escritura a lo largo de la historia, explora los programas radiales, analiza la divulgación científica y sumérgete en la ciencia ficción.",
        project: "En equipo, editen una revista que combine relatos breves de ciencia ficción con artículos de divulgación científica sobre temas reales relacionados.",
        sections: [
            {
                title: "Lengua y Cultura: Soportes de la escritura",
                icon: "📜",
                content: "A lo largo de la historia, la escritura ha usado distintos soportes físicos: piedra y tablillas de arcilla (duraderas pero pesadas), papiro egipcio (ligero pero frágil), pergamino medieval (duradero pero costoso), papel (económico y práctico, revolucionó la difusión junto con la imprenta) y soportes digitales actuales (almacenamiento y difusión instantánea).",
                keyIdea: "Cada cambio de soporte también cambió quién podía acceder a la escritura: de unos pocos escribas especializados a, hoy en día, prácticamente cualquier persona con un dispositivo digital.",
                topics: [
                    "Piedra y tablillas de arcilla — duraderas pero pesadas",
                    "Papiro (Egipto) — ligero pero frágil",
                    "Pergamino (Edad Media) — duradero pero costoso",
                    "Papel (origen chino → árabe → Europa) — económico y práctico",
                    "Soportes digitales — almacenamiento y difusión instantánea"
                ]
            },
            {
                title: "Comunicación Oral: Los programas radiales",
                icon: "📻",
                content: "Un programa radial es un producto de comunicación oral pensado para ser escuchado, sin apoyo visual. Depende de la voz (entonación, ritmo y claridad), los efectos sonoros y la música (ambiente y transiciones), y los silencios (énfasis).",
                keyIdea: "La radio depende enteramente del sonido para comunicar: voz, música, efectos y silencios deben trabajar juntos para mantener la atención del oyente.",
                topics: [
                    "La voz — entonación, ritmo y claridad",
                    "Efectos sonoros y música — ambiente y transiciones",
                    "Los silencios — énfasis",
                    "Géneros: noticiero, radionovela, programa de opinión, magazine, musical"
                ]
            },
            {
                title: "Lectura: Textos de divulgación científica",
                icon: "🔬",
                content: "Son textos que explican descubrimientos o conceptos científicos a un público no especializado, usando un lenguaje más accesible que el de un artículo académico, pero manteniendo el rigor de la información. Explican términos técnicos con ejemplos o comparaciones cotidianas, suelen incluir imágenes y gráficos, y citan la fuente original.",
                keyIdea: "Al usar información de otra fuente, se debe indicar autor, título y año de publicación, para diferenciar ideas propias de ajenas y evitar el plagio.",
                topics: [
                    "Lenguaje accesible con rigor científico",
                    "Explicaciones con ejemplos y comparaciones cotidianas",
                    "Uso de imágenes, gráficos e infografías",
                    "Normas básicas de citación (autor, título, año)"
                ]
            },
            {
                title: "Escritura: El artículo de divulgación científica",
                icon: "✏️",
                content: "Al escribir un artículo de divulgación científica se recomienda: elegir un tema de interés para la audiencia, investigar en fuentes confiables (revistas científicas, sitios institucionales), explicar conceptos clave con lenguaje sencillo sin perder precisión, usar ejemplos, analogías o comparaciones, y citar las fuentes consultadas.",
                keyIdea: "La analogía es un recurso clave: compara un concepto nuevo o complejo con algo conocido y cotidiano para facilitar su comprensión.",
                topics: [
                    "Elegir tema de interés para la audiencia",
                    "Investigar en fuentes confiables",
                    "Lenguaje sencillo sin perder precisión",
                    "Analogías y comparaciones",
                    "Citar fuentes consultadas"
                ]
            },
            {
                title: "Literatura: Relatos de ciencia ficción",
                icon: "🚀",
                content: "La ciencia ficción es un género narrativo que imagina realidades posibles a partir de avances científicos o tecnológicos (reales o hipotéticos), explorando sus consecuencias sociales, éticas o filosóficas. Suele incluir elementos como viajes en el tiempo, inteligencia artificial, exploración espacial o mundos distópicos.",
                keyIdea: "La ciencia ficción no solo entretiene: plantea preguntas profundas sobre el futuro de la humanidad y las consecuencias de la tecnología.",
                topics: [
                    "Realidades posibles desde avances científicos",
                    "Consecuencias sociales, éticas y filosóficas",
                    "Viajes en el tiempo e inteligencia artificial",
                    "Exploración espacial y mundos distópicos",
                    "Proyecto: Revista de ciencia ficción y divulgación"
                ]
            }
        ]
    },
    4: {
        title: "Unidad 4 — Opinar y crear",
        badge: "Unidad 4",
        emoji: "💬",
        description: "Analiza las variaciones lingüísticas, desarrolla recursos para el debate informal, domina el artículo de opinión y explora la poesía.",
        project: "Crear una antología poética con poemas propios o seleccionados en torno a un tema común (naturaleza, identidad o el Ecuador), incluyendo una breve introducción que explique el hilo conductor.",
        sections: [
            {
                title: "Lengua y Cultura: Variaciones lingüísticas",
                icon: "🗣️",
                content: "Una misma lengua no se habla igual en todos los lugares ni en todos los contextos. Las principales variaciones lingüísticas son: geográficas (dialectos) según la región, sociales (sociolectos) según grupo social/edad/nivel educativo, generacionales (jóvenes vs. adultos mayores) y situacionales (registros) según el contexto de comunicación.",
                keyIdea: "Ninguna variación lingüística es «incorrecta»; todas son formas válidas de comunicación adaptadas a un contexto y una comunidad de hablantes.",
                topics: [
                    "Geográficas (dialectos) — Sierra, Costa, Amazonía",
                    "Sociales (sociolectos) — grupo social, edad, nivel educativo",
                    "Generacionales — habla juvenil vs. adulta",
                    "Situacionales (registros) — formal vs. informal"
                ]
            },
            {
                title: "Comunicación Oral: Recursos para el debate informal",
                icon: "🗣️",
                content: "En un debate, además de los argumentos (recursos lingüísticos), influye mucho cómo se dicen (recursos paralingüísticos). Los recursos lingüísticos incluyen vocabulario, argumentos, contraargumentos y ejemplos. Los paralingüísticos abarcan tono de voz, volumen, pausas y ritmo.",
                keyIdea: "En un debate informal, escucha activamente al otro antes de responder, evita elevar el tono como forma de «ganar» y sustenta tus ideas con razones, no solo con opiniones.",
                topics: [
                    "Recursos lingüísticos: vocabulario, argumentos, contraargumentos",
                    "Recursos paralingüísticos: tono, volumen, pausas, ritmo",
                    "Escucha activa antes de responder",
                    "Sustentar ideas con razones, no solo opiniones"
                ]
            },
            {
                title: "Lectura: El artículo de opinión",
                icon: "📝",
                content: "Es un texto en el que el autor expresa y argumenta su punto de vista sobre un tema de actualidad, con el objetivo de persuadir o generar reflexión en el lector. A diferencia de la noticia, aquí sí se permite —y se espera— la opinión personal, siempre respaldada por argumentos.",
                keyIdea: "Los mentefactos son organizadores gráficos que ayudan a estructurar visualmente las ideas de un texto (idea central, argumentos y ejemplos), útiles para planificar antes de escribir.",
                topics: [
                    "Expresión y argumentación del punto de vista",
                    "Diferencia con la noticia: opinión personal permitida",
                    "Persuadir o generar reflexión",
                    "Uso de mentefactos como organizadores gráficos"
                ]
            },
            {
                title: "Escritura: El artículo de opinión",
                icon: "✏️",
                content: "Estructura recomendada para un artículo de opinión: Introducción (presenta el tema y la postura del autor — tesis), Desarrollo (expone argumentos, cada uno con evidencia o ejemplos que lo sustenten) y Conclusión (refuerza la tesis y puede incluir un llamado a la reflexión o a la acción).",
                keyIdea: "Una tesis es la idea principal que un autor defiende y sostiene con argumentos a lo largo del texto argumentativo.",
                topics: [
                    "Introducción — tema y tesis del autor",
                    "Desarrollo — argumentos con evidencia y ejemplos",
                    "Conclusión — refuerzo de tesis y llamado a la acción",
                    "Formulación de una tesis clara y debatible"
                ]
            },
            {
                title: "Literatura: La poesía",
                icon: "🎭",
                content: "La poesía es un género literario que expresa sentimientos, ideas o imágenes a través de recursos como el ritmo, la rima, la métrica y las figuras literarias (metáfora, símil, personificación, entre otras).",
                keyIdea: "Las figuras literarias transforman el lenguaje cotidiano en arte visual y emocional, enriqueciendo el significado de los textos.",
                topics: [
                    "Ritmo, rima y métrica",
                    "Figuras literarias: metáfora, símil, personificación",
                    "Expresión de sentimientos e ideas",
                    "Proyecto: Antología poética con hilo conductor"
                ]
            }
        ]
    }
};

// Exportación global en navegador y compatibilidad con entornos modulares
if (typeof window !== 'undefined') {
    window.MODULES_DATA = MODULES_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MODULES_DATA;
}
