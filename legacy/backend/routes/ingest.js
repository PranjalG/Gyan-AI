import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { chunkText } from '../services/chunker.js';
import { embedText } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/ingest
 * Chunk text, embed each chunk, store in Supabase.
 */
router.post('/', async (req, res) => {
  try {
    const { text, filename } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const name = filename?.trim() || 'Untitled Document';
    const chunks = chunkText(text);

    if (chunks.length === 0) {
      return res.status(400).json({ error: 'No content to ingest' });
    }

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .insert({ name, source_type: 'text' })
      .select('id')
      .single();

    if (docError) throw docError;

    const rows = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      rows.push({
        document_id: doc.id,
        content: chunks[i],
        chunk_index: i,
        embedding,
      });
    }

    const { error: chunkError } = await supabase.from('chunks').insert(rows);
    if (chunkError) throw chunkError;

    res.json({ documentId: doc.id, chunkCount: chunks.length });
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: err.message || 'Ingest failed' });
  }
});

export default router;
