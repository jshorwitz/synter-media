import { getPublisher } from './redis.js';
import crypto from 'crypto';
export async function enqueueAgent(payload) {
    const pub = getPublisher();
    const run_id = payload.run_id || crypto.randomUUID();
    const message = {
        agent: payload.agent,
        run_id,
        window: payload.window,
        dryRun: payload.dryRun,
        enqueued_at: new Date().toISOString(),
    };
    await pub.publish('agents:run', JSON.stringify(message));
    return message;
}
