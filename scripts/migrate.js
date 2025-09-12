#!/usr/bin/env node
import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ads_unified',
    multipleStatements: true
  });

  console.log('Running migrations...');

  try {
    // Run migrations in order
    const migrations = [
      '001_init.sql',
      '002_views.sql', 
      '003_auth.sql'
    ];

    for (const migration of migrations) {
      console.log(`Running ${migration}...`);
      const migrationPath = join(__dirname, '..', 'migrations', migration);
      const sql = readFileSync(migrationPath, 'utf-8');
      await connection.query(sql);
      console.log(`✓ ${migration} complete`);
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
