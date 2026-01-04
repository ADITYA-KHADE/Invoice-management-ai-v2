import { useState, useEffect } from "react";
import StatCard from "./components/StatCard";
import RecentActivity from "./components/RecentActivity";
import { fetchInvoices, extractBuyersFromInvoices } from "../services/api";

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const invoiceData = await fetchInvoices();
      setInvoices(invoiceData);
      const buyerData = extractBuyersFromInvoices(invoiceData);
      setBuyers(buyerData);
      setLoading(false);
    }
    loadData();
  }, []);

  const totalInvoices = invoices.length;
  const totalBuyers = buyers.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  const pdfsWithPreview = invoices.filter((i) => i.source).length;

  if (loading) {
    return (
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 text-sm text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Dashboard</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Invoices"
          value={totalInvoices}
          accent="emerald"
        />
        <StatCard label="Total Buyers" value={totalBuyers} accent="sky" />
        <StatCard
          label="Total Amount"
          value={totalAmount.toLocaleString()}
          accent="violet"
        />
        <StatCard
          label="PDFs with Preview"
          value={pdfsWithPreview}
          accent="amber"
        />
      </div>
      <RecentActivity invoices={invoices.slice(0, 5)} />
    </section>
  );
}
