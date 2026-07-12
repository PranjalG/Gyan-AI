export default function SourcesSidebar({ documents, loading, onDelete, onRefresh }) {
  return (
    <aside className="w-full lg:w-72 shrink-0 bg-gray-900 border border-gray-800 rounded-xl flex flex-col max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-10rem)]">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200">Sources Explorer</h3>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs text-google-blue hover:text-blue-300 transition"
        >
          Refresh
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </>
        ) : documents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8 px-2">
            No health schemes ingested yet. Use the Ingest tab.
          </p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="p-3 rounded-lg bg-gray-950 border border-gray-800 hover:border-gray-700 transition group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate" title={doc.name}>
                    📄 {doc.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {doc.chunkCount} chunk{doc.chunkCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded border border-red-900/50 hover:border-red-700 transition"
                  title="Delete document"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
