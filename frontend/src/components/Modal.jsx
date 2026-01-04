export default function Modal({ title, message, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl">
        <button
          className="absolute right-3 top-3 text-slate-400 hover:text-white"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>
        {title && (
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            {title}
          </p>
        )}
        <h3 className="text-lg font-semibold text-white">{message}</h3>
        <button
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
