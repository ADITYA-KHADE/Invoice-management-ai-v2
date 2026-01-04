import { useState, useEffect } from "react";
import { fetchInvoices } from "../services/api";

export default function UploadedFiles() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoices() {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
      setLoading(false);
    }
    loadInvoices();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Uploaded Files</h2>
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 text-sm text-slate-400">Loading invoices...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Uploaded Files</h2>
      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-12 text-center">
          <p className="text-slate-400">No invoices uploaded yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          <table className="w-full text-left text-sm text-slate-200">
            <thead className="bg-white/5 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3">Invoice ID</th>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-semibold text-white">
                    {inv.invoice_id?.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {inv.buyer?.name || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {inv.created_at
                      ? new Date(inv.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-slate-200">
                    {inv.amount
                      ? `${inv.amount.toLocaleString()} ${inv.currency || ""}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.source ? (
                      <a
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950 shadow shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
                        href={`/invoice-preview?invoice_id=${encodeURIComponent(
                          inv.invoice_id
                        )}`}
                        rel="noreferrer"
                      >
                        Preview
                      </a>
                    ) : (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-400">
                        No preview
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
