import { ingestorGoogle } from './tasks/ingestor-google.js';
import { ingestorReddit } from './tasks/ingestor-reddit.js';
import { ingestorX } from './tasks/ingestor-x.js';
import { touchpointExtractor } from './tasks/touchpoint-extractor.js';
import { conversionUploader } from './tasks/conversion-uploader.js';
import { budgetOptimizer } from './tasks/budget-optimizer.js';
export function runAll() {
    console.log('Workers started');
    // naive scheduler: run once at startup
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000);
    ingestorGoogle(yesterday);
    ingestorReddit(yesterday);
    ingestorX(yesterday);
    touchpointExtractor();
    conversionUploader();
    budgetOptimizer({ days: 14, dryRun: process.env.DRY_RUN === 'true' });
}
