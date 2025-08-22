-- 10 nuevos leads de prueba para enriquecer el entorno de desarrollo

INSERT INTO leads (province_id, municipality_id, work_type_id, ce_letter_current, ce_letter_target, estimated_budget, desired_timeline, is_urgent, project_value, publication_status, max_shared_companies) VALUES

-- 1. Fachada en Barcelona (Alto Valor)
((SELECT id FROM provinces WHERE name = 'Barcelona'), (SELECT id FROM municipalities WHERE name = 'Barcelona' AND province_id = 8 LIMIT 1), 7, 'E', 'B', 95000, 'Lo antes posible', true, 110000, 'DISPONIBLE', 3),

-- 2. Cubierta en Madrid (Medio Valor)
((SELECT id FROM provinces WHERE name = 'Madrid'), (SELECT id FROM municipalities WHERE name = 'Madrid' AND province_id = 28 LIMIT 1), 6, 'D', 'B', 28000, '3-4 meses', false, 32000, 'DISPONIBLE', 4),

-- 3. Rehabilitación energética en Sevilla (Bajo Valor)
((SELECT id FROM provinces WHERE name = 'Sevilla'), (SELECT id FROM municipalities WHERE name = 'Dos Hermanas' AND province_id = 41 LIMIT 1), 1, 'F', 'C', 17500, 'Sin prisa, buscando ofertas', false, 19900, 'DISPONIBLE', 4),

-- 4. Nueva Construcción en Valencia (Muy Alto Valor)
((SELECT id FROM provinces WHERE name = 'Valencia'), (SELECT id FROM municipalities WHERE name = 'Valencia' AND province_id = 46 LIMIT 1), 2, NULL, 'A', 250000, 'Próximo año', false, 310000, 'DISPONIBLE', 2),

-- 5. Estructura Urgente en Madrid
((SELECT id FROM provinces WHERE name = 'Madrid'), (SELECT id FROM municipalities WHERE name = 'Móstoles' AND province_id = 28 LIMIT 1), 8, 'E', 'C', 65000, 'Inmediato, problema estructural', true, 75000, 'DISPONIBLE', 4),

-- 6. Reforma Integral en Hospitalet
((SELECT id FROM provinces WHERE name = 'Barcelona'), (SELECT id FROM municipalities WHERE name = 'Hospitalet de Llobregat' AND province_id = 8 LIMIT 1), 3, 'E', 'B', 48000, '6 meses', false, 55000, 'DISPONIBLE', 4),

-- 7. Instalaciones en Gandia (Bajo valor, urgente)
((SELECT id FROM provinces WHERE name = 'Valencia'), (SELECT id FROM municipalities WHERE name = 'Gandia' AND province_id = 46 LIMIT 1), 5, 'D', 'B', 9000, 'Próximo mes', true, 11500, 'DISPONIBLE', 4),

-- 8. Ampliación en Alcalá de Henares
((SELECT id FROM provinces WHERE name = 'Madrid'), (SELECT id FROM municipalities WHERE name = 'Alcalá de Henares' AND province_id = 28 LIMIT 1), 4, 'C', 'B', 41000, '5 meses', false, 49000, 'DISPONIBLE', 3),

-- 9. Rehabilitación Energética en Badalona
((SELECT id FROM provinces WHERE name = 'Barcelona'), (SELECT id FROM municipalities WHERE name = 'Badalona' AND province_id = 8 LIMIT 1), 1, 'F', 'A', 130000, '8-10 meses', false, 150000, 'DISPONIBLE', 2),

-- 10. Reforma de Local Comercial en Sevilla
((SELECT id FROM provinces WHERE name = 'Sevilla'), (SELECT id FROM municipalities WHERE name = 'Sevilla' AND province_id = 41 LIMIT 1), 3, 'G', 'C', 22000, 'Urgente para apertura', true, 26000, 'DISPONIBLE', 4);
