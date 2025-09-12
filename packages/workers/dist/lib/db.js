import mysql from 'mysql2/promise';
let _db = null;
export async function getDb() {
    if (!_db) {
        _db = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            database: process.env.DB_NAME || 'ads_unified',
            multipleStatements: true
        });
    }
    return _db;
}
export const db = {
    async query(sql, values) {
        const connection = await getDb();
        return connection.query(sql, values);
    }
};
