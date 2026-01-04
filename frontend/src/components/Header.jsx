export default function Header({ onToggleSidebar, isSidebarOpen }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-slate-800/50 bg-[#0a1628]/95 px-6 py-4 backdrop-blur transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg bg-slate-800/50 p-2 ring-1 ring-slate-700/50 transition hover:bg-slate-700/50"
            aria-label="Toggle navigation menu"
          >
            <svg
              className="h-5 w-5 text-slate-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">
              Invoice Management AI
            </p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              Control Center
            </h1>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-100 ring-1 ring-emerald-400/40">
            Live
          </span>
        </div>
      </div>
    </header>
  );
}
