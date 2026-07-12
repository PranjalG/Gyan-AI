const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  ingest: (text, filename) =>
    request('/ingest', {
      method: 'POST',
      body: JSON.stringify({ text, filename }),
    }),

  chat: (question) =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),

  getDocuments: () => request('/documents'),

  getHistory: () => request('/history'),

  getStats: () => request('/stats'),

  deleteDocument: (id) =>
    request(`/documents/${id}`, { method: 'DELETE' }),

  health: () => request('/health'),
};
