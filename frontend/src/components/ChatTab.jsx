import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api.js';
import { showToast } from './Toast.jsx';
import SourcesSidebar from './SourcesSidebar.jsx';
import UseCaseBanner, { DEMO_QUESTION } from './UseCaseBanner.jsx';

function ConfidencePill({ level }) {
  const styles = {
    HIGH: 'bg-green-900/40 text-green-400 border-green-700',
    MEDIUM: 'bg-yellow-900/40 text-yellow-400 border-yellow-700',
    LOW: 'bg-red-900/40 text-red-400 border-red-700',
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${styles[level] || styles.LOW}`}
    >
      {level} confidence
    </span>
  );
}

function MicIcon({ listening }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`w-5 h-5 ${listening ? 'animate-pulse' : ''}`}
      aria-hidden
    >
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-2.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function SourceBadges({ sources }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {sources.map((s, i) => (
        <button
          key={s.chunkId || i}
          type="button"
          title={s.content}
          className="text-xs px-2.5 py-1 rounded-full bg-google-blue/10 text-google-blue border border-google-blue/30 hover:bg-google-blue/20 transition truncate max-w-[200px]"
        >
          {s.documentName} · {(s.similarity * 100).toFixed(0)}%
        </button>
      ))}
    </div>
  );
}

export default function ChatTab({ documents, onDocumentsChange }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: q }]);
    setLoading(true);

    try {
      const res = await api.chat(q);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          confidence: res.confidence,
        },
      ]);
    } catch (err) {
      showToast(err.message, 'error');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}`, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice not supported — use Chrome or Edge', 'error');
      return;
    }

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setListening(true);
      showToast('🎤 Listening… speak your question');
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      setListening(false);
      if (e.error !== 'aborted') {
        showToast('Voice input failed — try again', 'error');
      }
    };
    recognition.onresult = (e) => {
      let transcript = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      setInput(transcript.trim());
      if (e.results[e.results.length - 1]?.isFinal) {
        showToast('Voice captured — tap Send to ask');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
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

  const hasDocs = documents.length > 0;

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-11rem)]">
      <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-xl overflow-hidden min-h-[400px]">
        {hasDocs && messages.length === 0 && (
          <div className="p-3 border-b border-gray-800">
            <UseCaseBanner compact />
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hasDocs && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[320px] py-8 px-4">
              <div className="text-5xl mb-6">🏥</div>
              <UseCaseBanner />
              <p className="text-sm text-gray-500 mt-8">
                Go to the <strong className="text-gray-300">Ingest</strong> tab — sample health
                schemes are pre-loaded. Click Ingest, then return here and use{' '}
                <strong className="text-google-blue">Voice</strong> or type your question.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-google-blue text-white rounded-br-md'
                    : msg.error
                      ? 'bg-red-950 border border-red-800 text-red-200 rounded-bl-md'
                      : 'bg-gray-950 border border-gray-800 text-gray-200 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && !msg.error && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500">🤖 Scheme Assistant</span>
                    {msg.confidence && <ConfidencePill level={msg.confidence} />}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.sources && <SourceBadges sources={msg.sources} />}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-950 border border-gray-800 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-google-blue rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-google-blue rounded-full animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 bg-google-blue rounded-full animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="p-4 border-t border-gray-800 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          {listening && (
            <p className="text-xs text-red-400 font-medium flex items-center gap-2 animate-pulse">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              Listening… say e.g. &quot;Is a BPL family covered for cancer surgery?&quot;
            </p>
          )}
          <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              listening
                ? 'Speak now…'
                : hasDocs
                  ? 'Type or tap 🎤 — e.g. Is a BPL family covered for cancer surgery?'
                  : 'Ingest health schemes first (Ingest tab)…'
            }
            disabled={!hasDocs || loading}
            className={`flex-1 bg-gray-950 border rounded-xl px-4 py-3 text-sm focus:outline-none disabled:opacity-50 transition ${
              listening
                ? 'border-red-500 ring-2 ring-red-500/30'
                : 'border-gray-700 focus:border-google-blue'
            }`}
          />
          <button
            type="button"
            onClick={startVoice}
            disabled={!hasDocs || loading}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            className={`relative shrink-0 px-4 py-3 rounded-xl border-2 font-medium text-sm transition ${
              listening
                ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/40 scale-105 animate-pulse'
                : 'bg-gray-950 border-google-blue/60 text-google-blue hover:bg-google-blue/10 hover:border-google-blue'
            } disabled:opacity-50`}
            title={listening ? 'Stop listening' : 'Ask by voice (Web Speech API)'}
          >
            <span className="flex items-center gap-1.5">
              <MicIcon listening={listening} />
              <span className="hidden sm:inline">{listening ? 'Stop' : 'Voice'}</span>
            </span>
          </button>
          {hasDocs && (
            <button
              type="button"
              onClick={() => {
                setInput(DEMO_QUESTION);
              }}
              disabled={loading}
              className="hidden sm:block px-3 py-3 rounded-xl border border-google-green/40 text-google-green text-xs font-medium hover:bg-google-green/10 transition whitespace-nowrap"
              title="Fill demo question for judges"
            >
              Demo Q
            </button>
          )}
          <button
            type="submit"
            disabled={!hasDocs || loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-google-blue hover:bg-blue-600 text-white font-medium text-sm disabled:opacity-50 transition shrink-0"
          >
            Send
          </button>
          </div>
        </form>
      </div>

      <SourcesSidebar
        documents={documents}
        loading={false}
        onDelete={handleDelete}
        onRefresh={onDocumentsChange}
      />
    </div>
  );
}
