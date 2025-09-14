// Database abstraction layer for BigQuery + PostgreSQL hybrid setup
import { BigQuery } from '@google-cloud/bigquery';
import { Pool } from 'pg';
import mysql from 'mysql2/promise';
import pino from 'pino';

const logger = pino().child({ module: 'database' });

// BigQuery client for analytics data
let _bigquery: BigQuery | null = null;

export function getBigQuery(): BigQuery {
  if (!_bigquery) {
    _bigquery = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
  }
  return _bigquery;
}

// PostgreSQL client for auth/transactional data  
let _pgPool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!_pgPool) {
    _pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return _pgPool;
}

// MySQL client (legacy support during migration)
let _mysqlPool: mysql.Pool | null = null;

export function getMySQLPool(): mysql.Pool {
  if (!_mysqlPool) {
    _mysqlPool = mysql.createPool({
      host: process.env.DB_HOST || process.env.MYSQLHOST,
      port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
      user: process.env.DB_USER || process.env.MYSQLUSER,
      password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      database: process.env.DB_NAME || 'synter',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return _mysqlPool;
}

// Database operations interface
export interface DatabaseOps {
  // Analytics operations (BigQuery)
  insertEvents(events: any[]): Promise<void>;
  insertAdMetrics(metrics: any[]): Promise<void>;
  insertConversions(conversions: any[]): Promise<void>;
  insertTouchpoints(touchpoints: any[]): Promise<void>;
  insertAgentRun(run: any): Promise<void>;
  queryAttribution(options: any): Promise<any[]>;
  
  // Transactional operations (PostgreSQL)
  findUserByEmail(email: string): Promise<any | null>;
  createUser(user: any): Promise<any>;
  createSession(session: any): Promise<any>;
  findSessionByToken(token: string): Promise<any | null>;
  deleteSession(token: string): Promise<void>;
}

export class HybridDatabase implements DatabaseOps {
  private bq: BigQuery;
  private pg: Pool;
  private mysql: mysql.Pool;
  private dataset: string;

  constructor() {
    this.bq = getBigQuery();
    this.pg = getPostgresPool();
    this.mysql = getMySQLPool();
    this.dataset = process.env.BIGQUERY_DATASET || 'synter_analytics';
  }

  // BigQuery operations for analytics data
  async insertEvents(events: any[]): Promise<void> {
    if (events.length === 0) return;
    
    const table = this.bq.dataset(this.dataset).table('events');
    const rows = events.map(event => ({
      id: event.id,
      event_name: event.event_name,
      ts: event.ts,
      user_id: event.user_id,
      anonymous_id: event.anonymous_id,
      session_id: event.session_id,
      utm_source: event.utm_source,
      utm_medium: event.utm_medium,
      utm_campaign: event.utm_campaign,
      utm_term: event.utm_term,
      utm_content: event.utm_content,
      gclid: event.gclid,
      gbraid: event.gbraid,
      wbraid: event.wbraid,
      rdt_cid: event.rdt_cid,
      twclid: event.twclid,
      referrer: event.referrer,
      revenue: event.revenue,
      currency: event.currency,
      properties: event.properties,
    }));

    await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: false });
    logger.info(`Inserted ${rows.length} events into BigQuery`);
  }

  async insertAdMetrics(metrics: any[]): Promise<void> {
    if (metrics.length === 0) return;
    
    const table = this.bq.dataset(this.dataset).table('ad_metrics');
    const rows = metrics.map(metric => ({
      id: metric.id,
      platform: metric.platform,
      date: metric.date,
      account_id: metric.account_id,
      campaign_id: metric.campaign_id,
      adgroup_id: metric.adgroup_id,
      ad_id: metric.ad_id,
      impressions: metric.impressions || 0,
      clicks: metric.clicks || 0,
      spend: metric.spend || 0,
      conversions: metric.conversions || 0,
      revenue: metric.revenue || 0,
      raw: metric.raw,
    }));

    await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: false });
    logger.info(`Inserted ${rows.length} ad metrics into BigQuery`);
  }

  async insertConversions(conversions: any[]): Promise<void> {
    if (conversions.length === 0) return;
    
    const table = this.bq.dataset(this.dataset).table('conversions');
    const rows = conversions.map(conversion => ({
      id: conversion.id,
      event_id: conversion.event_id,
      user_id: conversion.user_id,
      ts: conversion.ts,
      event_name: conversion.event_name,
      value: conversion.value,
      currency: conversion.currency,
    }));

    await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: false });
    logger.info(`Inserted ${rows.length} conversions into BigQuery`);
  }

  async insertTouchpoints(touchpoints: any[]): Promise<void> {
    if (touchpoints.length === 0) return;
    
    const table = this.bq.dataset(this.dataset).table('touchpoints');
    const rows = touchpoints.map(tp => ({
      id: tp.id,
      user_id: tp.user_id,
      ts: tp.ts,
      platform: tp.platform,
      campaign: tp.campaign,
      adgroup: tp.adgroup,
      ad_id: tp.ad_id,
      medium: tp.medium,
      source: tp.source,
      gclid: tp.gclid,
      rdt_cid: tp.rdt_cid,
      twclid: tp.twclid,
      utm_source: tp.utm_source,
      utm_medium: tp.utm_medium,
      utm_campaign: tp.utm_campaign,
      utm_term: tp.utm_term,
      utm_content: tp.utm_content,
      properties: tp.properties,
    }));

    await table.insert(rows, { ignoreUnknownValues: true, skipInvalidRows: false });
    logger.info(`Inserted ${rows.length} touchpoints into BigQuery`);
  }

  async insertAgentRun(run: any): Promise<void> {
    const table = this.bq.dataset(this.dataset).table('agent_runs');
    const row = {
      id: run.id,
      agent: run.agent,
      run_id: run.run_id,
      started_at: run.started_at,
      finished_at: run.finished_at,
      ok: run.ok,
      stats: run.stats,
      watermark: run.watermark,
    };

    await table.insert([row], { ignoreUnknownValues: true, skipInvalidRows: false });
    logger.info(`Inserted agent run ${run.run_id} into BigQuery`);
  }

  async queryAttribution(options: { startDate?: string, endDate?: string, platform?: string } = {}): Promise<any[]> {
    const { startDate, endDate, platform } = options;
    
    let sql = `
      SELECT 
        conversion_id,
        user_id,
        conversion_event,
        conversion_time,
        conversion_value,
        currency,
        platform,
        campaign,
        adgroup,
        ad_id,
        source,
        medium
      FROM \`${this.bq.projectId}.${this.dataset}.fact_attribution_last_touch\`
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (startDate) {
      sql += ' AND DATE(conversion_time) >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND DATE(conversion_time) <= ?';
      params.push(endDate);
    }
    
    if (platform) {
      sql += ' AND platform = ?';
      params.push(platform);
    }
    
    sql += ' ORDER BY conversion_time DESC LIMIT 1000';
    
    const [job] = await this.bq.createQueryJob({
      query: sql,
      params,
      location: 'US',
    });
    
    const [rows] = await job.getQueryResults();
    return rows;
  }

  // PostgreSQL operations for auth/transactional data
  async findUserByEmail(email: string): Promise<any | null> {
    const client = await this.pg.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async createUser(user: any): Promise<any> {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [user.email, user.password_hash, user.name, user.role || 'viewer']
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async createSession(session: any): Promise<any> {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        'INSERT INTO sessions (user_id, session_token, expires_at, user_agent, ip) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [session.user_id, session.session_token, session.expires_at, session.user_agent, session.ip]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findSessionByToken(token: string): Promise<any | null> {
    const client = await this.pg.connect();
    try {
      const result = await client.query(
        `SELECT s.*, u.* FROM sessions s 
         JOIN users u ON s.user_id = u.id 
         WHERE s.session_token = $1 AND s.expires_at > NOW()`,
        [token]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async deleteSession(token: string): Promise<void> {
    const client = await this.pg.connect();
    try {
      await client.query('DELETE FROM sessions WHERE session_token = $1', [token]);
    } finally {
      client.release();
    }
  }
}

// Global database instance
let _db: HybridDatabase | null = null;

export function getDatabase(): HybridDatabase {
  if (!_db) {
    _db = new HybridDatabase();
  }
  return _db;
}
