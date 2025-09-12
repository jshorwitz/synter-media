import { getSubscriber } from './lib/redis.js';
import { db } from './lib/db.js';
import { ingestorGoogle } from './jobs/tasks/ingestor-google.js';
import { ingestorReddit } from './jobs/tasks/ingestor-reddit.js';
import { ingestorX } from './jobs/tasks/ingestor-x.js';
import { touchpointExtractor } from './jobs/tasks/touchpoint-extractor.js';
import { conversionUploader } from './jobs/tasks/conversion-uploader.js';
import { budgetOptimizer } from './jobs/tasks/budget-optimizer.js';

type Payload = {
  agent: string;
  run_id: string;
  window?: { start?: string; end?: string };
  dryRun?: boolean;
};

export async function startQueueListener() {
  const sub = getSubscriber();
  await sub.subscribe('agents:run');
  console.log('[workers] Subscribed to agents:run');

  sub.on('message', async (_channel, message) => {
    let payload: Payload | null = null;
    try {
      payload = JSON.parse(message);
    } catch (e) {
      console.error('Invalid message', e);
      return;
    }

    if (!payload) return;
    const { agent, run_id } = payload;

    const start = Date.now();
    let ok = false;
    const notes: string[] = [];
    try {
      switch (agent) {
        case 'ingestor-google':
          await ingestorGoogle(new Date());
          break;
        case 'ingestor-reddit':
          await ingestorReddit(new Date());
          break;
        case 'ingestor-x':
          await ingestorX(new Date());
          break;
        case 'touchpoint-extractor':
          await touchpointExtractor();
          break;
        case 'conversion-uploader':
          await conversionUploader();
          break;
        case 'budget-optimizer':
          await budgetOptimizer({ days: 14, dryRun: !!payload.dryRun });
          break;
        default:
          notes.push(`unknown agent: ${agent}`);
      }
      ok = notes.length === 0;
    } catch (e: any) {
      notes.push(e?.message || 'error');
      ok = false;
    } finally {
      const ms = Date.now() - start;
      try {
        await db.query(
          'UPDATE agent_runs SET finished_at = NOW(6), ok = ?, stats = ? WHERE agent = ? AND run_id = ?',
          [ok, JSON.stringify({ ms, notes }), agent, run_id]
        );
      } catch (e) {
        console.error('Failed to update agent_runs', e);
      }
    }
  });
}
