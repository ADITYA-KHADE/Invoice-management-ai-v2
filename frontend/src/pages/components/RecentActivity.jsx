export default function RecentActivity({ invoices }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
      {invoices.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No recent activity</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {invoices.map((inv) => (
            <li
              key={inv.id || inv.invoice_id}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <span className="font-mono text-emerald-100">
                {inv.invoice_id?.substring(0, 12)}...
              </span>
              <span className="text-xs text-slate-400">
                {inv.created_at
                  ? new Date(inv.created_at).toLocaleDateString()
                  : "N/A"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
