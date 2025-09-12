#!/usr/bin/env node
import mysql from 'mysql2/promise';
import crypto from 'crypto';

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ads_unified',
  multipleStatements: true,
};

const SCRYPT_N = 2 ** 15; // 32768
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEYLEN = 64;

async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, dk) => {
      if (err) reject(err); else resolve(dk);
    });
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${salt.toString('base64')}$${Buffer.from(derivedKey).toString('base64')}`;
}

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('Seeding database...');

  // Ensure DB exists (in case seed is run before migrate.sh created DB)
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\``);
  await conn.changeUser({ database: DB_CONFIG.database });

  // Users
  const adminPass = crypto.randomBytes(8).toString('hex') + 'A1!a'; // ~12+ chars
  const adminHash = await hashPassword(adminPass);
  await conn.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES 
      (?,?,?, 'admin')
     ON DUPLICATE KEY UPDATE name=VALUES(name), role=VALUES(role)`,
    ['admin@example.com', adminHash, 'Admin']
  );
  await conn.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES 
      ('viewer1@example.com', NULL, 'Viewer One', 'viewer')
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
  );
  await conn.query(
    `INSERT INTO users (email, password_hash, name, role) VALUES 
      ('viewer2@example.com', NULL, 'Viewer Two', 'viewer')
     ON DUPLICATE KEY UPDATE name=VALUES(name)`,
  );

  // Sample events over last 3 days for two users
  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n*24*3600*1000);
  const events = [
    // Google-clicked session
    { event_name: 'pageview', ts: daysAgo(2), user_id: 'u1', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'g_c_1', gclid: 'gclid_123', revenue: null },
    { event_name: 'signup', ts: daysAgo(1), user_id: 'u1', utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'g_c_1', gclid: 'gclid_123', revenue: null },
    // Reddit-clicked session
    { event_name: 'pageview', ts: daysAgo(2), user_id: 'u2', utm_source: 'reddit', utm_medium: 'cpc', utm_campaign: 'r_c_1', rdt_cid: 'rdt_456', revenue: null },
    { event_name: 'purchase', ts: daysAgo(0), user_id: 'u2', utm_source: 'reddit', utm_medium: 'cpc', utm_campaign: 'r_c_1', rdt_cid: 'rdt_456', revenue: 99.0 },
  ];

  const insertEventSql = `INSERT INTO events (event_name, ts, user_id, utm_source, utm_medium, utm_campaign, gclid, rdt_cid, revenue) VALUES (?,?,?,?,?,?,?,?,?)`;
  const eventIds = [];
  for (const e of events) {
    const [res] = await conn.query(insertEventSql, [
      e.event_name, new Date(e.ts), e.user_id,
      e.utm_source || null, e.utm_medium || null, e.utm_campaign || null,
      e.gclid || null, e.rdt_cid || null, e.revenue || null
    ]);
    eventIds.push(res.insertId);
  }

  // Conversions referencing events
  const conversions = [
    { event_id: eventIds[1], user_id: 'u1', ts: daysAgo(1), event_name: 'signup', value: 0, currency: 'USD' },
    { event_id: eventIds[3], user_id: 'u2', ts: daysAgo(0), event_name: 'purchase', value: 99.0, currency: 'USD' },
  ];
  const insertConvSql = `INSERT INTO conversions (event_id, user_id, ts, event_name, value, currency) VALUES (?,?,?,?,?,?)`;
  for (const c of conversions) {
    await conn.query(insertConvSql, [c.event_id, c.user_id, new Date(c.ts), c.event_name, c.value, c.currency]);
  }

  // Campaign policies for demo
  await conn.query(
    `INSERT INTO campaign_policies (platform, account_id, campaign_id, target_cac, max_cac, min_budget, max_budget, min_conversions)
     VALUES 
      ('google','g_acc_1','g_c_1', 40, 60, 10, 500, 3),
      ('reddit','r_acc_1','r_c_1', 35, 55, 5, 300, 3)
     ON DUPLICATE KEY UPDATE target_cac=VALUES(target_cac), max_cac=VALUES(max_cac)`
  );

  console.log('Seed complete.');
  console.log('Admin login:');
  console.log(`  email: admin@example.com`);
  console.log(`  password: ${adminPass}`);

  await conn.end();
}

main().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
