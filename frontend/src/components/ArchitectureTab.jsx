import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

const PIPELINE_TOP = [
  { id: 'upload', icon: '📄', label: 'Upload' },
  { id: 'chunker', icon: '✂️', label: 'Chunker' },
  { id: 'embedder', icon: '🔢', label: 'Embedder' },
  { id: 'supabase', icon: '🗄️', label: 'Supabase pgvector' },
];

const PIPELINE_BOTTOM = [
  { id: 'query', icon: '🔍', label: 'Retriever' },
  { id: 'agent', icon: '🤖', label: 'Gemini Agent' },
  { id: 'answer', icon: '💬', label: 'Answer' },
];

const GOOGLE_STACK = [
  {
    name: 'Gemini 1.5 Flash',
    role: 'LLM',
    subtitle: 'Google Generative Language API',
    colors: 'from-google-blue to-google-blue/60',
    border: 'border-google-blue/50',
    icon: '✨',
  },
  {
    name: 'Gemini text-embedding-004',
    role: 'Embeddings',
    subtitle: '768-dim vectors · embedContent API',
    colors: 'from-google-red to-google-yellow',
    border: 'border-google-red/40',
    icon: '🔢',
  },
  {
    name: 'Supabase + pgvector',
    role: 'Vector Database',
    subtitle: 'Persistent 768-dim similarity search',
    colors: 'from-google-green to-google-green/60',
    border: 'border-google-green/50',
    icon: '🗄️',
  },
  {
    name: 'Google Developers Group',
    role: 'Udaipur',
    subtitle: 'Community · Agentic Premier League',
    colors: 'from-google-yellow to-google-red',
    border: 'border-google-yellow/40',
    icon: '🤝',
  },
];

const ROADMAP = [
  {
    phase: 'Phase 1 (Today)',
    title: 'Single hospital, web app',
    items: ['Manual upload of scheme PDFs', 'Cited Q&A for front-desk staff', 'Voice + text queries'],
    status: 'LIVE',
    live: true,
  },
  {
    phase: 'Phase 2 (Month 1)',
    title: 'Multi-tenant scale',
    items: ['Google Drive sync for circulars', 'Slack / Teams bot for nurses', 'District hospital rollout'],
    status: 'Planned',
    live: false,
  },
  {
    phase: 'Phase 3 (Month 6)',
    title: 'Enterprise on Google Cloud',
    items: ['Cloud Run deployment', 'Vertex AI embeddings', 'Enterprise SSO (Google Workspace)'],
    status: 'Planned',
    live: false,
  },
];

const HOW_IT_WORKS = [
  {
    title: '1. Scheme document ingestion',
    body: 'Hospital admin uploads PM-JAY, Ayushman Bharat, and state circulars — chunked with overlap so eligibility rules stay intact.',
  },
  {
    title: '2. Google embedding pipeline',
    body: 'Each chunk is embedded via Gemini Embeddings API (768 dimensions) and stored in Supabase pgvector for instant similarity search.',
  },
  {
    title: '3. Eligibility retrieval',
    body: 'Staff questions like "BPL cancer surgery coverage?" are embedded and matched to the top 3 most relevant scheme passages.',
  },
  {
    title: '4. Grounded answers with citations',
    body: 'Gemini Flash answers only from retrieved context — citing [Source 1] Ayushman Bharat — so front-desk staff never guess eligibility.',
  },
];

function LiveStatsBar({ stats }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 py-4 px-6 rounded-xl bg-gradient-to-r from-google-blue/15 via-gray-900 to-google-green/15 border border-google-blue/40">
      <span className="text-xs font-bold uppercase tracking-widest text-google-blue mr-2">
        Live from database
      </span>
      <span className="text-sm text-gray-200">
        <strong className="text-google-blue text-lg">{stats.totalDocs}</strong> documents indexed
      </span>
      <span className="text-gray-600 hidden sm:inline">|</span>
      <span className="text-sm text-gray-200">
        <strong className="text-google-green text-lg">{stats.totalChunks}</strong> chunks stored
      </span>
      <span className="text-gray-600 hidden sm:inline">|</span>
      <span className="text-sm text-gray-200">
        <strong className="text-google-yellow text-lg">{stats.totalQueries}</strong> queries answered
      </span>
    </div>
  );
}

