
const { pool } = require('../database');

const DDL_SCRIPT = `
-- =========== CRIAÇÃO DA FUNÇÃO DE TRIGGER ===========
-- (Deve ser executada antes dos CREATE TABLEs que a utilizam)

CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.dlastupdate = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =========== CRIAÇÃO DE TIPOS ENUMERADOS (ENUMs) ===========
-- Melhora a integridade dos dados para colunas com valores restritos.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_booking_status') THEN
        CREATE TYPE enum_booking_status AS ENUM ('Agendado', 'Realizado', 'Cancelado', 'Pendente');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_pet_species') THEN
        CREATE TYPE enum_pet_species AS ENUM ('Cão', 'Gato');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_vaccine_target_species') THEN
        CREATE TYPE enum_vaccine_target_species AS ENUM ('Cão', 'Gato', 'Ambos');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_execution_history_status') THEN
        CREATE TYPE enum_execution_history_status AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');
    END IF;
END$$;


-- =========== TABELAS PRINCIPAIS ===========

CREATE TABLE IF NOT EXISTS organization_invite (
    organization_invite_id SERIAL PRIMARY KEY,
    invite_code VARCHAR(500) UNIQUE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_organization_invite_dlastupdate ON organization_invite;
CREATE TRIGGER update_organization_invite_dlastupdate BEFORE UPDATE ON organization_invite FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS organization (
    organization_id SERIAL PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    social_name VARCHAR(80) NOT NULL,
    description VARCHAR(255) NOT NULL,
    identification_code VARCHAR(20) UNIQUE,
    links TEXT[],
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_organization_dlastupdate ON organization;
CREATE TRIGGER update_organization_dlastupdate BEFORE UPDATE ON organization FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();


CREATE TABLE IF NOT EXISTS organization_apikey (
    organization_id INTEGER NOT NULL REFERENCES organization(organization_id),
    api_key VARCHAR(500) NOT NULL,
    PRIMARY KEY (organization_id, api_key),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_organization_apikey_dlastupdate ON organization_apikey;
CREATE TRIGGER update_organization_apikey_dlastupdate BEFORE UPDATE ON organization_apikey FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS tutor (
    tutor_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,

    organization_id INTEGER REFERENCES organization(organization_id),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_tutor_dlastupdate ON tutor;
CREATE TRIGGER update_tutor_dlastupdate BEFORE UPDATE ON tutor FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS pet (
    pet_id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES tutor(tutor_id),
    name VARCHAR(100) NOT NULL,
    image_path TEXT,
    birth_date DATE,
    ignore_recommendation BOOLEAN DEFAULT FALSE,

    -- classification columns
    species enum_pet_species NOT NULL,
    animal_type VARCHAR(50),
    fur_type VARCHAR(50),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_pet_dlastupdate ON pet;
CREATE TRIGGER update_pet_dlastupdate BEFORE UPDATE ON pet FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();


-- =========== TABELAS DE PRODUTOS E COMPRAS ===========

CREATE TABLE IF NOT EXISTS product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),

    organization_id INTEGER REFERENCES organization(organization_id),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_product_dlastupdate ON product;
CREATE TRIGGER update_product_dlastupdate BEFORE UPDATE ON product FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS purchase (
    purchase_id SERIAL PRIMARY KEY,
    tutor_id INTEGER NOT NULL REFERENCES tutor(tutor_id),
    product_id INTEGER NOT NULL REFERENCES product(product_id),

    purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_purchase_dlastupdate ON purchase;
CREATE TRIGGER update_purchase_dlastupdate BEFORE UPDATE ON purchase FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();


-- =========== TABELAS DE VACINAÇÃO ===========

CREATE TABLE IF NOT EXISTS vaccine_reference (
    vaccine_reference_id SERIAL PRIMARY KEY,
    vaccine_name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    target_species enum_vaccine_target_species NOT NULL,

    mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    first_dose_age_months NUMERIC(5, 2) NOT NULL,
    booster_interval_months NUMERIC(5, 2),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_vaccine_reference_dlastupdate ON vaccine_reference;
CREATE TRIGGER update_vaccine_reference_dlastupdate BEFORE UPDATE ON vaccine_reference FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

-- Tabela de associação N:N para vacinas equivalentes
CREATE TABLE IF NOT EXISTS vaccine_equivalence (
    vaccine_id INTEGER NOT NULL REFERENCES vaccine_reference(vaccine_reference_id) ON DELETE CASCADE,
    equivalent_vaccine_id INTEGER NOT NULL REFERENCES vaccine_reference(vaccine_reference_id) ON DELETE CASCADE,
    PRIMARY KEY (vaccine_id, equivalent_vaccine_id),

    -- Garante que a relação não seja duplicada (ex: A->B e B->A)
    CHECK (vaccine_id < equivalent_vaccine_id),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_vaccine_equivalence_dlastupdate ON vaccine_equivalence;
CREATE TRIGGER update_vaccine_equivalence_dlastupdate BEFORE UPDATE ON vaccine_equivalence FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS vaccination_record (
    vaccination_record_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet(pet_id),
    vaccine_reference_id INTEGER NOT NULL REFERENCES vaccine_reference(vaccine_reference_id),

    application_date DATE NOT NULL,
    vaccine_batch VARCHAR(100),
    responsible_vet VARCHAR(255),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_vaccination_record_dlastupdate ON vaccination_record;
CREATE TRIGGER update_vaccination_record_dlastupdate BEFORE UPDATE ON vaccination_record FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS vaccine_recommendation (
    vaccine_recommendation_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet(pet_id),

    --vaccine_reference_id INTEGER NOT NULL REFERENCES vaccine_reference(vaccine_reference_id),
    vaccine_name VARCHAR(255),
    description TEXT,
    mandatory BOOLEAN,

    suggested_date DATE NOT NULL,
    ignore_recommendation BOOLEAN DEFAULT FALSE,

    -- Garante uma recomendação única por pet/vacina/data
    --UNIQUE (pet_id, vaccine_reference_id, suggested_date)
    UNIQUE (pet_id, suggested_date),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_vaccine_recommendation_dlastupdate ON vaccine_recommendation;
CREATE TRIGGER update_vaccine_recommendation_dlastupdate BEFORE UPDATE ON vaccine_recommendation FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();


-- =========== TABELAS DE AGENDAMENTO (BOOKING) ===========

CREATE TABLE IF NOT EXISTS booking (
    booking_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet(pet_id),

    -- NOTA: Idealmente, 'service_type' seria uma FK para uma tabela 'service_catalog'
    service_type VARCHAR(100) NOT NULL, 

    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status enum_booking_status NOT NULL,
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_booking_dlastupdate ON booking;
CREATE TRIGGER update_booking_dlastupdate BEFORE UPDATE ON booking FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS booking_reference (
    booking_reference_id SERIAL PRIMARY KEY,
    frequency_days INTEGER NOT NULL,

    -- classification columns
    species enum_pet_species NOT NULL,
    animal_type VARCHAR(50),
    fur_type VARCHAR(50),

    -- Garante a regra de negócio da PK original (que tinha colunas nulas)
    UNIQUE (species, animal_type, fur_type),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_booking_reference_dlastupdate ON booking_reference;
CREATE TRIGGER update_booking_reference_dlastupdate BEFORE UPDATE ON booking_reference FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS booking_recommendation (
    booking_recommendation_id SERIAL PRIMARY KEY,
    pet_id INTEGER NOT NULL REFERENCES pet(pet_id),

    --service_type VARCHAR(100) NOT NULL, 

    suggested_date DATE NOT NULL,
    average_frequency_days INTEGER,
    ignore_recommendation BOOLEAN DEFAULT FALSE,

    -- Corrigida PK: permite uma recomendação ativa por pet/serviço
    --UNIQUE (pet_id, service_type)
    UNIQUE (pet_id),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_booking_recommendation_dlastupdate ON booking_recommendation;
CREATE TRIGGER update_booking_recommendation_dlastupdate BEFORE UPDATE ON booking_recommendation FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();


-- =========== TABELAS DE RELATÓRIO E EXECUÇÃO ===========

CREATE TABLE IF NOT EXISTS ltv_by_pet_profile (
    ltv_by_pet_profile_id SERIAL PRIMARY KEY,

    -- classification columns
    species enum_pet_species NOT NULL,
    animal_type VARCHAR(50),
    fur_type VARCHAR(50),

    total_value NUMERIC(10, 2) NOT NULL DEFAULT 0,

    -- Chave de negócio para identificar o perfil
    UNIQUE (species, animal_type, fur_type),
    
    -- Colunas de Auditoria
    dcreated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    dlastupdate TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    nenabled BOOLEAN NOT NULL DEFAULT TRUE
);
DROP TRIGGER IF EXISTS update_ltv_by_pet_profile_dlastupdate ON ltv_by_pet_profile;
CREATE TRIGGER update_ltv_by_pet_profile_dlastupdate BEFORE UPDATE ON ltv_by_pet_profile FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();

CREATE TABLE IF NOT EXISTS execution_history (
    execution_id SERIAL PRIMARY KEY,
    target_table VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    status enum_execution_history_status NOT NULL,
    error_message TEXT,
    records_processed INTEGER
    
    -- Colunas de Auditoria (dcreated/dlastupdate/nenabled) omitidas, pois start_time/end_time já servem para rastrear.
);


-- =========== CRIAÇÃO DE ÍNDICES (CRUCIAL PARA PERFORMANCE) ===========
-- Índices em Chaves Estrangeiras (FKs) e colunas de filtro (WHERE).

CREATE INDEX IF NOT EXISTS idx_tutor_organization_id ON tutor(organization_id);

CREATE INDEX IF NOT EXISTS idx_pet_tutor_id ON pet(tutor_id);

CREATE INDEX IF NOT EXISTS idx_purchase_tutor_id ON purchase(tutor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_product_id ON purchase(product_id);

CREATE INDEX IF NOT EXISTS idx_vaccination_record_pet_id ON vaccination_record(pet_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_record_vaccine_ref_id ON vaccination_record(vaccine_reference_id);

CREATE INDEX IF NOT EXISTS idx_vaccine_recommendation_pet_id ON vaccine_recommendation(pet_id);
-- CREATE INDEX IF NOT EXISTS idx_vaccine_recommendation_vaccine_ref_id ON vaccine_recommendation(vaccine_reference_id); -- Comentado pois vaccine_reference_id não está mais na tabela

CREATE INDEX IF NOT EXISTS idx_booking_pet_id ON booking(pet_id);
CREATE INDEX IF NOT EXISTS idx_booking_booking_date ON booking(booking_date); -- Importante para filtros de data

CREATE INDEX IF NOT EXISTS idx_booking_recommendation_pet_id ON booking_recommendation(pet_id);

-- Índice na coluna de exclusão lógica para consultas rápidas de registros ativos
CREATE INDEX IF NOT EXISTS idx_tutor_enabled ON tutor(nenabled);
CREATE INDEX IF NOT EXISTS idx_pet_enabled ON pet(nenabled);
-- ... Adicione este índice em todas as tabelas onde a exclusão lógica será usada frequentemente em cláusulas WHERE.
`;

const createDDLAsync = async () => {
  try {
    await pool.query(DDL_SCRIPT);
    console.log('DDL created successfully');
  } catch (error) {
    console.error('Error creating DDL:', error);
  }
};

module.exports = createDDLAsync;
