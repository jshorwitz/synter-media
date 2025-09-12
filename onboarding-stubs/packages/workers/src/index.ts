import { Db } from './util/db.js';
import { runOnboardingLoop } from './onboarding/runner.js';

const start = async () => {
  const db = await Db.connect();
  await runOnboardingLoop(db);
};
start().catch(e => { console.error(e); process.exit(1); });
