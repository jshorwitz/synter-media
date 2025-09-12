import { Router } from 'express';
export const router = Router();

router.post('/generate', async (req, res) => {
  // TODO: call creative agent using plan JSON
  res.json({ json: { google: [], reddit: [], x: [] }, markdown: '# Creative Bundle\n\n(TODO)' });
});

router.post('/validate', async (req, res) => {
  const errors: string[] = [];
  // TODO: validate lengths and required fields
  res.json({ ok: errors.length === 0, errors });
});
