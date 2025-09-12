import mysql from 'mysql2/promise';

export class Db {
  conn: mysql.Connection;
  constructor(conn: mysql.Connection) { this.conn = conn; }
  static async connect() {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'ads_unified'
    });
    return new Db(conn);
  }
  async exec(sql: string, params: any[] = []) {
    return this.conn.execute(sql, params);
  }
}
