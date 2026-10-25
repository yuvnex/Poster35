import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { db as sqliteDb } from '../backend/src/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

import dotenv from 'dotenv';
dotenv.config({ path: path.join(rootDir, 'backend', '.env') });

const AIVEN_CONFIG = {
  host: process.env.MYSQL_HOST || 'mysql-f10d03a-palanivelyuvanesh-efa8.l.aivencloud.com',
  port: parseInt(process.env.MYSQL_PORT || '20477', 10),
  user: process.env.MYSQL_USER || 'avnadmin',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 5,
  multipleStatements: true
};

async function waitForConnection(maxRetries = 30, delayMs = 10000) {
  console.log(`🔌 Attempting to connect to Aiven MySQL at: ${AIVEN_CONFIG.host}:${AIVEN_CONFIG.port}`);
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mysql.createConnection({
        host: AIVEN_CONFIG.host,
        port: AIVEN_CONFIG.port,
        user: AIVEN_CONFIG.user,
        password: AIVEN_CONFIG.password,
        database: AIVEN_CONFIG.database,
        ssl: AIVEN_CONFIG.ssl,
        connectTimeout: 8000
      });
      console.log(`✅ [Attempt ${attempt}/${maxRetries}] Successfully connected to Aiven MySQL!`);
      return conn;
    } catch (err) {
      console.log(`⏳ [Attempt ${attempt}/${maxRetries}] Service still initializing or building (${err.message}). Retrying in ${delayMs / 1000}s...`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, delayMs));
      } else {
        throw new Error(`Failed to connect to Aiven MySQL after ${maxRetries} attempts: ${err.message}`);
      }
    }
  }
}

async function deploy() {
  console.log('====================================================');
  console.log('   POSTER35 -> AIVEN MYSQL AUTO DEPLOYMENT & SEED   ');
  console.log('====================================================\n');

  const conn = await waitForConnection();

  try {
    // 1. Create tables from database/mysql-schema.sql
    console.log('\n📄 1. Applying MySQL Schema...');
    const schemaPath = path.join(rootDir, 'database', 'mysql-schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    // Remove single line comments (-- ...) and block comments (/* ... */)
    schemaSql = schemaSql
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map(line => line.trim().startsWith('--') ? '' : line)
      .join('\n');

    // Split into individual SQL statements
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 5);

    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    for (const sql of statements) {
      await conn.query(sql);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log(`   ✓ All ${statements.length} tables created successfully in Aiven MySQL!`);

    // 2. Transfer Categories from SQLite
    console.log('\n📁 2. Migrating Categories...');
    const categories = sqliteDb.prepare('SELECT * FROM categories').all();
    for (const cat of categories) {
      await conn.query(
        `INSERT INTO categories (id, slug, name, description, image_url, display_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), image_url=VALUES(image_url), display_order=VALUES(display_order)`,
        [cat.id, cat.slug, cat.name, cat.description, cat.image_url, cat.display_order, cat.created_at || new Date()]
      );
    }
    console.log(`   ✓ Migrated ${categories.length} categories.`);

    // 3. Transfer Posters from SQLite
    console.log('\n🖼️  3. Migrating Posters Catalog...');
    const posters = sqliteDb.prepare('SELECT * FROM posters').all();
    for (const p of posters) {
      await conn.query(
        `INSERT INTO posters (id, title, slug, description, category_id, price, image_url, is_featured, is_trending, in_stock, tags, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), price=VALUES(price), image_url=VALUES(image_url), in_stock=VALUES(in_stock), tags=VALUES(tags)`,
        [
          p.id,
          p.title,
          p.slug,
          p.description,
          p.category_id,
          p.price,
          p.image_url,
          p.is_featured ? 1 : 0,
          p.is_trending ? 1 : 0,
          p.in_stock ? 1 : 0,
          p.tags,
          p.created_at || new Date()
        ]
      );
    }
    console.log(`   ✓ Migrated ${posters.length} posters.`);

    // 4. Transfer Users from SQLite
    console.log('\n👥 4. Migrating Admin & Users...');
    const users = sqliteDb.prepare('SELECT * FROM users').all();
    for (const u of users) {
      await conn.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), phone=VALUES(phone), role=VALUES(role)`,
        [u.id, u.email, u.password_hash, u.full_name, u.phone, u.role, u.created_at || new Date()]
      );
    }
    console.log(`   ✓ Migrated ${users.length} users.`);

    // 5. Transfer Store Settings
    console.log('\n⚙️  5. Setting Store Configuration...');
    const settings = sqliteDb.prepare('SELECT * FROM store_settings').all();
    for (const s of settings) {
      await conn.query(
        `INSERT INTO store_settings (\`key\`, \`value\`, \`description\`)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`)`,
        [s.key, s.value, s.description]
      );
    }
    console.log(`   ✓ Configured ${settings.length} store settings.`);

    // 6. Verification query on Aiven
    console.log('\n📊 6. Verification Report from Aiven MySQL:');
    const [[{ catCount }]] = await conn.query('SELECT COUNT(*) as catCount FROM categories');
    const [[{ posterCount }]] = await conn.query('SELECT COUNT(*) as posterCount FROM posters');
    const [[{ userCount }]] = await conn.query('SELECT COUNT(*) as userCount FROM users');
    const [[{ orderCount }]] = await conn.query('SELECT COUNT(*) as orderCount FROM orders');

    console.log(`   • Categories in Aiven MySQL: ${catCount}`);
    console.log(`   • Posters in Aiven MySQL:    ${posterCount}`);
    console.log(`   • Users in Aiven MySQL:      ${userCount}`);
    console.log(`   • Orders in Aiven MySQL:     ${orderCount} (Clean slate ready for live sales)\n`);

    // 7. Update backend/.env
    console.log('📝 7. Updating backend/.env configuration...');
    const envPath = path.join(rootDir, 'backend', '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';
    
    // Add or update MYSQL configuration
    const mysqlEnvBlock = `
# Aiven MySQL 8.4 Production Database
MYSQL_HOST=\${process.env.MYSQL_HOST || 'mysql-f10d03a-palanivelyuvanesh-efa8.l.aivencloud.com'}
MYSQL_PORT=\${process.env.MYSQL_PORT || '20477'}
MYSQL_USER=\${process.env.MYSQL_USER || 'avnadmin'}
MYSQL_PASSWORD=\${process.env.MYSQL_PASSWORD || ''}
MYSQL_DATABASE=\${process.env.MYSQL_DATABASE || 'defaultdb'}
MYSQL_SSL=true
`;

    if (!envContent.includes('MYSQL_HOST=')) {
      envContent += mysqlEnvBlock;
      fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
      console.log('   ✓ Appended Aiven MySQL credentials to backend/.env');
    } else {
      console.log('   ✓ backend/.env already contains MySQL configuration');
    }

    console.log('====================================================');
    console.log('  🎉 AIVEN MYSQL DEPLOYMENT COMPLETED SUCCESSFULLY! ');
    console.log('====================================================');

    await conn.end();
  } catch (err) {
    console.error('\n❌ Deployment failed:', err);
    await conn.end();
    process.exit(1);
  }
}

deploy();
