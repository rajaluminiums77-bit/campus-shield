const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { encrypt } = require('../utils/encryption');
require('dotenv').config();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Clear existing data
    await db.query(
      'TRUNCATE alert_reads, alerts, incident_updates, incident_attachments, incidents, users RESTART IDENTITY CASCADE'
    );
    console.log('🗑️  Cleared existing data');

    // Hash passwords
    const hash1 = await bcrypt.hash('password123', 12);
    const hash2 = await bcrypt.hash('admin123', 12);

    // Insert users
    const users = await db.query(
      `INSERT INTO users (name, email, password, role, student_id, phone, department, room, joined_at)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, NOW()),
         ($9, $10, $11, $12, $13, $14, $15, $16, NOW()),
         ($17, $18, $19, $20, $21, $22, $23, $24, NOW()),
         ($25, $26, $27, $28, $29, $30, $31, $32, NOW())
       RETURNING id, name, email, role`,
      [
        'Alex Johnson', 'alex.johnson@campus.edu', hash1, 'student',
        'CS-2024-078', encrypt('+1 (555) 234-5678'), 'Computer Science', 'Block C, Room 204',

        'Sarah Williams', 'sarah.williams@campus.edu', hash1, 'student',
        'EE-2024-112', encrypt('+1 (555) 345-6789'), 'Electrical Engineering', 'Block A, Room 315',

        'Mike Chen', 'mike.chen@campus.edu', hash1, 'security',
        'SEC-001', encrypt('+1 (555) 456-7890'), 'Campus Security', 'Security Office',

        'Admin User', 'admin@campus.edu', hash2, 'admin',
        'ADM-001', encrypt('+1 (555) 567-8901'), 'Administration', 'Admin Block',
      ]
    );

    console.log(`👥 Created ${users.rows.length} users`);

    const student = users.rows[0];
    const student2 = users.rows[1];
    const security = users.rows[2];

    // Insert incidents
    const incidents = await db.query(
      `INSERT INTO incidents
        (title, type, location, description, priority, status, reported_by, reporter_name, assigned_to, lat, lng, response_time, resolved_at, created_at)
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW() - INTERVAL '2 hours'),
         ($14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NOW() - INTERVAL '5 hours'),
         ($27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, NOW() - INTERVAL '1 day'),
         ($40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, NOW() - INTERVAL '3 hours'),
         ($53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, NOW() - INTERVAL '6 hours'),
         ($66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, NOW() - INTERVAL '12 hours')
       RETURNING id, title, type, priority`,
      [
        // Incident 1 - Bullying
        'Bullying near Block C', 'Bullying', 'Block C, near cafeteria',
        'A group of seniors were verbally harassing a junior near the cafeteria entrance.',
        'Medium', 'In Progress', student.id, student.name, security.id,
        28.6139, 77.209, null, null,

        // Incident 2 - Fire
        'Fire alarm triggered at Block A', 'Fire', 'Block A, 3rd Floor',
        'Fire alarm triggered. Smoke detected near laboratory area.',
        'Critical', 'Resolved', student2.id, student2.name, security.id,
        28.6145, 77.2095, 3, new Date(Date.now() - 4 * 60 * 60 * 1000),

        // Incident 3 - Theft
        'Theft in parking lot', 'Theft', 'Main Parking Lot, Zone B',
        'Bike stolen from parking lot. Lock was broken.',
        'High', 'In Progress', student2.id, student2.name, security.id,
        28.613, 77.208, null, null,

        // Incident 4 - Medical
        'Medical emergency at Gym', 'Medical Emergency', 'Campus Gymnasium',
        'Student fainted during workout. Ambulance called immediately.',
        'Critical', 'Resolved', student.id, student.name, security.id,
        28.615, 77.207, 4, new Date(Date.now() - 8 * 60 * 60 * 1000),

        // Incident 5 - Suspicious
        'Suspicious person near Gate 2', 'Suspicious Person', 'Gate 2, near parking',
        'Unidentified person loitering near gate 2 for over an hour.',
        'Medium', 'Active', student.id, student.name, null,
        28.612, 77.211, null, null,

        // Incident 6 - Harassment
        'Harassment reported in library', 'Harassment', 'Central Library, 2nd floor',
        'Student reported verbal harassment by another student.',
        'High', 'Resolved', student2.id, student2.name, security.id,
        28.614, 77.210, 6, new Date(Date.now() - 20 * 60 * 60 * 1000),
      ]
    );

    console.log(`📋 Created ${incidents.rows.length} incidents`);

    // Add timeline updates for first incident
    await db.query(
      `INSERT INTO incident_updates (incident_id, message, status, updated_by)
       VALUES
         ($1, 'Incident reported by student', 'Active', $2),
         ($1, 'Security team dispatched to location', 'In Progress', $3)`,
      [incidents.rows[0].id, student.id, security.id]
    );

    // Insert alerts
    await db.query(
      `INSERT INTO alerts (title, message, type, severity, incident_id, target_role)
       VALUES
         ($1, $2, $3, $4, $5, $6),
         ($7, $8, $9, $10, $11, $12),
         ($13, $14, $15, $16, $17, $18)`,
      [
        '🚨 Fire alarm triggered', 'Fire detected at Block A, 3rd Floor',
        'Incident', 'Critical', incidents.rows[1].id, 'security',

        '🚑 Medical emergency', 'Student fainted at Gym',
        'Incident', 'Critical', incidents.rows[3].id, 'security',

        '⚠️ Suspicious activity', 'Person loitering near Gate 2',
        'Incident', 'Medium', incidents.rows[4].id, 'security',
      ]
    );

    console.log('🔔 Created 3 alerts');
    console.log('');
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Student:   alex.johnson@campus.edu / password123');
    console.log('   Student 2: sarah.williams@campus.edu / password123');
    console.log('   Security:  mike.chen@campus.edu / password123');
    console.log('   Admin:     admin@campus.edu / admin123');
    console.log('');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    if (require.main === module) {
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;