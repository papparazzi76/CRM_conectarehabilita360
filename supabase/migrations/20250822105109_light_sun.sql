/*
# Migración completa del CRM - Datos de prueba y funciones

1. Datos de prueba
   - Usuarios demo (admin y empresas)
   - 20+ leads de ejemplo
   - Configuración de precios

2. Funciones auxiliares
   - Gestión de estadísticas
   - Reportes automatizados

3. Triggers y validaciones adicionales
*/

-- Insertar municipios de ejemplo para las principales provincias
INSERT INTO municipalities (province_id, name) VALUES
  -- Madrid
  (28, 'Madrid'),
  (28, 'Alcalá de Henares'),
  (28, 'Móstoles'),
  (28, 'Fuenlabrada'),
  (28, 'Leganés'),
  
  -- Barcelona
  (8, 'Barcelona'),
  (8, 'Hospitalet de Llobregat'),
  (8, 'Terrassa'),
  (8, 'Badalona'),
  (8, 'Sabadell'),
  
  -- Valencia
  (46, 'Valencia'),
  (46, 'Gandia'),
  (46, 'Torrent'),
  (46, 'Sagunto'),
  (46, 'Alzira'),
  
  -- Sevilla
  (41, 'Sevilla'),
  (41, 'Dos Hermanas'),
  (41, 'Alcalá de Guadaíra'),
  (41, 'Utrera'),
  (41, 'Mairena del Aljarafe')
ON CONFLICT DO NOTHING;

-- Usuarios de prueba (las contraseñas se establecerán desde la aplicación)
-- admin@demo.com / 123456
-- empresa1@demo.com / 123456  
-- empresa2@demo.com / 123456
-- empresa3@demo.com / 123456

-- Leads de ejemplo (20+ leads con diferentes características)
INSERT INTO leads (id, province_id, municipality_id, work_type_id, ce_letter_current, ce_letter_target, estimated_budget, desired_timeline, is_urgent, project_value, publication_status, max_shared_companies) VALUES

-- Leads urgentes de alto valor
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Madrid' LIMIT 1), 1, 'F', 'B', 85000, 'En 3 meses máximo', true, 95000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Barcelona' LIMIT 1), 1, 'E', 'A', 120000, 'Urgente - 2 meses', true, 145000, 'DISPONIBLE', 3),

-- Rehabilitación energética estándar
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Alcalá de Henares' LIMIT 1), 1, 'D', 'B', 45000, '4-6 meses', false, 52000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Valencia' LIMIT 1), 1, 'C', 'A', 75000, '6 meses', false, 89000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 41, (SELECT id FROM municipalities WHERE name = 'Sevilla' LIMIT 1), 1, 'E', 'C', 35000, 'Flexible', false, 42000, 'DISPONIBLE', 4),

-- Nueva construcción
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Móstoles' LIMIT 1), 2, NULL, 'A', 180000, '12 meses', false, 220000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Terrassa' LIMIT 1), 2, NULL, 'B', 95000, '8 meses', false, 115000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Gandia' LIMIT 1), 2, NULL, 'A', 145000, '10 meses', false, 175000, 'DISPONIBLE', 2),

-- Reforma integral
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Fuenlabrada' LIMIT 1), 3, 'D', 'B', 25000, '3 meses', false, 28500, 'DISPONIBLE', 4),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Badalona' LIMIT 1), 3, 'C', 'A', 32000, '4 meses', false, 38000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Torrent' LIMIT 1), 3, 'F', 'D', 18000, '2 meses', true, 22000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 41, (SELECT id FROM municipalities WHERE name = 'Dos Hermanas' LIMIT 1), 3, 'E', 'B', 45000, '5 meses', false, 52000, 'DISPONIBLE', 3),

-- Ampliaciones
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Leganés' LIMIT 1), 4, 'C', 'B', 35000, '4 meses', false, 42000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Sabadell' LIMIT 1), 4, 'D', 'A', 55000, '6 meses', false, 68000, 'DISPONIBLE', 4),

