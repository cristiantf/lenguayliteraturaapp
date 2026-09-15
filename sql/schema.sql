-- ===========================================================================
-- Lengua y Literatura 9no EGB - Sistema de Gestión Educativa
-- Unidad Educativa Fiscomisional San Lorenzo
-- Base de Datos: lengua_literatura_9no
-- ===========================================================================

CREATE DATABASE IF NOT EXISTS lengua_literatura_9no
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE lengua_literatura_9no;

-- ===========================================================================
-- 1. TABLA DE USUARIOS
-- ===========================================================================
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100)    NOT NULL,
    apellido        VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    rol             ENUM('admin', 'docente', 'estudiante') NOT NULL DEFAULT 'estudiante',
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    avatar_url      VARCHAR(500)    NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rol (rol),
    INDEX idx_activo (activo)
) ENGINE=InnoDB;

-- ===========================================================================
-- 2. TABLA DE ACTIVIDADES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS activities (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    docente_id      INT             NOT NULL,
    titulo          VARCHAR(255)    NOT NULL,
    descripcion     TEXT            NULL,
    tipo            ENUM('archivo', 'quiz', 'mixta') NOT NULL DEFAULT 'archivo',
    fecha_inicio    DATETIME        NOT NULL,
    fecha_limite    DATETIME        NOT NULL,
    nota_maxima     DECIMAL(5,2)    NOT NULL DEFAULT 10.00,
    activa          BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_docente FOREIGN KEY (docente_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_docente (docente_id),
    INDEX idx_activa (activa),
    INDEX idx_fecha_limite (fecha_limite)
) ENGINE=InnoDB;

-- ===========================================================================
-- 3. TABLA DE PLANTILLAS QUIZ (preguntas de actividad tipo quiz)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS quiz_templates (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    activity_id     INT             NOT NULL UNIQUE,
    preguntas       JSON            NOT NULL COMMENT 'Array de {question, options[], answer, explanation}',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ===========================================================================
-- 4. TABLA DE ARCHIVOS DE ACTIVIDAD (recursos del docente)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS activity_files (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    activity_id     INT             NOT NULL,
    nombre_archivo  VARCHAR(255)    NOT NULL,
    ruta_archivo    VARCHAR(500)    NOT NULL,
    tipo_mime       VARCHAR(100)    NULL,
    tamano_bytes    BIGINT          NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_actfiles_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    INDEX idx_activity (activity_id)
) ENGINE=InnoDB;

-- ===========================================================================
-- 5. TABLA DE ENTREGAS (submissions)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS submissions (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    activity_id     INT             NOT NULL,
    estudiante_id   INT             NOT NULL,
    respuesta_texto TEXT            NULL,
    archivo_url     VARCHAR(500)    NULL,
    quiz_respuestas JSON            NULL COMMENT 'Respuestas del quiz {questionId: selectedOption}',
    quiz_score      DECIMAL(5,2)    NULL COMMENT 'Nota automática del quiz',
    fecha_entrega   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado          ENUM('pendiente', 'entregada', 'calificada') NOT NULL DEFAULT 'entregada',
    CONSTRAINT fk_submissions_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_submissions_student FOREIGN KEY (estudiante_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_student_activity (activity_id, estudiante_id),
    INDEX idx_estado (estado),
    INDEX idx_estudiante (estudiante_id)
) ENGINE=InnoDB;

-- ===========================================================================
-- 6. TABLA DE CALIFICACIONES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS grades (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    submission_id       INT             NOT NULL UNIQUE,
    docente_id          INT             NOT NULL,
    nota                DECIMAL(5,2)    NOT NULL,
    retroalimentacion   TEXT            NULL,
    fecha_calificacion  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_grades_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_docente FOREIGN KEY (docente_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_docente (docente_id)
) ENGINE=InnoDB;

-- ===========================================================================
-- 7. TABLA DE NOTIFICACIONES
-- ===========================================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NOT NULL,
    tipo            VARCHAR(50)     NOT NULL COMMENT 'nueva_actividad|entrega_pendiente|actividad_calificada',
    titulo          VARCHAR(255)    NOT NULL,
    mensaje         TEXT            NOT NULL,
    enlace          VARCHAR(500)    NULL,
    leida           BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_usuario (usuario_id),
    INDEX idx_leida (leida),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ===========================================================================
-- 8. TABLA DE SESIONES (control opcional)
-- ===========================================================================
CREATE TABLE IF NOT EXISTS sessions (
    id              VARCHAR(128)    PRIMARY KEY,
    usuario_id      INT             NULL,
    ip_address      VARCHAR(45)     NULL,
    user_agent      VARCHAR(500)    NULL,
    payload         TEXT            NOT NULL,
    last_activity   INT             NOT NULL,
    CONSTRAINT fk_sessions_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB;

-- ===========================================================================
-- 9. TABLA DE AUDITORÍA
-- ===========================================================================
CREATE TABLE IF NOT EXISTS audit_log (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NULL,
    accion          VARCHAR(100)    NOT NULL COMMENT 'login|create_user|create_activity|submit|grade|etc.',
    tabla_afectada  VARCHAR(100)    NULL,
    registro_id     INT             NULL,
    datos_antes     JSON            NULL,
    datos_despues   JSON            NULL,
    ip_address      VARCHAR(45)     NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_accion (accion),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;
