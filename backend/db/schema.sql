-- ============================================
-- Campus Shield Database Schema
-- ============================================

DROP TABLE IF EXISTS alert_reads CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS incident_updates CASCADE;
DROP TABLE IF EXISTS incident_attachments CASCADE;
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student',
  student_id VARCHAR(50),
  phone VARCHAR(255),
  department VARCHAR(150),
  room VARCHAR(150),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- INCIDENTS
-- ============================================
CREATE TABLE incidents (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'Medium',
  status VARCHAR(20) DEFAULT 'Active',
  reported_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
  reporter_name VARCHAR(150),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  response_time INTEGER,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_type ON incidents(type);
CREATE INDEX idx_incidents_created ON incidents(created_at DESC);

-- ============================================
-- ATTACHMENTS
-- ============================================
CREATE TABLE incident_attachments (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  path VARCHAR(500) NOT NULL,
  mimetype VARCHAR(100),
  size INTEGER,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INCIDENT UPDATES (timeline)
-- ============================================
CREATE TABLE incident_updates (
  id SERIAL PRIMARY KEY,
  incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
  message TEXT,
  status VARCHAR(20),
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ALERTS
-- ============================================
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(30) DEFAULT 'System',
  severity VARCHAR(20) DEFAULT 'Medium',
  incident_id INTEGER REFERENCES incidents(id) ON DELETE CASCADE,
  target_role VARCHAR(20) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alerts_target ON alerts(target_role);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);

-- ============================================
-- ALERT READS
-- ============================================
CREATE TABLE alert_reads (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(alert_id, user_id)
);

SELECT 'Schema created successfully' AS status;