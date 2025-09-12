import { getPublisher } from './redis.js';
import crypto from 'crypto';

export type AgentEnqueuePayload = {
  agent: string;
  run_id: string;
  window?: { start?: string; end?: string };
  dryRun?: boolean;
  enqueued_at: string;
};

export async function enqueueAgent(payload: Omit<AgentEnqueuePayload, 'run_id' | 'enqueued_at'> & { run_id?: string }) {
  const pub = getPublisher();
  const run_id = payload.run_id || crypto.randomUUID();
  const message: AgentEnqueuePayload = {
    agent: payload.agent,
    run_id,
    window: payload.window,
    dryRun: payload.dryRun,
    enqueued_at: new Date().toISOString(),
  };
  await pub.publish('agents:run', JSON.stringify(message));
  return message;
}
