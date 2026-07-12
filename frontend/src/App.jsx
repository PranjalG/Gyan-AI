import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import ChatTab from './components/ChatTab.jsx';
import IngestTab from './components/IngestTab.jsx';
import ArchitectureTab from './components/ArchitectureTab.jsx';
import { ToastContainer, useToast } from './components/Toast.jsx';
import { api } from './services/api.js';

const TABS = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'ingest', label: 'Ingest', icon: '📥' },
  { id: 'architecture', label: 'Architecture', icon: '⚙️' },
];

export default function App() {
  const [tab, setTab] = useState('chat');
  const [documents, setDocuments] = useState([]);
  const { toasts, dismiss } = useToast();

  const loadDocuments = useCallback(async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch {
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex gap-1 p-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl w-full sm:w-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-google-blue text-white shadow-lg shadow-google-blue/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <span className="mr-1.5">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="tab-enter">
          {tab === 'chat' && (
            <ChatTab documents={documents} onDocumentsChange={loadDocuments} />
          )}
          {tab === 'ingest' && (
            <IngestTab documents={documents} onDocumentsChange={loadDocuments} />
          )}
          {tab === 'architecture' && (
            <ArchitectureTab active={tab === 'architecture'} />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
