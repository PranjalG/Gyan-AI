/** Shared hero / use-case copy for judges — healthcare + India-specific */
export default function UseCaseBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-google-blue/10 via-google-red/5 to-google-green/10 border border-google-blue/30">
        <p className="text-xs font-semibold text-google-blue uppercase tracking-wide mb-1">
          Use case · Public health · India
        </p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Hospital admin uploads government health schemes — staff ask{' '}
          <span className="text-white font-medium">
            &quot;Is this patient eligible for Ayushman Bharat?&quot;
          </span>{' '}
          and get cited answers in seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-google-green/10 border border-google-green/30 text-google-green text-xs font-semibold mb-4">
        🇮🇳 Societal impact · Healthcare access
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-100 leading-snug">
        Government health schemes, instantly searchable
      </h3>
      <p className="text-sm sm:text-base text-gray-400 mt-4 leading-relaxed">
        <span className="text-gray-300 font-medium">Use case:</span> A hospital admin uploads 500 pages
        of government health schemes. Any staff member can now instantly ask{' '}
        <span className="text-google-blue font-medium">
          &quot;Is this patient eligible for Ayushman Bharat?&quot;
        </span>{' '}
        and get a cited, accurate answer in seconds.
      </p>
      <p className="text-xs text-gray-500 mt-4">
        Demo: Ingest tab → paste schemes → ask: &quot;Is a BPL family covered for cancer surgery?&quot;
      </p>
    </div>
  );
}

export const DEMO_QUESTION = 'Is a BPL family covered for cancer surgery?';