export default function ArchitectureTab({ active }) {
  const [stats, setStats] = useState({ totalDocs: 0, totalChunks: 0, totalQueries: 0 });
  const [openAccordion, setOpenAccordion] = useState(0);
  const [pulseNode, setPulseNode] = useState('upload');

  const loadStats = () => {
    api.getStats().then(setStats).catch(() => {});
  };

  useEffect(() => {
    if (!active) return;
    loadStats();
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const nodes = [...PIPELINE_TOP, ...PIPELINE_BOTTOM].map((n) => n.id);
    let i = 0;
    const timer = setInterval(() => {
      setPulseNode(nodes[i % nodes.length]);
      i++;
    }, 1200);
    return () => clearInterval(timer);
  }, [active]);

  const Node = ({ node }) => (
    <div
      className={`pipeline-node flex flex-col items-center p-3 rounded-xl border border-gray-700 bg-gray-900 min-w-[90px] sm:min-w-[100px] transition-all ${
        pulseNode === node.id ? 'active' : ''
      }`}
    >
      <span className="text-2xl">{node.icon}</span>
      <span className="text-xs text-gray-400 mt-1 text-center">{node.label}</span>
    </div>
  );

  const Arrow = () => <span className="text-google-blue text-xl hidden sm:inline">→</span>;

  return (
    <div className="space-y-8 tab-enter">
      <LiveStatsBar stats={stats} />

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 overflow-x-auto">
        <h3 className="text-sm font-semibold text-gray-400 mb-6 uppercase tracking-wider">
          Live GyanAI Pipeline · Hospital health schemes
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4">
          {PIPELINE_TOP.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2 sm:gap-3">
              <Node node={node} />
              {i < PIPELINE_TOP.length - 1 && <Arrow />}
            </div>
          ))}
        </div>

        <div className="flex justify-center my-2">
          <span className="text-google-blue text-2xl">↓</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <div className="flex flex-col items-center p-2 rounded-lg border border-dashed border-gray-700 text-xs text-gray-500">
            Query Embedding
          </div>
          <Arrow />
          {PIPELINE_BOTTOM.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2 sm:gap-3">
              <Node node={node} />
              {i < PIPELINE_BOTTOM.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>

      {/* Powered by Google */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <span className="w-3 h-3 rounded-full bg-google-blue" />
            <span className="w-3 h-3 rounded-full bg-google-red" />
            <span className="w-3 h-3 rounded-full bg-google-yellow" />
            <span className="w-3 h-3 rounded-full bg-google-green" />
          </div>
          <h3 className="text-lg font-bold text-gray-100">Powered by Google</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {GOOGLE_STACK.map((card) => (
            <div
              key={card.name}
              className={`relative overflow-hidden rounded-xl border ${card.border} bg-gray-900 p-5 hover:scale-[1.02] transition-transform`}
            >
              <div
                className={`absolute inset-0 opacity-10 bg-gradient-to-br ${card.colors}`}
              />
              <span className="text-2xl">{card.icon}</span>
              <p className="text-base font-bold text-white mt-3">{card.name}</p>
              <p className="text-xs font-semibold text-google-blue mt-1">({card.role})</p>
              <p className="text-xs text-gray-500 mt-2">{card.subtitle}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center">
          Google AI · Supabase · GDG Udaipur — Agentic Premier League
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-200 mb-4">How it works</h3>
        <div className="space-y-2">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.title} className="border border-gray-800 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === i ? -1 : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-gray-950 transition"
              >
                {item.title}
                <span className="text-gray-500">{openAccordion === i ? '−' : '+'}</span>
              </button>
              {openAccordion === i && (
                <p className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">{item.body}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap */}
      <div>
        <h3 className="text-lg font-bold text-gray-100 mb-2">Roadmap</h3>
        <p className="text-sm text-gray-500 mb-4">
          Realistic execution plan beyond the hackathon — scaling public-health access across India.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ROADMAP.map((phase) => (
            <div
              key={phase.phase}
              className={`rounded-xl border p-5 ${
                phase.live
                  ? 'border-google-green/50 bg-google-green/5'
                  : 'border-gray-800 bg-gray-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-google-blue">{phase.phase}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    phase.live
                      ? 'bg-google-green/20 text-google-green border border-google-green/40'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {phase.live ? '✅ LIVE' : phase.status}
                </span>
              </div>
              <h4 className="font-semibold text-gray-200 mb-3">{phase.title}</h4>
              <ul className="space-y-2">
                {phase.items.map((item) => (
                  <li key={item} className="text-sm text-gray-400 flex gap-2">
                    <span className="text-google-blue shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
