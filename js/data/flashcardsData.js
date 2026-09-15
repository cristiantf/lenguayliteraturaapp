/**
 * Lengua y Literatura 9no EGB - Fichas de Conceptos Clave (Flashcards)
 * Unidad Educativa Fiscomisional San Lorenzo
 * 
 * 37 fichas de conceptos organizadas por unidad, basadas en el
 * texto escolar "Lengua y Literatura 9" del Ministerio de Educación.
 */

const FLASHCARDS_DATA = [
    // ========================================
    // UNIDAD 1 — La aventura de escribir (13 fichas)
    // ========================================
    {
        term: "Pictograma",
        definition: "Dibujo que representa directamente un objeto concreto (ej. un buey dibujado = un buey).",
        unit: 1,
        icon: "🖼️",
        category: "Escritura"
    },
    {
        term: "Ideograma",
        definition: "Signo que representa una idea o concepto abstracto, no solo un objeto (ej. un círculo con rayos = el sol o la luz).",
        unit: 1,
        icon: "💡",
        category: "Escritura"
    },
    {
        term: "Fonograma",
        definition: "Signo que representa un sonido silábico del habla; permitió reducir la cantidad de signos necesarios para escribir.",
        unit: 1,
        icon: "🔤",
        category: "Escritura"
    },
    {
        term: "Escritura cuneiforme",
        definition: "Sistema de escritura sumerio hecho con un punzón en forma de cuña sobre tablillas de arcilla.",
        unit: 1,
        icon: "📐",
        category: "Escritura"
    },
    {
        term: "Alfabeto fenicio",
        definition: "Primer sistema fonético conocido, formado solo por consonantes; base del alfabeto griego.",
        unit: 1,
        icon: "⛵",
        category: "Escritura"
    },
    {
        term: "Alfabeto griego",
        definition: "Adaptación del fenicio que añadió vocales; permitió representar el habla completa con pocos signos.",
        unit: 1,
        icon: "🏛️",
        category: "Escritura"
    },
    {
        term: "Entrevista",
        definition: "Género periodístico oral o escrito basado en preguntas y respuestas entre un entrevistador y un entrevistado.",
        unit: 1,
        icon: "🎤",
        category: "Comunicación"
    },
    {
        term: "Carta de lector",
        definition: "Texto argumentativo breve enviado por un ciudadano a un medio para opinar sobre un tema de interés público.",
        unit: 1,
        icon: "📰",
        category: "Lectura"
    },
    {
        term: "Oración subordinada sustantiva",
        definition: "Proposición que funciona como sustantivo dentro de otra oración (sujeto, complemento directo, etc.).",
        unit: 1,
        icon: "📝",
        category: "Gramática"
    },
    {
        term: "Hiperónimo / Hipónimo",
        definition: "Hiperónimo = palabra general que engloba a otras. Hipónimo = palabra específica incluida en un hiperónimo. Ej. «flor» es hiperónimo de «rosa», «margarita», «clavel».",
        unit: 1,
        icon: "🔗",
        category: "Gramática"
    },
    {
        term: "Cohesión textual",
        definition: "Conjunto de recursos (pronombres, sinónimos, conectores) que enlazan las ideas de un texto para que se entienda como una unidad.",
        unit: 1,
        icon: "🧩",
        category: "Escritura"
    },
    {
        term: "Conector lógico",
        definition: "Palabra o expresión que une ideas mostrando una relación lógica: énfasis, ilustración, contraste, condición o conclusión.",
        unit: 1,
        icon: "🔀",
        category: "Escritura"
    },
    {
        term: "Amorfino",
        definition: "Composición poético-musical popular de la costa ecuatoriana, de tono pícaro, cantada en contrapunto.",
        unit: 1,
        icon: "🎶",
        category: "Literatura"
    },

    // ========================================
    // UNIDAD 2 — Contar lo que pasa (10 fichas)
    // ========================================
    {
        term: "Scriptorium",
        definition: "Sala de los monasterios medievales donde los monjes copiaban manuscritos a mano.",
        unit: 2,
        icon: "🏰",
        category: "Historia"
    },
    {
        term: "Pergamino",
        definition: "Soporte de escritura hecho de piel de animal, usado en la Edad Media antes del papel.",
        unit: 2,
        icon: "📜",
        category: "Historia"
    },
    {
        term: "Iluminación",
        definition: "Decoración pintada a mano (ilustraciones, letras capitales) en los manuscritos medievales.",
        unit: 2,
        icon: "🎨",
        category: "Historia"
    },
    {
        term: "Imprenta",
        definition: "Invento de Gutenberg (siglo XV) que permitió reproducir textos en serie, terminando con la copia manual.",
        unit: 2,
        icon: "🖨️",
        category: "Historia"
    },
    {
        term: "Exposición oral",
        definition: "Presentación estructurada (introducción, desarrollo, cierre) de un tema ante una audiencia.",
        unit: 2,
        icon: "🎙️",
        category: "Comunicación"
    },
    {
        term: "Noticia",
        definition: "Texto periodístico objetivo que informa sobre un hecho reciente, respondiendo qué, quién, cuándo, dónde, por qué y cómo.",
        unit: 2,
        icon: "📰",
        category: "Lectura"
    },
    {
        term: "Pirámide invertida",
        definition: "Estructura de la noticia que ordena la información de lo más a lo menos importante: titular, entradilla y cuerpo.",
        unit: 2,
        icon: "🔻",
        category: "Lectura"
    },
    {
        term: "Lead o entradilla",
        definition: "Primer párrafo de la noticia, que resume los datos esenciales del hecho.",
        unit: 2,
        icon: "📋",
        category: "Lectura"
    },
    {
        term: "Fuente confiable",
        definition: "Origen de información verificable, con autoría clara, reconocida y actualizada.",
        unit: 2,
        icon: "✅",
        category: "Investigación"
    },
    {
        term: "Cuento",
        definition: "Narración breve con pocos personajes y una sola línea argumental: planteamiento, nudo y desenlace.",
        unit: 2,
        icon: "📖",
        category: "Literatura"
    },

    // ========================================
    // UNIDAD 3 — El lenguaje de la ciencia (6 fichas)
    // ========================================
    {
        term: "Papiro",
        definition: "Soporte de escritura egipcio hecho de una planta del Nilo; ligero pero poco resistente a la humedad.",
        unit: 3,
        icon: "🌿",
        category: "Historia"
    },
    {
        term: "Programa radial",
        definition: "Producto de comunicación oral pensado exclusivamente para el oído, que se apoya en voz, música, efectos sonoros y silencios.",
        unit: 3,
        icon: "📻",
        category: "Comunicación"
    },
    {
        term: "Texto de divulgación científica",
        definition: "Texto que explica conceptos científicos a un público general, con lenguaje accesible pero información rigurosa.",
        unit: 3,
        icon: "🔬",
        category: "Lectura"
    },
    {
        term: "Cita de fuente",
        definition: "Referencia (autor, título, año) que indica de dónde proviene una información usada en un texto, para evitar el plagio.",
        unit: 3,
        icon: "📎",
        category: "Escritura"
    },
    {
        term: "Ciencia ficción",
        definition: "Género narrativo que imagina realidades a partir de avances científicos o tecnológicos y explora sus consecuencias.",
        unit: 3,
        icon: "🚀",
        category: "Literatura"
    },
    {
        term: "Analogía",
        definition: "Recurso explicativo que compara un concepto nuevo o complejo con algo conocido y cotidiano, para facilitar su comprensión.",
        unit: 3,
        icon: "🔄",
        category: "Escritura"
    },

    // ========================================
    // UNIDAD 4 — Opinar y crear (8 fichas)
    // ========================================
    {
        term: "Dialecto",
        definition: "Variación de una lengua según la región geográfica donde se habla.",
        unit: 4,
        icon: "🗺️",
        category: "Lingüística"
    },
    {
        term: "Sociolecto",
        definition: "Variación de una lengua según el grupo social, edad o nivel educativo de los hablantes.",
        unit: 4,
        icon: "👥",
        category: "Lingüística"
    },
    {
        term: "Registro",
        definition: "Nivel de formalidad del lenguaje que un hablante adapta según la situación comunicativa.",
        unit: 4,
        icon: "📊",
        category: "Lingüística"
    },
    {
        term: "Recursos paralingüísticos",
        definition: "Elementos no verbales de la voz (tono, volumen, pausas, ritmo) que acompañan y refuerzan el mensaje hablado.",
        unit: 4,
        icon: "🗣️",
        category: "Comunicación"
    },
    {
        term: "Artículo de opinión",
        definition: "Texto argumentativo en el que el autor defiende su punto de vista sobre un tema de actualidad.",
        unit: 4,
        icon: "📝",
        category: "Lectura"
    },
    {
        term: "Mentefacto",
        definition: "Organizador gráfico que estructura visualmente las ideas de un texto (idea central, argumentos, ejemplos).",
        unit: 4,
        icon: "🧠",
        category: "Escritura"
    },
    {
        term: "Tesis",
        definition: "Idea principal que un autor defiende y argumenta a lo largo de un texto argumentativo.",
        unit: 4,
        icon: "💎",
        category: "Escritura"
    },
    {
        term: "Figura literaria",
        definition: "Recurso expresivo del lenguaje poético (metáfora, símil, personificación, etc.) que enriquece el significado de un texto.",
        unit: 4,
        icon: "🎭",
        category: "Literatura"
    }
];

// Exportación global en navegador y compatibilidad con entornos modulares
if (typeof window !== 'undefined') {
    window.FLASHCARDS_DATA = FLASHCARDS_DATA;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FLASHCARDS_DATA;
}
