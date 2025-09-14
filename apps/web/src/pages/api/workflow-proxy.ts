/**
 * Vercel API Proxy - Routes workflow requests to external Railway backend
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const BACKEND_URL = process.env.AI_AGENCY_API_URL || process.env.PPC_BACKEND_URL || 'http://localhost:8088';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  if (!path || Array.isArray(path)) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  try {
    const targetUrl = `${BACKEND_URL}/workflow/${path}`;
    
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization as string }),
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Workflow proxy error:', error);
    res.status(500).json({ 
      error: 'Backend service unavailable',
      message: 'The AI advertising service is temporarily unavailable. Please try again later.'
    });
  }
}
