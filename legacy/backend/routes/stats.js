import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const [docsRes, chunksRes, queriesRes] = await Promise.all([
      supabase.from('documents').select('*', { count: 'exact', head: true }),
      supabase.from('chunks').select('*', { count: 'exact', head: true }),
      supabase.from('chat_history').select('*', { count: 'exact', head: true }),
    ]);

    res.json({
      totalDocs: docsRes.count ?? 0,
      totalChunks: chunksRes.count ?? 0,
      totalQueries: queriesRes.count ?? 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
});

export default router;
