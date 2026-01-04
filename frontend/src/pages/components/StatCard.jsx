const colors = {
  emerald:
    "from-emerald-500/20 to-emerald-400/10 text-emerald-50 ring-emerald-400/40",
  sky: "from-sky-500/20 to-sky-400/10 text-sky-50 ring-sky-400/40",
  violet:
    "from-violet-500/20 to-violet-400/10 text-violet-50 ring-violet-400/40",
  amber: "from-amber-500/20 to-amber-400/10 text-amber-50 ring-amber-400/40",
};

export default function StatCard({ label, value, accent }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${colors[accent]} px-4 py-4 shadow-lg shadow-black/20 ring-1`}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-white/70">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}
