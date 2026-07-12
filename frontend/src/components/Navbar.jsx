export default function Navbar() {
  return (
    <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-google-blue via-google-red to-google-green flex items-center justify-center text-lg font-bold shadow-lg">
            G
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              <span className="text-google-blue">G</span>
              <span className="text-google-red">y</span>
              <span className="text-google-yellow">a</span>
              <span className="text-google-green">n</span>
              <span className="text-google-blue">A</span>
              <span className="text-google-red">I</span>
              <span className="text-gray-500 font-normal mx-2 hidden sm:inline">|</span>
              <span className="text-gray-400 text-sm font-medium hidden sm:inline">
                Agentic Premier League - Udaipur
              </span>
            </h1>
            <p className="text-xs text-gray-500 sm:hidden">
              Agentic Premier League - Udaipur
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-google-green/10 text-google-green border border-google-green/30 font-medium">
          🇮🇳 Health Scheme Assistant
        </span>
      </div>
    </header>
  );
}
