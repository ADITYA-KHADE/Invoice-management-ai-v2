export const API_BASE =
  import.meta.env.VITE_AGENT_API_BASE || "http://localhost:8000";

/**
 * Fetch all invoices from the API
 */
export async function fetchInvoices() {
  try {
    const response = await fetch(`${API_BASE}/api/invoices`);
    if (!response.ok) {
      throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

/**
 * Fetch a single invoice by ID
 */
export async function fetchInvoiceById(invoiceId) {
  try {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch invoice: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return null;
  }
}

/**
 * Upload a file (PDF, image, or Office document)
 */
export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Upload failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

/**
 * Chat with AI about a specific invoice
 */
export async function chatWithInvoice(invoiceId, query) {
  try {
    const response = await fetch(`${API_BASE}/api/chat/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_id: invoiceId,
        input_query: query,
        k: 4,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
}

/**
 * Extract unique buyers from invoices
 */
export function extractBuyersFromInvoices(invoices) {
  const buyersMap = new Map();

  invoices.forEach((invoice) => {
    const buyer = invoice.buyer;
    if (buyer && buyer.name) {
      const key = buyer.name.toLowerCase();
      if (!buyersMap.has(key)) {
        buyersMap.set(key, {
          name: buyer.name,
          email: buyer.email || "N/A",
          phone: buyer.phone || "N/A",
          address: buyer.address || "",
        });
      }
    }
  });

  return Array.from(buyersMap.values());
}
