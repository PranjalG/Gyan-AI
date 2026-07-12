import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// text-embedding-004 / gemini-1.5-flash are deprecated on v1beta; use current models
const EMBED_MODEL = 'gemini-embedding-001';
const CHAT_MODEL = 'gemini-2.5-flash';
const EMBEDDING_DIM = 768;

const SYSTEM_PROMPT = `You are an enterprise knowledge assistant. Answer ONLY using the 
provided context chunks below. Always cite which source chunk you used 
(e.g. [Source 1], [Source 2]). If the answer is not in the context, 
say 'I don't have enough information in the knowledge base to answer this.' 
Be concise and professional.`;

/**
 * Get 768-dim embedding from Gemini embedding model.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function embedText(text) {
  const url = `${BASE}/models/${EMBED_MODEL}:embedContent?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: `models/${EMBED_MODEL}`,
      content: { parts: [{ text }] },
      outputDimensionality: EMBEDDING_DIM,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embed failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const values = data.embedding?.values;
  if (!values || values.length !== EMBEDDING_DIM) {
    throw new Error(`Invalid embedding dimensions: expected ${EMBEDDING_DIM}, got ${values?.length}`);
  }
  return values;
}

/**
 * Generate chat answer with Gemini Flash.
 * @param {string} contextBlock - Retrieved chunks formatted for prompt
 * @param {string} question
 * @returns {Promise<string>}
 */
export async function generateAnswer(contextBlock, question) {
  const url = `${BASE}/models/${CHAT_MODEL}:generateContent?key=${API_KEY}`;
  const userContent = `${SYSTEM_PROMPT}

--- CONTEXT ---
${contextBlock}

--- QUESTION ---
${question}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userContent }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini generate failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from Gemini');
  return text.trim();
}

/**
 * Confidence label from top retrieval similarity.
 * @param {number} topSimilarity
 * @returns {'HIGH'|'MEDIUM'|'LOW'}
 */
export function confidenceFromSimilarity(topSimilarity) {
  if (topSimilarity > 0.8) return 'HIGH';
  if (topSimilarity >= 0.6) return 'MEDIUM';
  return 'LOW';
}
