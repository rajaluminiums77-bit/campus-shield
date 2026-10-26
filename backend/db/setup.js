const fs = require('fs');
const path = require('path');
const db = require('../config/database');
require('dotenv').config();

async function setup() {
  try {
    console.log('🔧 Setting up database...');

    const schema = fs.readFileSync(
      path.join(__dirname, 'schema.sql'),
      'utf8'
    );

    await db.query(schema);
    console.log('✅ Schema created');

    console.log('');
    console.log('✅ Database setup complete!');
    console.log('👉 Now run: npm run seed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  }
}

setup();