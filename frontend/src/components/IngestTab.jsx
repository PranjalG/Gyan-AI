import { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { showToast } from './Toast.jsx';

const SAMPLE_HEALTH_SCHEMES = `India Government Health Schemes — Reference for Hospital Staff

Ayushman Bharat PM-JAY covers all secondary and tertiary care hospitalisation. Families below poverty line are automatically eligible. Coverage is up to Rs 5 lakh per family per year. Pre-existing conditions are covered from day one. The scheme covers 1,929 medical procedures.

Pradhan Mantri Matru Vandana Yojana provides Rs 5,000 to pregnant women for first live birth. Janani Suraksha Yojana provides cash assistance for institutional delivery.

CGHS covers central government employees and pensioners in 79 cities across India.`;

const STEPS = ['Chunking', 'Embedding', 'Storing'];

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(' ') + '\n';
  }
  return text.trim();
}

export default function IngestTab({ documents, onDocumentsChange }) {
  const [mode, setMode] = useState('paste');
  const [docName, setDocName] = useState('India Govt Health Schemes');
  const [text, setText] = useState(SAMPLE_HEALTH_SCHEMES);
  const [ingesting, setIngesting] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    onDocumentsChange();
  }, []);

  const runIngest = async (content, filename) => {
    if (!content?.trim()) {
      showToast('No text to ingest', 'error');
      return;
    }

    setIngesting(true);
    setSuccess(null);
    setStepIndex(0);

    const start = Date.now();
    const stepTimer = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const result = await api.ingest(content, filename);
      clearInterval(stepTimer);
      setStepIndex(STEPS.length);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      setSuccess({
        name: filename,
        chunkCount: result.chunkCount,
        elapsed,
      });
      showToast(`Ingested ${result.chunkCount} chunks successfully`);
      onDocumentsChange();
      setText('');
    } catch (err) {
      clearInterval(stepTimer);
      showToast(err.message, 'error');
      setStepIndex(-1);
    } finally {
      setIngesting(false);
    }
  };

  const handlePasteIngest = () => runIngest(text, docName || 'Pasted Document');

  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const extracted = await extractPdfText(file);
      if (!extracted) {
        showToast('Could not extract text from PDF', 'error');
        return;
      }
      await runIngest(extracted, file.name.replace(/\.pdf$/i, ''));
    } catch (err) {
      showToast(err.message || 'PDF parse failed', 'error');
    }
    e.target.value = '';
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteDocument(id);
      showToast('Document deleted');
      onDocumentsChange();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 tab-enter max-w-4xl mx-auto">
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
        <p className="text-xs font-semibold text-google-green uppercase tracking-wide mb-2">
          Demo document · Pre-loaded for judges
        </p>
        <p className="text-sm text-gray-400">
          Ayushman Bharat, PM-JAY, Matru Vandana & CGHS — click Ingest, then ask in Chat:{' '}
          <span className="text-gray-200">&quot;Is a BPL family covered for cancer surgery?&quot;</span>
        </p>
      </div>

      <div className="flex gap-2 p-1 bg-gray-900 border border-gray-800 rounded-xl w-fit">
        {['paste', 'pdf'].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              mode === m
                ? 'bg-google-blue text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {m === 'paste' ? 'Paste Text' : 'Upload PDF'}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        {mode === 'paste' ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 block mb-1">Document Name</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-google-blue"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 block mb-1">Document Text</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-google-blue font-mono"
                placeholder="Paste government health scheme documents, PM-JAY circulars, etc…"
              />
            </div>
            <button
              type="button"
              onClick={handlePasteIngest}
              disabled={ingesting}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-google-blue hover:bg-blue-600 text-white font-medium disabled:opacity-50 transition"
            >
              {ingesting ? 'Ingesting…' : 'Ingest Document'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm mb-4">
              PDF is parsed in your browser (pdf.js) — no file upload to server.
            </p>
            <label className="inline-flex flex-col items-center cursor-pointer">
              <span className="px-6 py-4 rounded-xl border-2 border-dashed border-gray-700 hover:border-google-blue transition text-gray-300">
                📎 Choose PDF file
              </span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={ingesting}
              />
            </label>
          </div>
        )}

        {ingesting && (
          <div className="mt-6 space-y-3">
            <div className="flex justify-between text-xs text-gray-500">
              {STEPS.map((s, i) => (
                <span key={s} className={i <= stepIndex ? 'text-google-blue font-medium' : ''}>
                  {i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'} {s}
                </span>
              ))}
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-google-blue to-google-green transition-all duration-500"
                style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {success && (
          <div className="mt-6 p-4 rounded-xl bg-green-950/30 border border-green-800">
            <p className="text-green-400 font-semibold">✓ Ingestion complete</p>
            <p className="text-sm text-gray-300 mt-1">
              <strong>{success.name}</strong> — {success.chunkCount} chunks stored in Supabase pgvector
              ({success.elapsed}s)
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-200 mb-4">Document Library</h3>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">No documents yet.</p>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-950 border border-gray-800"
              >
                <div>
                  <p className="text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.chunkCount} chunks</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc.id)}
                  className="text-xs text-red-400 hover:text-red-300 px-3 py-1 border border-red-900/50 rounded-lg"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