-- Instalaciones
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Sagunto' LIMIT 1), 5, 'E', 'B', 15000, '1 mes', true, 18500, 'DISPONIBLE', 4),
(uuid_generate_v4(), 41, (SELECT id FROM municipalities WHERE name = 'Utrera' LIMIT 1), 5, 'D', 'A', 25000, '2 meses', false, 29000, 'DISPONIBLE', 4),

-- Cubierta y tejados
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Madrid' LIMIT 1), 6, 'F', 'C', 12000, '3 semanas', true, 15000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Barcelona' LIMIT 1), 6, 'E', 'B', 22000, '1 mes', false, 26500, 'DISPONIBLE', 4),

-- Fachadas
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Valencia' LIMIT 1), 7, 'F', 'D', 65000, '5 meses', false, 78000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 41, (SELECT id FROM municipalities WHERE name = 'Sevilla' LIMIT 1), 7, 'E', 'C', 48000, '4 meses', false, 58000, 'DISPONIBLE', 4),

-- Estructura
(uuid_generate_v4(), 28, (SELECT id FROM municipalities WHERE name = 'Madrid' LIMIT 1), 8, 'D', 'B', 85000, '8 meses', false, 102000, 'DISPONIBLE', 3),
(uuid_generate_v4(), 8, (SELECT id FROM municipalities WHERE name = 'Barcelona' LIMIT 1), 8, 'C', 'A', 125000, '10 meses', false, 155000, 'DISPONIBLE', 2),

-- Proyectos de bajo presupuesto
(uuid_generate_v4(), 46, (SELECT id FROM municipalities WHERE name = 'Alzira' LIMIT 1), 1, 'D', 'C', 8500, '6 semanas', false, 12000, 'DISPONIBLE', 4),
(uuid_generate_v4(), 41, (SELECT id FROM municipalities WHERE name = 'Mairena del Aljarafe' LIMIT 1), 3, 'C', 'B', 16000, '2 meses', false, 19500, 'DISPONIBLE', 4);

-- Función para obtener estadísticas de dashboard por usuario
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  credit_balance INTEGER,
  credits_consumed INTEGER,
  leads_requested INTEGER,
  leads_contacted INTEGER,
  leads_quoted INTEGER,
  leads_won INTEGER,
  total_revenue NUMERIC,
  avg_ticket NUMERIC,
  conversion_rate NUMERIC,
  roi_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date TIMESTAMPTZ;
  v_end_date TIMESTAMPTZ;
  v_balance INTEGER;
  v_consumed INTEGER;
  v_requested INTEGER;
  v_contacted INTEGER;
  v_quoted INTEGER;
  v_won INTEGER;
  v_revenue NUMERIC;
  v_avg_ticket NUMERIC;
  v_conversion NUMERIC;
  v_roi NUMERIC;
  v_credit_cost NUMERIC := 5.0; -- 5€ por crédito (configurable)
BEGIN
  -- Establecer fechas por defecto si no se proporcionan
  v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  v_end_date := COALESCE(p_end_date, NOW());

  -- Obtener balance actual
  SELECT COALESCE(balance, 0) INTO v_balance
  FROM credit_wallets
  WHERE user_id = p_user_id;

  -- Créditos consumidos en el periodo
  SELECT COALESCE(SUM(ABS(amount)), 0) INTO v_consumed
  FROM credit_transactions
  WHERE user_id = p_user_id
    AND type = 'CONSUMO'
    AND created_at BETWEEN v_start_date AND v_end_date;

  -- Estadísticas de leads
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE commercial_status IN ('CONTACTADO', 'PRESUPUESTADO', 'CONTRATADO')),
    COUNT(*) FILTER (WHERE commercial_status IN ('PRESUPUESTADO', 'CONTRATADO')),
    COUNT(*) FILTER (WHERE commercial_status = 'CONTRATADO'),
    COALESCE(SUM(budget_amount) FILTER (WHERE commercial_status = 'CONTRATADO'), 0)
  INTO v_requested, v_contacted, v_quoted, v_won, v_revenue
  FROM lead_shares
  WHERE user_id = p_user_id
    AND created_at BETWEEN v_start_date AND v_end_date;

  -- Calcular métricas derivadas
  v_avg_ticket := CASE WHEN v_won > 0 THEN v_revenue / v_won ELSE 0 END;
  v_conversion := CASE WHEN v_requested > 0 THEN (v_won::NUMERIC / v_requested) * 100 ELSE 0 END;
  
  -- ROI: (Ingresos - Coste) / Coste * 100
  DECLARE
    v_total_cost NUMERIC := v_consumed * v_credit_cost;
  BEGIN
    v_roi := CASE WHEN v_total_cost > 0 THEN ((v_revenue - v_total_cost) / v_total_cost) * 100 ELSE 0 END;
  END;

  -- Retornar resultados
  RETURN QUERY SELECT 
    v_balance,
    v_consumed,
    v_requested,
    v_contacted, 
    v_quoted,
    v_won,
    v_revenue,
    v_avg_ticket,
    v_conversion,
    v_roi;
