import { useState, useEffect } from "react";
import { fetchInvoices, extractBuyersFromInvoices } from "../services/api";

export default function BuyersList() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuyers() {
      setLoading(true);
      const invoices = await fetchInvoices();
      const buyerData = extractBuyersFromInvoices(invoices);
      setBuyers(buyerData);
      setLoading(false);
    }
    loadBuyers();
  }, []);

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Buyers</h2>
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 text-sm text-slate-400">Loading buyers...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Buyers</h2>
      {buyers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-12 text-center">
          <p className="text-slate-400">No buyers found.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {buyers.map((buyer) => (
            <div
              key={buyer.email}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20"
            >
              <p className="text-sm font-semibold text-white">{buyer.name}</p>
              <p className="text-xs text-slate-400">{buyer.email}</p>
              <p className="mt-2 text-xs text-slate-300">{buyer.phone}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
