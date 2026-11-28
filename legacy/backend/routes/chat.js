import { Router } from 'express';
import { supabase } from '../services/supabase.js';
import { embedText, generateAnswer, confidenceFromSimilarity } from '../services/gemini.js';

const router = Router();

/**
 * POST /api/chat
 * RAG pipeline: embed question → retrieve → generate → save history.
 */
router.post('/', async (req, res) => {
  try {
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const queryEmbedding = await embedText(question);

    const { data: matches, error: matchError } = await supabase.rpc('match_chunks', {
      query_embedding: queryEmbedding,
      match_count: 3,
    });

    if (matchError) throw matchError;

    const topSimilarity = matches?.[0]?.similarity ?? 0;
    const confidence = confidenceFromSimilarity(topSimilarity);

    const docIds = [...new Set((matches || []).map((m) => m.document_id).filter(Boolean))];
    let docMap = {};
    if (docIds.length) {
      const { data: docs } = await supabase.from('documents').select('id, name').in('id', docIds);
      docMap = Object.fromEntries((docs || []).map((d) => [d.id, d.name]));
    }

    const contextBlock = (matches || [])
      .map((m, i) => `[Source ${i + 1}] (${docMap[m.document_id] || 'Unknown'})\n${m.content}`)
      .join('\n\n');

    const answer = await generateAnswer(
      contextBlock || 'No context available.',
      question
    );

    const sources = (matches || []).map((m, i) => ({
      chunkId: m.id,
      content: m.content,
      similarity: m.similarity,
      documentName: docMap[m.document_id] || 'Unknown',
      sourceLabel: `Source ${i + 1}`,
    }));

    const { error: historyError } = await supabase.from('chat_history').insert({
      question,
      answer,
      sources,
      confidence,
    });

    if (historyError) console.error('History save error:', historyError);

    res.json({ answer, sources, confidence });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message || 'Chat failed' });
  }
});

export default router;
