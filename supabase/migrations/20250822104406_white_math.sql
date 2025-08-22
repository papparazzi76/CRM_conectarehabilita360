/*
# Schema inicial del CRM de construcción

1. Tablas principales
   - `users` - Usuarios del sistema (ADMIN/EMPRESA)
   - `credit_wallets` - Wallets de créditos por usuario
   - `credit_transactions` - Historial de transacciones de créditos
   - `leads` - Leads/oportunidades comerciales
   - `lead_requests` - Solicitudes de leads por empresas
   - `lead_shares` - Estados comerciales por empresa-lead
   - `pricing_tiers` - Configuración de precios por rango de valor
   - `audit_log` - Log de auditoría de todas las acciones

2. Tablas de catálogo
   - `provinces` - Catálogo de provincias
   - `municipalities` - Catálogo de municipios
   - `work_types` - Tipos de obra

3. Seguridad
   - RLS habilitado en todas las tablas
   - Políticas específicas por rol (ADMIN vs EMPRESA)
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Provinces catalog
CREATE TABLE IF NOT EXISTS provinces (
  id SERIAL PRIMARY KEY,
  code VARCHAR(2) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read provinces"
  ON provinces
  FOR SELECT
  TO authenticated
  USING (true);

-- Municipalities catalog
CREATE TABLE IF NOT EXISTS municipalities (
  id SERIAL PRIMARY KEY,
  province_id INTEGER REFERENCES provinces(id),
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE municipalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read municipalities"
  ON municipalities
  FOR SELECT
  TO authenticated
  USING (true);

-- Work types catalog
CREATE TABLE IF NOT EXISTS work_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read work types"
  ON work_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'EMPRESA' CHECK (role IN ('ADMIN', 'EMPRESA')),
  company_name VARCHAR(255),
  nif_cif VARCHAR(20),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(32),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Credit wallets
CREATE TABLE IF NOT EXISTS credit_wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet"
  ON credit_wallets
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all wallets"
  ON credit_wallets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all wallets"
  ON credit_wallets
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Credit transactions
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lead_id UUID NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('RECARGA', 'CONSUMO', 'AJUSTE')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all transactions"
  ON credit_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id INTEGER REFERENCES provinces(id),
  municipality_id INTEGER REFERENCES municipalities(id),
  work_type_id INTEGER REFERENCES work_types(id),
  ce_letter_current VARCHAR(1) CHECK (ce_letter_current IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  ce_letter_target VARCHAR(1) CHECK (ce_letter_target IN ('A', 'B', 'C', 'D', 'E', 'F', 'G')),
  estimated_budget DECIMAL(12,2) NOT NULL,
  desired_timeline TEXT,
  is_urgent BOOLEAN DEFAULT false,
  project_value DECIMAL(12,2) NOT NULL,
  publication_status VARCHAR(20) DEFAULT 'DISPONIBLE' CHECK (publication_status IN ('DISPONIBLE', 'AGOTADO', 'OCULTO')),
  max_shared_companies INTEGER DEFAULT 4 CHECK (max_shared_companies >= 0 AND max_shared_companies <= 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read available leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (publication_status = 'DISPONIBLE');

CREATE POLICY "Admins can manage all leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Lead requests
CREATE TABLE IF NOT EXISTS lead_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  competition_level INTEGER CHECK (competition_level IN (0, 1, 2, 3, 4)),
  is_exclusive BOOLEAN DEFAULT false,
  credit_cost INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'SOLICITADO' CHECK (status IN ('SOLICITADO', 'ENTREGADO', 'CANCELADO')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, user_id)
);

ALTER TABLE lead_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own requests"
  ON lead_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own requests"
  ON lead_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON lead_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Lead shares (commercial pipeline)
CREATE TABLE IF NOT EXISTS lead_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  commercial_status VARCHAR(20) DEFAULT 'SOLICITADO' CHECK (commercial_status IN ('SOLICITADO', 'CONTACTADO', 'PRESUPUESTADO', 'CONTRATADO', 'PERDIDO')),
  loss_reason TEXT,
  budget_amount DECIMAL(12,2),
  contract_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id, user_id)
);

ALTER TABLE lead_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own shares"
  ON lead_shares
  FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all shares"
  ON lead_shares
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Pricing tiers
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id SERIAL PRIMARY KEY,
  min_value DECIMAL(12,2) NOT NULL,
  max_value DECIMAL(12,2),
  base_credits INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read pricing"
  ON pricing_tiers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage pricing"
  ON pricing_tiers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Audit log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit log"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.auth_user_id = auth.uid()
      AND users.role = 'ADMIN'
    )
  );

-- Insert initial data
INSERT INTO provinces (code, name) VALUES
  ('01', 'Álava'),
  ('02', 'Albacete'),
  ('03', 'Alicante'),
  ('04', 'Almería'),
  ('05', 'Ávila'),
  ('06', 'Badajoz'),
  ('07', 'Baleares'),
  ('08', 'Barcelona'),
  ('09', 'Burgos'),
  ('10', 'Cáceres'),
  ('11', 'Cádiz'),
  ('12', 'Castellón'),
  ('13', 'Ciudad Real'),
  ('14', 'Córdoba'),
  ('15', 'A Coruña'),
  ('16', 'Cuenca'),
  ('17', 'Girona'),
  ('18', 'Granada'),
  ('19', 'Guadalajara'),
  ('20', 'Guipúzcoa'),
  ('21', 'Huelva'),
  ('22', 'Huesca'),
  ('23', 'Jaén'),
  ('24', 'León'),
  ('25', 'Lleida'),
  ('26', 'La Rioja'),
  ('27', 'Lugo'),
  ('28', 'Madrid'),
  ('29', 'Málaga'),
  ('30', 'Murcia'),
  ('31', 'Navarra'),
  ('32', 'Ourense'),
  ('33', 'Asturias'),
  ('34', 'Palencia'),
  ('35', 'Las Palmas'),
  ('36', 'Pontevedra'),
  ('37', 'Salamanca'),
  ('38', 'Santa Cruz de Tenerife'),
  ('39', 'Cantabria'),
  ('40', 'Segovia'),
  ('41', 'Sevilla'),
  ('42', 'Soria'),
  ('43', 'Tarragona'),
  ('44', 'Teruel'),
  ('45', 'Toledo'),
  ('46', 'Valencia'),
  ('47', 'Valladolid'),
  ('48', 'Vizcaya'),
  ('49', 'Zamora'),
  ('50', 'Zaragoza'),
  ('51', 'Ceuta'),
  ('52', 'Melilla')
ON CONFLICT (code) DO NOTHING;

INSERT INTO work_types (name, description) VALUES
  ('Rehabilitación energética', 'Mejora de la eficiencia energética de edificios'),
  ('Nueva construcción', 'Construcción de edificios nuevos'),
  ('Reforma integral', 'Reforma completa de viviendas o locales'),
  ('Ampliación', 'Ampliación de edificios existentes'),
  ('Instalaciones', 'Instalación de sistemas técnicos'),
  ('Cubierta y tejados', 'Reparación o instalación de cubiertas'),
  ('Fachadas', 'Rehabilitación de fachadas'),
  ('Estructura', 'Refuerzo o reparación estructural')
ON CONFLICT DO NOTHING;

INSERT INTO pricing_tiers (min_value, max_value, base_credits) VALUES
  (0, 19999.99, 1),
  (20000, 29999.99, 2),
  (30000, 49999.99, 3),
  (50000, 99999.99, 4),
  (100000, NULL, 5)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_publication_status ON leads(publication_status);
CREATE INDEX IF NOT EXISTS idx_leads_province ON leads(province_id);
CREATE INDEX IF NOT EXISTS idx_leads_municipality ON leads(municipality_id);
CREATE INDEX IF NOT EXISTS idx_leads_work_type ON leads(work_type_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_lead_shares_user_id ON lead_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_shares_commercial_status ON lead_shares(commercial_status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);