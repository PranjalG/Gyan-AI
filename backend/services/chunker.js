/**
 * Word-based text chunker approximating 500-token chunks with 50-token overlap.
 * ~1.3 words per token for English prose.
 */
const WORDS_PER_TOKEN = 1.3;
const CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 50;

const CHUNK_WORDS = Math.floor(CHUNK_TOKENS * WORDS_PER_TOKEN);
const OVERLAP_WORDS = Math.floor(OVERLAP_TOKENS * WORDS_PER_TOKEN);

/**
 * Split text into overlapping word chunks.
 * @param {string} text
 * @returns {string[]}
 */
export function chunkText(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const words = normalized.split(/\s+/);
  if (words.length <= CHUNK_WORDS) {
    return [normalized];
  }

  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + CHUNK_WORDS, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start += CHUNK_WORDS - OVERLAP_WORDS;
    if (start <= 0) start = CHUNK_WORDS - OVERLAP_WORDS;
  }

  return chunks;
}
