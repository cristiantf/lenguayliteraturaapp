/**
 * Lengua y Literatura 9no EGB - Banco de Preguntas y Evaluación
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * 38 preguntas de repaso basadas en el texto escolar "Lengua y Literatura 9"
 * (Ministerio de Educación del Ecuador, EGB Superior).
 * Preguntas de opción múltiple con respuestas y retroalimentación.
 */

const QUIZ_QUESTIONS = [
    // ========================================
    // UNIDAD 1 — La aventura de escribir (10 preguntas)
    // ========================================
    {
        id: 1,
        unit: 1,
        topic: "Lengua y Cultura",
        question: "¿Qué diferencia hay entre un pictograma y un ideograma?",
        options: [
            "Ambos representan sonidos del habla",
            "El pictograma dibuja un objeto concreto; el ideograma representa una idea o concepto abstracto",
            "El ideograma es más antiguo que el pictograma",
            "No hay diferencia, son sinónimos"
        ],
        answer: 1,
        explanation: "El pictograma dibuja directamente el objeto; el ideograma representa una idea o concepto abstracto asociado al dibujo."
    },
    {
        id: 2,
        unit: 1,
        topic: "Lengua y Cultura",
        question: "¿Cuál es el orden cronológico correcto de estos alfabetos?",
        options: [
            "Griego → Fenicio → Latino",
            "Latino → Griego → Fenicio",
            "Fenicio → Griego → Latino",
            "Griego → Latino → Fenicio"
        ],
        answer: 2,
        explanation: "El orden correcto es: Fenicio → Griego → Latino. Cada pueblo adaptó y mejoró el sistema del anterior."
    },
    {
        id: 3,
        unit: 1,
        topic: "Lengua y Cultura",
        question: "¿Por qué el alfabeto fenicio no podía representar todo el lenguaje hablado?",
        options: [
            "Porque usaba ideogramas en vez de letras",
            "Porque solo tenía consonantes, sin vocales",
            "Porque tenía demasiadas letras y era confuso",
            "Porque estaba escrito en tablillas de arcilla"
        ],
        answer: 1,
        explanation: "El alfabeto fenicio solo tenía consonantes; los griegos solucionaron esto agregando signos para las vocales."
    },
    {
        id: 4,
        unit: 1,
        topic: "Comunicación Oral",
        question: "¿Cuáles son los cuatro momentos de una entrevista?",
        options: [
            "Inicio, nudo, desenlace y moraleja",
            "Preparación, diálogo, edición y publicación",
            "Saludo, preguntas, respuestas y despedida",
            "Introducción, desarrollo, cierre y evaluación"
        ],
        answer: 1,
        explanation: "Los cuatro momentos son: preparación, diálogo, edición y publicación."
    },
    {
        id: 5,
        unit: 1,
        topic: "Comunicación Oral",
        question: "¿Cuál de estas preguntas de entrevista es la más adecuada?",
        options: [
            "¿Le gusta su trabajo?",
            "¿Es usted profesor?",
            "¿Cómo cambió su perspectiva después de esta experiencia?",
            "¿Vive en esta ciudad?"
        ],
        answer: 2,
        explanation: "Las mejores preguntas de entrevista usan interrogativos como «qué», «cómo» o «por qué» para obtener respuestas abiertas y ricas."
    },
    {
        id: 6,
        unit: 1,
        topic: "Lectura",
        question: "¿Qué partes suele tener una carta de lector?",
        options: [
            "Titular, lead, cuerpo y cierre",
            "Planteamiento, nudo y desenlace",
            "Saludo, referencia al tema, opinión argumentada y despedida",
            "Introducción, desarrollo y conclusión"
        ],
        answer: 2,
        explanation: "La carta de lector incluye: saludo, referencia al tema o artículo que la motiva, opinión argumentada y despedida."
    },
    {
        id: 7,
        unit: 1,
        topic: "Escritura",
        question: "En el grupo {perro, gato, canario, animal}, ¿cuál es el hiperónimo?",
        options: [
            "Perro",
            "Canario",
            "Animal",
            "Gato"
        ],
        answer: 2,
        explanation: "«Animal» es el hiperónimo porque es la palabra general que engloba a las demás (hipónimos)."
    },
    {
        id: 8,
        unit: 1,
        topic: "Escritura",
        question: "¿Cuál es un ejemplo de conector lógico de conclusión?",
        options: [
            "Sin embargo",
            "Por ejemplo",
            "En conclusión",
            "Además"
        ],
        answer: 2,
        explanation: "«En conclusión», «por lo tanto» y «en definitiva» son conectores de conclusión."
    },
    {
        id: 9,
        unit: 1,
        topic: "Escritura",
        question: "¿Qué recurso de cohesión textual se usa al reemplazar un sustantivo por un pronombre?",
        options: [
            "Conector lógico",
            "Hiperónimo",
            "Sustitución pronominal",
            "Subordinación sustantiva"
        ],
        answer: 2,
        explanation: "La sustitución pronominal consiste en usar pronombres para evitar repetir un sustantivo ya mencionado."
    },
    {
        id: 10,
        unit: 1,
        topic: "Literatura",
        question: "¿Qué es un amorfino y de qué región del Ecuador es característico?",
        options: [
            "Un tipo de novela de la Sierra ecuatoriana",
            "Una composición poético-musical pícara de la costa ecuatoriana",
            "Un himno religioso de la Amazonía",
            "Un ensayo académico de las Galápagos"
        ],
        answer: 1,
        explanation: "El amorfino es una composición poético-musical popular de la costa ecuatoriana, de tono pícaro, cantada en contrapunto."
    },

    // ========================================
    // UNIDAD 2 — Contar lo que pasa (10 preguntas)
    // ========================================
    {
        id: 11,
        unit: 2,
        topic: "Lengua y Cultura",
        question: "¿Dónde se copiaban los manuscritos durante la Edad Media y quiénes lo hacían?",
        options: [
            "En las universidades, por los profesores",
            "En los scriptoria de los monasterios, por los monjes copistas",
            "En los palacios reales, por los escribas del rey",
            "En las bibliotecas públicas, por los ciudadanos"
        ],
        answer: 1,
        explanation: "Los manuscritos se copiaban en los scriptoria de los monasterios, por los monjes copistas."
    },
    {
        id: 12,
        unit: 2,
        topic: "Lengua y Cultura",
        question: "¿Qué material se usaba como soporte de escritura antes del papel en Europa?",
        options: [
            "Papiro exclusivamente",
            "Tablillas de madera",
            "El pergamino (piel de animal)",
            "Tela de algodón"
        ],
        answer: 2,
        explanation: "El pergamino, hecho de piel tratada de animales, era el soporte principal en Europa antes del papel."
    },
    {
        id: 13,
        unit: 2,
        topic: "Lengua y Cultura",
        question: "¿Qué invento marcó el fin de la copia manual de libros?",
        options: [
            "El telégrafo de Morse",
            "La máquina de escribir",
            "La imprenta de Gutenberg",
            "El papiro egipcio"
        ],
        answer: 2,
        explanation: "La imprenta, inventada por Gutenberg en el siglo XV, permitió reproducir textos en serie."
    },
    {
        id: 14,
        unit: 2,
        topic: "Comunicación Oral",
        question: "¿Cuáles son las tres partes de una exposición oral?",
        options: [
            "Preparación, diálogo y publicación",
            "Saludo, cuerpo y despedida",
            "Introducción, desarrollo y cierre",
            "Tesis, argumentos y conclusión"
        ],
        answer: 2,
        explanation: "La exposición oral tiene tres partes: introducción, desarrollo y cierre."
    },
    {
        id: 15,
        unit: 2,
        topic: "Lectura",
        question: "¿Cuáles son las 5 preguntas (+1) que debe responder una noticia?",
        options: [
            "Quién, qué, por qué, para qué, cuánto y dónde",
            "Qué, quién, cuándo, dónde, por qué y cómo",
            "Qué, cuándo, dónde, cuánto, quién y para quién",
            "Cómo, cuándo, por qué, para qué, quién y qué"
        ],
        answer: 1,
        explanation: "La noticia responde: qué, quién, cuándo, dónde, por qué y cómo (5W+1H)."
    },
    {
        id: 16,
        unit: 2,
        topic: "Lectura",
        question: "¿En qué consiste la estructura de «pirámide invertida»?",
        options: [
            "Ordenar de lo menos a lo más importante",
            "Poner la conclusión primero y la introducción al final",
            "Ordenar la información de lo más a lo menos importante: titular, entradilla y cuerpo",
            "Escribir solo titulares sin desarrollo"
        ],
        answer: 2,
        explanation: "La pirámide invertida ordena la información de lo más a lo menos importante: titular, entradilla y cuerpo."
    },
    {
        id: 17,
        unit: 2,
        topic: "Escritura",
        question: "¿Por qué una noticia debe evitar opiniones personales?",
        options: [
            "Porque las opiniones son ilegales en medios de comunicación",
            "Porque su función es informar de manera objetiva, no persuadir",
            "Porque los lectores no les interesan las opiniones",
            "Porque todas las noticias son iguales"
        ],
        answer: 1,
        explanation: "La función de la noticia es informar de manera objetiva, no persuadir ni dar una valoración personal."
    },
    {
        id: 18,
        unit: 2,
        topic: "Lectura",
        question: "¿Qué criterios ayudan a saber si una fuente de Internet es confiable?",
        options: [
            "Que tenga muchos colores y animaciones",
            "Que tenga autoría clara, fecha reciente y pueda contrastarse con otras fuentes",
            "Que sea el primer resultado de búsqueda",
            "Que tenga muchos comentarios positivos"
        ],
        answer: 1,
        explanation: "Una fuente confiable tiene autoría clara/reconocida, fecha de publicación reciente y puede contrastarse con otras fuentes."
    },
    {
        id: 19,
        unit: 2,
        topic: "Literatura",
        question: "¿Cuáles son las tres partes de la estructura de un cuento?",
        options: [
            "Introducción, nudo y moraleja",
            "Tesis, argumentos y conclusión",
            "Planteamiento, nudo y desenlace",
            "Titular, entradilla y cuerpo"
        ],
        answer: 2,
        explanation: "El cuento se estructura en planteamiento, nudo y desenlace."
    },
    {
        id: 20,
        unit: 2,
        topic: "Literatura",
        question: "¿Qué significa que un cuento tenga «una sola línea argumental»?",
        options: [
            "Que solo tiene un párrafo",
            "Que se centra en una sola trama principal, sin subtramas paralelas",
            "Que todos los personajes piensan igual",
            "Que solo puede leerse una vez"
        ],
        answer: 1,
        explanation: "Que se centra en una sola trama principal, sin subtramas paralelas, lo que diferencia al cuento de la novela."
    },

    // ========================================
    // UNIDAD 3 — El lenguaje de la ciencia (9 preguntas)
    // ========================================
    {
        id: 21,
        unit: 3,
        topic: "Lengua y Cultura",
        question: "¿Cuál es el orden correcto de estos soportes de escritura, del más antiguo al más reciente?",
        options: [
            "Papiro → tablilla de arcilla → papel → pergamino",
            "Tablilla de arcilla → papiro → pergamino → papel",
            "Pergamino → papiro → tablilla de arcilla → papel",
            "Papel → pergamino → papiro → tablilla de arcilla"
        ],
        answer: 1,
        explanation: "El orden es: tablilla de arcilla → papiro → pergamino → papel."
    },
    {
        id: 22,
        unit: 3,
        topic: "Lengua y Cultura",
        question: "¿Por qué el papel resultó más práctico que el pergamino?",
        options: [
            "Porque era más duro y resistente",
            "Porque era más económico, ligero y fácil de producir en cantidad",
            "Porque se inventó antes que el pergamino",
            "Porque los monjes preferían usarlo"
        ],
        answer: 1,
        explanation: "El papel era más económico, ligero y fácil de producir en cantidad que el pergamino."
    },
    {
        id: 23,
        unit: 3,
        topic: "Comunicación Oral",
        question: "¿De qué recursos depende un programa radial, al no contar con imagen?",
        options: [
            "De subtítulos y textos en pantalla",
            "De la voz, la música/efectos sonoros y los silencios",
            "De presentaciones de diapositivas",
            "De gestos y expresiones faciales"
        ],
        answer: 1,
        explanation: "Un programa radial depende de la voz, la música/efectos sonoros y el uso de los silencios."
    },
    {
        id: 24,
        unit: 3,
        topic: "Comunicación Oral",
        question: "¿Cuál de estos es un género radial?",
        options: [
            "El ensayo argumentativo",
            "La carta de lector",
            "La radionovela",
            "El cuento policial"
        ],
        answer: 2,
        explanation: "Géneros radiales comunes: noticiero, radionovela, programa de opinión, magazine y programa musical."
    },
    {
        id: 25,
        unit: 3,
        topic: "Lectura",
        question: "¿Qué diferencia a un texto de divulgación científica de un artículo académico especializado?",
        options: [
            "El de divulgación es siempre más largo",
            "El de divulgación usa lenguaje accesible para el público general, manteniendo rigor",
            "El académico es más divertido",
            "No hay diferencia, son lo mismo"
        ],
        answer: 1,
        explanation: "El de divulgación usa un lenguaje más accesible para el público general, manteniendo el rigor, sin la terminología especializada del texto académico."
    },
    {
        id: 26,
        unit: 3,
        topic: "Escritura",
        question: "¿Para qué sirve citar las fuentes en un artículo de divulgación científica?",
        options: [
            "Para hacer el texto más largo",
            "Para diferenciar las ideas propias de las ajenas y evitar el plagio",
            "Para impresionar al lector con muchos nombres",
            "No es necesario citar fuentes"
        ],
        answer: 1,
        explanation: "Citar fuentes sirve para diferenciar las ideas propias de las ajenas y evitar el plagio."
    },
    {
        id: 27,
        unit: 3,
        topic: "Escritura",
        question: "¿Qué es una analogía en un texto de divulgación?",
        options: [
            "Una cita textual de otro autor",
            "Una comparación de un concepto complejo con algo conocido y cotidiano",
            "Un gráfico estadístico",
            "Un resumen del artículo"
        ],
        answer: 1,
        explanation: "La analogía compara un concepto nuevo o complejo con algo conocido y cotidiano, para facilitar su comprensión."
    },
    {
        id: 28,
        unit: 3,
        topic: "Literatura",
        question: "¿Qué elementos suele explorar un relato de ciencia ficción?",
        options: [
            "Hechos históricos reales exclusivamente",
            "Viajes en el tiempo, inteligencia artificial, exploración espacial o mundos distópicos",
            "Recetas de cocina del futuro",
            "Biografías de científicos"
        ],
        answer: 1,
        explanation: "La ciencia ficción explora viajes en el tiempo, inteligencia artificial, exploración espacial, mundos distópicos, entre otros."
    },
    {
        id: 29,
        unit: 3,
        topic: "Escritura",
        question: "¿Qué se debe hacer antes de escribir un artículo de divulgación sobre un tema científico?",
        options: [
            "Copiar un artículo existente y cambiar algunas palabras",
            "Investigar en fuentes confiables y elegir un tema de interés para la audiencia",
            "Escribir directamente sin investigar",
            "Preguntar solo a amigos y familiares"
        ],
        answer: 1,
        explanation: "Antes de escribir, se debe investigar en fuentes confiables y elegir un tema de interés para la audiencia."
    },

    // ========================================
    // UNIDAD 4 — Opinar y crear (9 preguntas)
    // ========================================
    {
        id: 30,
        unit: 4,
        topic: "Lengua y Cultura",
        question: "¿Qué diferencia hay entre un dialecto y un sociolecto?",
        options: [
            "El dialecto es formal y el sociolecto es informal",
            "El dialecto varía según la región geográfica; el sociolecto, según el grupo social o nivel educativo",
            "Son exactamente lo mismo",
            "El sociolecto solo lo usan los jóvenes"
        ],
        answer: 1,
        explanation: "El dialecto varía según la región geográfica; el sociolecto, según el grupo social o nivel educativo del hablante."
    },
    {
        id: 31,
        unit: 4,
        topic: "Lengua y Cultura",
        question: "¿Qué es un «registro» en el contexto de las variaciones lingüísticas?",
        options: [
            "Un documento oficial del gobierno",
            "El nivel de formalidad que un hablante adapta según la situación",
            "Un tipo de dialecto rural",
            "Una forma de escritura antigua"
        ],
        answer: 1,
        explanation: "El registro es el nivel de formalidad del lenguaje que un hablante adapta según la situación comunicativa."
    },
    {
        id: 32,
        unit: 4,
        topic: "Comunicación Oral",
        question: "¿Cuáles son recursos paralingüísticos que influyen en un debate?",
        options: [
            "El vocabulario y los argumentos",
            "Los gráficos y las diapositivas",
            "El tono de voz, el volumen, las pausas y el ritmo",
            "Las fuentes bibliográficas"
        ],
        answer: 2,
        explanation: "Los recursos paralingüísticos son el tono de voz, el volumen, las pausas y el ritmo al hablar."
    },
    {
        id: 33,
        unit: 4,
        topic: "Lectura",
        question: "¿En qué se diferencia un artículo de opinión de una noticia?",
        options: [
            "La noticia es más larga que el artículo de opinión",
            "No hay diferencia, ambos son iguales",
            "La noticia informa objetivamente; el artículo de opinión expresa y argumenta un punto de vista personal",
            "El artículo de opinión no necesita argumentos"
        ],
        answer: 2,
        explanation: "La noticia busca informar de forma objetiva; el artículo de opinión expresa y argumenta el punto de vista personal del autor."
    },
    {
        id: 34,
        unit: 4,
        topic: "Escritura",
        question: "¿Para qué sirve un mentefacto al planificar un artículo de opinión?",
        options: [
            "Para decorar el texto con dibujos",
            "Para contar el número de palabras",
            "Para organizar visualmente la idea central, los argumentos y los ejemplos",
            "Para traducir el texto a otro idioma"
        ],
        answer: 2,
        explanation: "El mentefacto ayuda a organizar visualmente la idea central, los argumentos y los ejemplos antes de redactar."
    },
    {
        id: 35,
        unit: 4,
        topic: "Escritura",
        question: "¿Cuáles son las tres partes de la estructura de un artículo de opinión?",
        options: [
            "Titular, entradilla y cuerpo",
            "Planteamiento, nudo y desenlace",
            "Introducción (tesis), desarrollo (argumentos) y conclusión",
            "Saludo, opinión y despedida"
        ],
        answer: 2,
        explanation: "La estructura es: introducción (tesis), desarrollo (argumentos) y conclusión."
    },
    {
        id: 36,
        unit: 4,
        topic: "Escritura",
        question: "¿Qué es una tesis en un texto argumentativo?",
        options: [
            "Un resumen del texto",
            "La idea principal que el autor defiende y sostiene con argumentos",
            "Una pregunta sin respuesta",
            "Una lista de ejemplos"
        ],
        answer: 1,
        explanation: "La tesis es la idea principal que el autor defiende y argumenta a lo largo del texto."
    },
    {
        id: 37,
        unit: 4,
        topic: "Literatura",
        question: "¿Cuáles son dos figuras literarias comunes en la poesía?",
        options: [
            "La noticia y la entrevista",
            "La metáfora y el símil",
            "El mentefacto y el sociolecto",
            "La pirámide invertida y el lead"
        ],
        answer: 1,
        explanation: "La metáfora, el símil, la personificación e hipérbole son figuras literarias comunes en la poesía."
    },
    {
        id: 38,
        unit: 4,
        topic: "Literatura",
        question: "Al crear una antología poética, ¿qué elemento debe unir los poemas seleccionados?",
        options: [
            "Que todos los poemas sean del mismo autor",
            "Que todos tengan la misma cantidad de versos",
            "Un tema o hilo conductor común",
            "Que todos estén escritos en prosa"
        ],
        answer: 2,
        explanation: "Una antología poética debe tener un tema o hilo conductor común (por ejemplo, la naturaleza, la identidad o el Ecuador)."
    }
];

// Exportación global en navegador y compatibilidad con entornos modulares
if (typeof window !== 'undefined') {
    window.QUIZ_QUESTIONS = QUIZ_QUESTIONS;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUIZ_QUESTIONS;
}
