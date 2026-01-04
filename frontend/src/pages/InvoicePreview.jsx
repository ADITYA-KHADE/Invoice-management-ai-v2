import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchInvoiceById } from "../services/api";
import Chatbot from "../components/Chatbot";

export default function InvoicePreview() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("invoice_id") || searchParams.get("id");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInvoice() {
      if (!invoiceId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await fetchInvoiceById(invoiceId);
      setInvoice(data);
      setLoading(false);
    }
    loadInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Invoice Preview</h2>
        <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 text-sm text-slate-400">Loading invoice...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!invoice) {
    return (
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Invoice Preview</h2>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-6 text-slate-200">
          {invoiceId
            ? `No invoice found for id: ${invoiceId}`
            : "Missing invoice_id query parameter."}
        </div>
      </section>
    );
  }

  const hasPreview = Boolean(invoice.source);
  const buyerName = invoice.buyer?.name || "N/A";
  const sellerName = invoice.seller?.name || "N/A";
  const lineItems = invoice.line_items || [];

  // Extract structured invoice data if available
  const structuredData = invoice.metadata?.structured_invoice?.data || {};
  const invoiceNumber = structuredData.invoice_number || "N/A";
  const invoiceDate = structuredData.invoice_date || "N/A";
  const placeOfSupply = structuredData.place_of_supply || "N/A";
  const taxes = structuredData.taxes || [];
  const totalTax = structuredData.total_tax || 0;
  const paymentMethod = structuredData.payment_method || "N/A";
  const bankDetails = structuredData.bank_details || null;
  const notes = structuredData.notes || null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Invoice Preview
          </p>
          <h2 className="text-2xl font-semibold text-white">{invoiceNumber}</h2>
          <p className="text-sm text-slate-400">{buyerName}</p>
        </div>
        {hasPreview && (
          <a
            href={invoice.source}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 ring-1 ring-white/20 transition hover:bg-white/20"
          >
            Open PDF in New Tab
          </a>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
          {hasPreview ? (
            <iframe
              title="Invoice PDF Preview"
              src={invoice.source}
              className="h-[720px] w-full border-0"
            />
          ) : (
            <div className="flex h-[240px] flex-col items-center justify-center space-y-2 text-slate-300">
              <span className="text-lg font-semibold">
                No preview available
              </span>
              <span className="text-sm text-slate-400">
                Upload a PDF to enable preview.
              </span>
            </div>
          )}
        </div>

        <div
          className="space-y-3 overflow-y-auto"
          style={{ maxHeight: "720px" }}
        >
          {/* Basic Info */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm text-slate-200">
              <InfoRow label="Invoice Number" value={invoiceNumber} />
              <InfoRow label="Invoice Date" value={invoiceDate} />
              <InfoRow label="Status" value={invoice.status || "N/A"} />
              <InfoRow label="Place of Supply" value={placeOfSupply} />
              <InfoRow label="Payment Method" value={paymentMethod} />
              <InfoRow
                label="File Type"
                value={invoice.file_type?.toUpperCase() || "N/A"}
              />
            </div>
          </div>

          {/* Buyer & Seller Info */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Buyer Details
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="font-semibold text-white">
                  {invoice.buyer?.name || "N/A"}
                </p>
                {invoice.buyer?.tax_id && (
                  <p className="text-xs text-slate-400">
                    GSTIN: {invoice.buyer.tax_id}
                  </p>
                )}
                {invoice.buyer?.phone && (
                  <p className="text-xs text-slate-400">
                    Phone: {invoice.buyer.phone}
                  </p>
                )}
                {invoice.buyer?.email && (
                  <p className="text-xs text-slate-400">
                    Email: {invoice.buyer.email}
                  </p>
                )}
                {invoice.buyer?.address && (
                  <p className="mt-1 text-xs text-slate-400">
                    {invoice.buyer.address}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Seller Details
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                <p className="font-semibold text-white">
                  {invoice.seller?.name || "N/A"}
                </p>
                {invoice.seller?.tax_id && (
                  <p className="text-xs text-slate-400">
                    GSTIN: {invoice.seller.tax_id}
                  </p>
                )}
                {invoice.seller?.phone && (
                  <p className="text-xs text-slate-400">
                    Phone: {invoice.seller.phone}
                  </p>
                )}
                {invoice.seller?.email && (
                  <p className="text-xs text-slate-400">
                    Email: {invoice.seller.email}
                  </p>
                )}
                {invoice.seller?.address && (
                  <p className="mt-1 text-xs text-slate-400">
                    {invoice.seller.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Line Items */}
          {lineItems.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Line Items
              </p>
              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="rounded-lg bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-white">
                          {item.description || item.item_name || "Item"}
                        </p>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-400">
                          <span>Qty: {item.quantity || 0}</span>
                          <span>Rate: {item.unit_price || 0}</span>
                          <span>
                            Taxable:{" "}
                            {item.taxable_amount?.toLocaleString() || 0}
                          </span>
                          <span>
                            Tax ({item.tax_rate}%):{" "}
                            {item.tax_amount?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-emerald-200">
                        ₹
                        {(
                          item.total_amount ||
                          item.total ||
                          0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tax Breakdown */}
          {taxes.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Tax Breakdown
              </p>
              <div className="space-y-2">
                {taxes.map((tax, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-300">
                      {tax.tax_type} ({tax.tax_rate}%)
                    </span>
                    <span className="font-semibold text-emerald-200">
                      ₹{tax.tax_amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                  <span className="font-semibold text-white">Total Tax</span>
                  <span className="font-bold text-emerald-300">
                    ₹{totalTax.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Amount Summary */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Amount Summary
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Total Amount</span>
                <span className="font-semibold text-white">
                  ₹{invoice.amount?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Amount Due</span>
                <span className="font-bold text-emerald-300">
                  ₹{invoice.amount_due?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {bankDetails && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Bank Details
              </p>
              <div className="space-y-2 text-sm text-slate-200">
                {bankDetails.account_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-semibold">
                      {bankDetails.account_name}
                    </span>
                  </div>
                )}
                {bankDetails.account_number && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Number:</span>
                    <span className="font-mono font-semibold">
                      {bankDetails.account_number}
                    </span>
                  </div>
                )}
                {bankDetails.ifsc && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">IFSC Code:</span>
                    <span className="font-mono font-semibold">
                      {bankDetails.ifsc}
                    </span>
                  </div>
                )}
                {bankDetails.bank_name && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank Name:</span>
                    <span className="font-semibold">
                      {bankDetails.bank_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes/Terms */}
          {notes && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Terms & Conditions
              </p>
              <p className="text-xs leading-relaxed text-slate-300">{notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Chatbot for this invoice */}
      {invoiceId && <Chatbot invoiceId={invoiceId} />}
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="space-y-1 rounded-xl bg-white/5 p-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
