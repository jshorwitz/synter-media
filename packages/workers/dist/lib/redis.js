import Redis from 'ioredis';
let _sub = null;
export function getSubscriber() {
    if (_sub)
        return _sub;
    _sub = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    return _sub;
}
