export const invoices = [
  {
    id: "d4b32f37-e20e-432a-86a8-ca6c318992a7",
    invoiceNumber: "INV-148CZS",
    invoiceDate: "2024-11-12",
    dueDate: "2024-12-12",
    buyerName: "NextSpeed Technologies Pvt Ltd",
    sellerName: "EInvoices",
    fileName: "tax-invoice.pdf",
    uploadDate: "2026-01-03",
    previewUrl:
      "https://storage.googleapis.com/bitcode-dev.appspot.com/uploads/d4b32f37-e20e-432a-86a8-ca6c318992a7.pdf",
    lineItems: [
      {
        description: "GEMS CHOCOLATE POUCH",
        quantity: 1000,
        unitPrice: 4.7619,
        taxRate: 5,
        total: 5000,
      },
      {
        description: "TREAT BKS CASE 80PKT",
        quantity: 50,
        unitPrice: 535.7143,
        taxRate: 12,
        total: 30000,
      },
    ],
    taxes: [
      { type: "CGST", rate: 2.5, amount: 940.48 },
      { type: "SGST", rate: 2.5, amount: 940.48 },
    ],
    totalAmount: 205481,
    currency: "INR",
  },
  {
    id: "INV-2042",
    invoiceNumber: "INV-2042",
    invoiceDate: "2024-12-01",
    dueDate: "2024-12-20",
    buyerName: "Acme Corp",
    sellerName: "Northwind Supplies",
    fileName: "acme-dec.pdf",
    uploadDate: "2026-01-02",
    previewUrl: "",
    lineItems: [
      {
        description: "Consulting",
        quantity: 1,
        unitPrice: 3200,
        taxRate: 0,
        total: 3200,
      },
    ],
    taxes: [],
    totalAmount: 3200,
    currency: "USD",
  },
];

export const buyers = [
  {
    name: "NextSpeed Technologies Pvt Ltd",
    email: "billing@nextspeed.com",
    phone: "+91 9999999994",
  },
  { name: "Acme Corp", email: "ap@acme.com", phone: "+1 415-555-8123" },
  {
    name: "Northwind Traders",
    email: "billing@northwind.com",
    phone: "+1 206-555-1444",
  },
];

export function findInvoiceById(id) {
  return invoices.find((inv) => inv.id === id);
}
