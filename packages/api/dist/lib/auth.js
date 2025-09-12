import crypto from 'crypto';
import { db } from './db.js';
// Password hashing using Node's built-in scrypt to avoid extra deps
// Stored format: scrypt$N$r$p$saltBase64$hashBase64
const SCRYPT_N = 2 ** 15; // 32768
const SCRYPT_r = 8;
const SCRYPT_p = 1;
const KEYLEN = 64;
export async function hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const derivedKey = await new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_r, p: SCRYPT_p }, (err, dk) => {
            if (err)
                reject(err);
            else
                resolve(dk);
        });
    });
    return `scrypt$${SCRYPT_N}$${SCRYPT_r}$${SCRYPT_p}$${salt.toString('base64')}$${derivedKey.toString('base64')}`;
}
export async function verifyPassword(password, stored) {
    if (!stored)
        return false;
    try {
        const parts = stored.split('$');
        if (parts.length !== 6 || parts[0] !== 'scrypt')
            return false;
        const N = Number(parts[1]);
        const r = Number(parts[2]);
        const p = Number(parts[3]);
        const salt = Buffer.from(parts[4], 'base64');
        const hash = Buffer.from(parts[5], 'base64');
        const dk = await new Promise((resolve, reject) => {
            crypto.scrypt(password, salt, hash.length, { N, r, p }, (err, out) => {
                if (err)
                    reject(err);
                else
                    resolve(out);
            });
        });
        return crypto.timingSafeEqual(hash, dk);
    }
    catch {
        return false;
    }
}
export async function createSession(userId, userAgent, ip) {
    const token = crypto.randomBytes(32).toString('hex'); // 64 chars
    const expiresAt = new Date(Date.now() + (parseInt(process.env.SESSION_TTL_DAYS || '7', 10) * 24 * 3600 * 1000));
    await db.query('INSERT INTO sessions (user_id, session_token, expires_at, user_agent, ip) VALUES (?, ?, ?, ?, ?)', [userId, token, expiresAt, userAgent || null, ip || null]);
    return token;
}
export async function destroySession(token) {
    await db.query('DELETE FROM sessions WHERE session_token = ?', [token]);
}
export async function getUserBySession(token) {
    const [rows] = await db.query(`SELECT u.id, u.email, u.name, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_token = ? AND s.expires_at > NOW()`, [token]);
    const arr = rows;
    if (!arr || arr.length === 0)
        return null;
    return arr[0];
}
export function cookieOptions() {
    const secure = (process.env.COOKIE_SECURE === 'true') || (process.env.NODE_ENV === 'production');
    const days = parseInt(process.env.SESSION_TTL_DAYS || '7', 10);
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        maxAge: days * 24 * 3600 * 1000,
        path: '/',
    };
}
