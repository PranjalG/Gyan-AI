import { Router } from 'express';
import { supabase } from '../services/supabase.js';

const router = Router();

/**
 * GET /api/documents — all documents with chunk counts.
 */
router.get('/', async (_req, res) => {
  try {
    const { data: documents, error: docError } = await supabase
      .from('documents')
      .select('id, name, source_type, created_at')
      .order('created_at', { ascending: false });

    if (docError) throw docError;

    const { data: chunks, error: chunkError } = await supabase
      .from('chunks')
      .select('document_id');

    if (chunkError) throw chunkError;

    const counts = {};
    for (const c of chunks || []) {
      counts[c.document_id] = (counts[c.document_id] || 0) + 1;
    }

    const result = (documents || []).map((d) => ({
      ...d,
      chunkCount: counts[d.id] || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('Documents list error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch documents' });
  }
});

/**
 * DELETE /api/documents/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: err.message || 'Delete failed' });
  }
});

export default router;
