import Redis from 'ioredis';

let _pub: Redis | null = null;

export function getPublisher(): Redis {
  if (_pub) return _pub;
  _pub = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  return _pub;
}
