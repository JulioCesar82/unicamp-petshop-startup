
const { pool } = require('../database');

const DML_SCRIPT = `
insert into organization_invite (invite_code, expiration_date) values
('super-secret-invite-code', NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

insert into organization (name, social_name, description, identification_code, links) values
('PetCare', 'PetCare Serviços Veterinários Ltda', 'Clínica veterinária especializada em cuidados para pets.', '12345678000199', ARRAY['http://localhost:3000'])
ON CONFLICT DO NOTHING;

insert into organization_apikey (organization_id, api_key) values
((SELECT organization_id FROM organization WHERE name='PetCare' limit 1), 'apikey-1234567890')
ON CONFLICT DO NOTHING;

INSERT INTO tutor (name, email, phone, organization_id) VALUES
('Ana Carolina', 'ana.carolina@email.com', '55 91234-5678', (SELECT organization_id FROM organization WHERE name='PetCare' limit 1)),
('Bruno Martins', 'bruno.martins@email.com', '55 99876-5432', (SELECT organization_id FROM organization WHERE name='PetCare' limit 1))
ON CONFLICT DO NOTHING;

INSERT INTO pet (tutor_id, name, species, animal_type, fur_type, birth_date) VALUES
((SELECT tutor_id FROM tutor WHERE name='Ana Carolina' limit 1), 'Bidu', 'Cão', 'Golden Retriever', 'Longo', NOW()),
((SELECT tutor_id FROM tutor WHERE name='Ana Carolina' limit 1), 'Luna', 'Gato', 'Siamês', 'Curto', NOW() - INTERVAL '1 year'),
((SELECT tutor_id FROM tutor WHERE name='Bruno Martins' limit 1), 'Thor', 'Cão', 'Shih Tzu', 'Longo', NOW() - INTERVAL '4 months')
ON CONFLICT DO NOTHING;

INSERT INTO booking (pet_id, service_type, booking_date, status) VALUES
((SELECT pet_id FROM pet WHERE name='Bidu' limit 1), 'Banho e Tosa Completa', NOW() - INTERVAL '1 month', 'Realizado'),
((SELECT pet_id FROM pet WHERE name='Bidu' limit 1), 'Banho e Tosa Completa', NOW() - INTERVAL '2 month', 'Realizado'),
((SELECT pet_id FROM pet WHERE name='Bidu' limit 1), 'Banho e Tosa Completa', NOW() - INTERVAL '3 month', 'Realizado'),
((SELECT pet_id FROM pet WHERE name='Thor' limit 1), 'Banho', NOW() - INTERVAL '1 year', 'Realizado')
ON CONFLICT DO NOTHING;

INSERT INTO product (product_name, category) VALUES
('Ração para Cães de Pelo Longo', 'Alimentação'),
('Shampoo Hipoalergênico para Cães', 'Higiene')
ON CONFLICT DO NOTHING;

INSERT INTO purchase (tutor_id, product_id, purchase_date, quantity, price) VALUES
((SELECT tutor_id FROM tutor WHERE name='Ana Carolina' limit 1), (SELECT product_id FROM product WHERE product_name='Ração para Cães de Pelo Longo' limit 1), NOW() - INTERVAL '3 month', 1, 75.50),
((SELECT tutor_id FROM tutor WHERE name='Ana Carolina' limit 1), (SELECT product_id FROM product WHERE product_name='Shampoo Hipoalergênico para Cães' limit 1), NOW() - INTERVAL '3 month', 1, 30.00),
((SELECT tutor_id FROM tutor WHERE name='Bruno Martins' limit 1), (SELECT product_id FROM product WHERE product_name='Ração para Cães de Pelo Longo' limit 1), NOW() - INTERVAL '5 month', 1, 50.20)
ON CONFLICT DO NOTHING;

INSERT INTO vaccine_reference (vaccine_name, target_species, mandatory, description, first_dose_age_months, booster_interval_months) VALUES 
-- Aplicação Única 
('Aplicação de Microchip', 'Ambos', FALSE, 'Registro de aplicação de microchip de identificação.', 2, NULL),
 
-- Vacinas Não Essenciais para Ambos 
( 'Complexo Tosse dos Canis (Bordetella, Mucosa)', 'Ambos', FALSE, 'Vacinas vivas (intranasal ou oral) para proteção contra Bordetella bronchiseptica e/ou Parainfluenza.', 2, 12),
( 'Complexo Tosse dos Canis (Bordetella, Parenteral)', 'Ambos', FALSE, 'Vacina inativada (injetável) contra Bordetella bronchiseptica. Requer duas doses iniciais.', 2, 12),
( 'Borreliose de Lyme (Borrelia burgdorferi) canina', 'Ambos', FALSE, 'Recomendada para cães com alto risco de exposição a carrapatos em regiões onde a doença de Lyme é endêmica.', 2, 18),
( 'Gripe canina - Influenza Canina (H3N8 e H3N2)', 'Ambos', FALSE, 'Protege contra Bordetella bronchiseptica e/ou Parainfluenza. Considerar para cães em situações de risco, como canis, creches ou exposições.', 1.8, 12),
( 'Leishmaniose Canina', 'Ambos', FALSE, 'A vacinação é uma medida suplementar e não substitui o controle de flebotomíneos (vetores).', 1.8, 18), 

-- Vacinas Essenciais para Cães 
('V10 Canina (1 Dose) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 4 sorovares de Leptospirose.', 1.45/* -- 45 dias / 31*/, NULL),  -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado. 
('V10 Canina (2 Dose) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 4 sorovares de Leptospirose.', 2.29/* -- (45 dias + 26 dias) = 71 dias / 31 dias*/, NULL), -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado.
('V10 Canina (Dose Regular) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 4 sorovares de Leptospirose.', 3.1/* -- (45 dias + 26 dias + 26 dias) = 97 dias / 31 dias*/, 12), -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado. 
('V8 Canina (1 Dose) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 2 sorovares de Leptospirose.', 1.35/*-- 42 dias / 31 dias*/, NULL), -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado. 
('V8 Canina (2 Dose) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 2 sorovares de Leptospirose.', 1.93/* -- (42 dias + 18 dias) / 31 dias*/, NULL), -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado. 
('V8 Canina (Dose Regular) - Polivalente Canina Essencial', 'Cão', TRUE, 'Protege contra Cinomose, Parvovirose, Hepatite, Adenovírus, Parainfluenza, Coronavirose e 2 sorovares de Leptospirose.', 2.51/* -- (42 dias + 18 dias + 18 dias) / 31 dias*/, 12), -- No WSAVA falase em 36 meses para cães de baixo risco, mas aqui mantemos 12 meses conforme solicitado. 
( 'Raiva Canina - Antirrábica', 'Ambos', TRUE, 'Protege contra o vírus da Raiva. Obrigatória por lei no Brasil.', 3, 12),

-- Vacinas Não Essenciais para Cães 
('Giárdia Canina', 'Cão', FALSE, 'Protege contra Giardia lamblia.', 2, 18), -- Vacinas Essenciais para Gatos 
('V4 Felina (1 Dose) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose e Clamidiose.', 1.77, NULL),
('V4 Felina (2 Dose) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose e Clamidiose.', 2.74/* -- (55 dias + 30 dias) / 31 dias*/, NULL),
('V4 Felina (Dose Regular) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose e Clamidiose.', 3.7/* -- (55 dias + 30 dias + 30 dias) / 31 dias*/, 12),
('V5 Felina (1 Dose) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose, Clamidiose e Leucemia Felina (FeLV).', 2.25, NULL),
('V5 Felina (2 Dose) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose, Clamidiose e Leucemia Felina (FeLV).', 3.61/* -- (70 dias + 21) / 31 dias*/, NULL),
('V5 Felina (Dose Regular) - Polivalente Essencial', 'Gato', TRUE, 'Protege contra Panleucopenia, Rinotraqueíte, Calicivirose, Clamidiose e Leucemia Felina (FeLV).', 1.8/* -- (70 dias + 21 + 21) / 31 dias*/, 12), 

-- Vacinas Não Essenciais para Gatos 
('Bordetella Bronchiseptica Felina (Intranasal)', 'Gato', FALSE, 'Não utilizada rotineiramente. Considerar para gatos em colônias muito grandes.', 1, 12)
ON CONFLICT DO NOTHING;

-- TODO: insert na tabela vaccine_equivalence
INSERT INTO vaccine_equivalence (vaccine_id, equivalent_vaccine_id) VALUES 
  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V10 Canina (1 Dose) - Polivalente Canina Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V8 Canina (1 Dose) - Polivalente Canina Essencial' limit 1)),

  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V10 Canina (2 Dose) - Polivalente Canina Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V8 Canina (2 Dose) - Polivalente Canina Essencial' limit 1)),

  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V10 Canina (Dose Regular) - Polivalente Canina Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V8 Canina (Dose Regular) - Polivalente Canina Essencial' limit 1)),

  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V4 Felina (1 Dose) - Polivalente Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V5 Felina (1 Dose) - Polivalente Essencial' limit 1)),

  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V4 Felina (2 Dose) - Polivalente Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V5 Felina (2 Dose) - Polivalente Essencial' limit 1)),

  ((SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V4 Felina (Dose Regular) - Polivalente Essencial' limit 1), 
  (SELECT vaccine_reference_id FROM vaccine_reference WHERE vaccine_name = 'V5 Felina (Dose Regular) - Polivalente Essencial' limit 1))

ON CONFLICT DO NOTHING;
`;

const insertDMLAsync = async () => {
  try {
    await pool.query(DML_SCRIPT);
    console.log('DML inserted successfully');
  } catch (error) {
    console.error('Error inserting DML:', error);
  }
};

module.exports = insertDMLAsync;
