import { useState, useEffect } from 'react';

let toastId = 0;
const listeners = new Set();

export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      if (t.dismiss) {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      } else {
        setToasts((prev) => [...prev, t]);
      }
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, dismiss };
}

export function showToast(message, type = 'success') {
  const t = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(t));
  setTimeout(() => {
    listeners.forEach((fn) => fn({ ...t, dismiss: true }));
  }, 3500);
}

export function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="button"
          tabIndex={0}
          onClick={() => dismiss(t.id)}
          onKeyDown={(e) => e.key === 'Enter' && dismiss(t.id)}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium cursor-pointer ${
            t.type === 'error'
              ? 'bg-red-900/90 border border-red-700 text-red-100'
              : 'bg-gray-900 border border-google-blue/50 text-gray-100'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
