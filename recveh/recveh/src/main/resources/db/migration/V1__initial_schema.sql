-- ═══════════════════════════════════════════════════════════════
-- SIGD-RECVEH | Migración V1 - Esquema inicial
-- Versión: 1.0 | PostgreSQL 18 + PostGIS 3.6
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────
-- EXTENSIONES
-- ─────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- TIPOS ENUMERADOS
-- ─────────────────────────────────────────

CREATE TYPE rol_usuario AS ENUM (
    'ADMIN', 'OPERADOR', 'ANALISTA', 'CONSULTOR'
);

CREATE TYPE estado_vehiculo AS ENUM (
    'ACTIVO', 'ROBADO', 'HURTADO',
    'RECUPERADO', 'EN_INVESTIGACION'
);

CREATE TYPE tipo_delito AS ENUM (
    'ROBO', 'HURTO', 'RECUPERACION', 'HALLAZGO'
);

CREATE TYPE estado_incidente AS ENUM (
    'ABIERTO', 'EN_INVESTIGACION',
    'CERRADO', 'ARCHIVADO'
);

CREATE TYPE tipo_ubicacion AS ENUM (
    'OCURRENCIA', 'RECUPERACION',
    'ABANDONO', 'INVESTIGACION'
);

-- ─────────────────────────────────────────
-- CATÁLOGOS
-- ─────────────────────────────────────────

CREATE TABLE tipo_vehiculo (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

CREATE TABLE distrito (
    id           UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre       VARCHAR(100) NOT NULL,
    codigo       VARCHAR(20)  UNIQUE,
    provincia    VARCHAR(100),
    departamento VARCHAR(100),
    poligono     geometry(MultiPolygon, 4326)
);

-- ─────────────────────────────────────────
-- USUARIOS Y SEGURIDAD
-- ─────────────────────────────────────────

CREATE TABLE usuario (
    id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email           VARCHAR(150) UNIQUE,
    rol             rol_usuario  NOT NULL DEFAULT 'OPERADOR',
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE refresh_token (
    id         UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID         NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expira_en  TIMESTAMPTZ  NOT NULL,
    revocado   BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- VEHÍCULOS
-- ─────────────────────────────────────────

CREATE TABLE vehiculo (
    id                 UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    placa              VARCHAR(20)     NOT NULL UNIQUE,
    marca              VARCHAR(80)     NOT NULL,
    modelo             VARCHAR(80)     NOT NULL,
    anio               SMALLINT,
    color              VARCHAR(50),
    tipo_vehiculo_id   UUID            REFERENCES tipo_vehiculo(id),
    estado             estado_vehiculo NOT NULL DEFAULT 'ACTIVO',
    num_serie          VARCHAR(50),
    propietario_nombre VARCHAR(150),
    propietario_dni    VARCHAR(20),
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TABLE historial_estado_vehiculo (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehiculo_id     UUID            NOT NULL REFERENCES vehiculo(id),
    estado_anterior estado_vehiculo,
    estado_nuevo    estado_vehiculo NOT NULL,
    usuario_id      UUID            REFERENCES usuario(id),
    motivo          VARCHAR(300),
    fecha_cambio    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- INCIDENTES
-- ─────────────────────────────────────────

CREATE TABLE incidente (
    id                     UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_caso            VARCHAR(30)      NOT NULL UNIQUE,
    tipo_delito            tipo_delito      NOT NULL,
    estado                 estado_incidente NOT NULL DEFAULT 'ABIERTO',
    fecha_hecho            DATE             NOT NULL,
    hora_hecho             TIME,
    descripcion            TEXT,
    num_denuncia_sirdic    VARCHAR(50),
    distrito_id            UUID             REFERENCES distrito(id),
    usuario_responsable_id UUID             REFERENCES usuario(id),
    created_at             TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE TABLE incidente_vehiculo (
    id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id UUID        NOT NULL REFERENCES incidente(id) ON DELETE CASCADE,
    vehiculo_id  UUID        NOT NULL REFERENCES vehiculo(id),
    rol_vehiculo VARCHAR(30) NOT NULL DEFAULT 'PRINCIPAL',
    UNIQUE(incidente_id, vehiculo_id)
);

-- ─────────────────────────────────────────
-- GEOLOCALIZACIÓN
-- ─────────────────────────────────────────

CREATE TABLE ubicacion_hecho (
    id                   UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id         UUID           NOT NULL REFERENCES incidente(id) ON DELETE CASCADE,
    punto                geometry(Point, 4326) NOT NULL,
    direccion_referencia VARCHAR(300),
    tipo_ubicacion       tipo_ubicacion NOT NULL DEFAULT 'OCURRENCIA',
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- DILIGENCIAS
-- ─────────────────────────────────────────

CREATE TABLE diligencia (
    id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    incidente_id   UUID        NOT NULL REFERENCES incidente(id) ON DELETE CASCADE,
    usuario_id     UUID        REFERENCES usuario(id),
    descripcion    TEXT        NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- AUDITORÍA
-- ─────────────────────────────────────────

CREATE TABLE auditoria_log (
    id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id       UUID        REFERENCES usuario(id),
    accion           VARCHAR(50) NOT NULL,
    tabla_afectada   VARCHAR(80) NOT NULL,
    registro_id      UUID,
    datos_anteriores JSONB,
    datos_nuevos     JSONB,
    ip_origen        VARCHAR(45),
    fecha            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ÍNDICES DE RENDIMIENTO
-- ─────────────────────────────────────────

CREATE INDEX idx_vehiculo_placa     ON vehiculo(placa);
CREATE INDEX idx_vehiculo_estado    ON vehiculo(estado);

CREATE INDEX idx_incidente_tipo     ON incidente(tipo_delito);
CREATE INDEX idx_incidente_estado   ON incidente(estado);
CREATE INDEX idx_incidente_fecha    ON incidente(fecha_hecho DESC);
CREATE INDEX idx_incidente_distrito ON incidente(distrito_id);
CREATE INDEX idx_incidente_sirdic   ON incidente(num_denuncia_sirdic);

CREATE INDEX idx_ubicacion_punto    ON ubicacion_hecho USING GIST(punto);
CREATE INDEX idx_distrito_poligono  ON distrito        USING GIST(poligono);

CREATE INDEX idx_audit_usuario      ON auditoria_log(usuario_id);
CREATE INDEX idx_audit_tabla        ON auditoria_log(tabla_afectada, registro_id);

-- ─────────────────────────────────────────
-- DATOS INICIALES
-- ─────────────────────────────────────────

INSERT INTO tipo_vehiculo (nombre, descripcion) VALUES
    ('Automóvil',   'Vehículo de pasajeros de hasta 5 asientos'),
    ('Camioneta',   'Vehículo de carga liviana o doble cabina'),
    ('Motocicleta', 'Vehículo de dos ruedas motorizado'),
    ('Camión',      'Vehículo de carga pesada'),
    ('Bus',         'Vehículo de transporte público masivo'),
    ('Mototaxi',    'Vehículo de tres ruedas para transporte menor'),
    ('Bicicleta',   'Vehículo de dos ruedas no motorizado');

INSERT INTO usuario (
    username, password_hash, nombre_completo, email, rol
) VALUES (
    'admin',
    '$2a$12$/oNfCsQhnXkBcuoZLO7Fe.y.zFdAw2AuEEgrmaCweGyMd.a.yf/YO',
    'Administrador del Sistema',
    'admin@sigd-recveh.pe',
    'ADMIN'
);