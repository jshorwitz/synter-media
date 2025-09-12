import { Router } from 'express';
export const router = Router();
router.get('/list', (_req, res) => {
    res.json({ agents: ['ingestor-google', 'ingestor-reddit', 'ingestor-x', 'touchpoint-extractor', 'conversion-uploader', 'budget-optimizer', 'analyst', 'creative'] });
});
router.post('/run', (req, res) => {
    // TODO: enqueue a job with payload { agent, window, dryRun }
    res.json({ ok: true, enqueued: req.body });
});