END;
$$;

-- Función para obtener datos de gráfica ROI
CREATE OR REPLACE FUNCTION get_roi_chart_data(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE(
  date_point DATE,
  roi_value NUMERIC,
  cpl_value NUMERIC,
  leads_count INTEGER,
  revenue_amount NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE := CURRENT_DATE - p_days;
  v_credit_cost NUMERIC := 5.0;
BEGIN
  RETURN QUERY
  WITH daily_data AS (
    SELECT 
      DATE(ls.created_at) as date_point,
      COUNT(*) as leads_count,
      COALESCE(SUM(ls.budget_amount) FILTER (WHERE ls.commercial_status = 'CONTRATADO'), 0) as revenue,
      COALESCE(SUM(ct.amount * -1), 0) as credits_used
    FROM lead_shares ls
    LEFT JOIN credit_transactions ct ON ct.lead_id = ls.lead_id AND ct.user_id = p_user_id AND ct.type = 'CONSUMO'
    WHERE ls.user_id = p_user_id
      AND DATE(ls.created_at) >= v_start_date
    GROUP BY DATE(ls.created_at)
  ),
  daily_metrics AS (
    SELECT 
      date_point,
      leads_count,
      revenue,
      credits_used,
      CASE WHEN leads_count > 0 THEN credits_used::NUMERIC / leads_count ELSE 0 END as cpl,
      CASE WHEN credits_used > 0 THEN ((revenue - (credits_used * v_credit_cost)) / (credits_used * v_credit_cost)) * 100 ELSE 0 END as roi
    FROM daily_data
  )
  SELECT 
    dm.date_point,
    dm.roi,
    dm.cpl,
    dm.leads_count,
    dm.revenue
  FROM daily_metrics dm
  ORDER BY dm.date_point;
END;
$$;

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas relevantes
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
      AND table_schema = 'public'
      AND table_name IN ('users', 'credit_wallets', 'leads', 'lead_shares')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON %s', t, t);
    EXECUTE format('CREATE TRIGGER update_%s_updated_at 
                    BEFORE UPDATE ON %s 
                    FOR EACH ROW 
                    EXECUTE FUNCTION update_updated_at_column()', t, t);
  END LOOP;
END;
$$;

-- Configuración de precios (crédito = 5€)
INSERT INTO pricing_tiers (min_value, max_value, base_credits) VALUES
  (0, 19999.99, 1),
  (20000, 29999.99, 2),
  (30000, 49999.99, 3),
  (50000, 99999.99, 4),
  (100000, NULL, 5)
ON CONFLICT DO NOTHING;

-- Configuración global del sistema
CREATE TABLE IF NOT EXISTS system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage config"
  ON system_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Configuración inicial del sistema
INSERT INTO system_config (key, value, description) VALUES
  ('credit_price_euros', '5.0', 'Precio en euros de un crédito'),
  ('max_lead_shares', '4', 'Número máximo de empresas que pueden compartir un lead'),
  ('urgent_lead_priority_hours', '48', 'Horas para considerar un lead urgente sin contactar'),
  ('company_registration_enabled', 'true', 'Permitir auto-registro de empresas'),
  ('two_factor_required', 'false', 'Requerir 2FA para todos los usuarios')
ON CONFLICT (key) DO NOTHING;