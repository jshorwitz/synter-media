import { runAll } from './jobs/scheduler.js';
import { startQueueListener } from './queue-listener.js';

runAll();
startQueueListener().catch(err => {
  console.error('Queue listener failed to start', err);
});
