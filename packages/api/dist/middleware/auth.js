import { getUserBySession } from '../lib/auth.js';
export async function requireAuth(req, res, next) {
    const sid = req.cookies?.sid;
    if (!sid)
        return res.status(401).json({ error: 'unauthenticated' });
    const user = await getUserBySession(sid);
    if (!user)
        return res.status(401).json({ error: 'unauthenticated' });
    res.locals.user = user;
    next();
}
export function requireRole(roles) {
    return (req, res, next) => {
        const user = res.locals.user;
        if (!user?.role || !roles.includes(user.role)) {
            return res.status(403).json({ error: 'forbidden' });
        }
        next();
    };
}
