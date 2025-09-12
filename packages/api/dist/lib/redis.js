import Redis from 'ioredis';
let _pub = null;
export function getPublisher() {
    if (_pub)
        return _pub;
    _pub = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    return _pub;
}
