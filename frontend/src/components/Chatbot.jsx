import { useState, useEffect } from "react";
import { chatWithInvoice } from "../services/api";

export default function Chatbot({ invoiceId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: invoiceId
        ? `Hello! I'm your AI assistant for invoice ${invoiceId.substring(
            0,
            8
          )}... Ask me anything about this invoice.`
        : "Hello! I'm your AI assistant. Navigate to an invoice to ask questions.",
      sender: "bot",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      setMessages([
        {
          id: 1,
          text: `Hello! I'm your AI assistant for invoice ${invoiceId.substring(
            0,
            8
          )}... Ask me anything about this invoice.`,
          sender: "bot",
        },
      ]);
    }
  }, [invoiceId]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    const query = inputValue;
    setInputValue("");

    if (!invoiceId) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "No invoice ID available. Please navigate to an invoice preview page.",
          sender: "bot",
        },
      ]);
      return;
    }

    // Call the chat API
    setLoading(true);
    try {
      const response = await chatWithInvoice(invoiceId, query);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text:
            response.response ||
            response.answer ||
            "I couldn't find an answer to your question.",
          sender: "bot",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Sorry, I encountered an error processing your request. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[500px] w-[380px] flex-col rounded-2xl border border-slate-700/50 bg-[#0a1628] shadow-2xl">
          {/* Chat Header */}
          <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-700/50 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/30 ring-2 ring-emerald-400/50">
                <svg
                  className="h-6 w-6 text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Assistant</h3>
                <p className="text-xs text-emerald-300">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-700/50 hover:text-white"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-emerald-500/30 to-teal-500/20 text-white ring-1 ring-emerald-400/50"
                      : "bg-slate-800/50 text-slate-200"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-slate-700/50 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this invoice..."
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-2 text-sm text-white placeholder-slate-400 outline-none ring-emerald-400/50 transition focus:ring-2 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-emerald-500/30 to-teal-500/20 p-2 text-emerald-400 ring-1 ring-emerald-400/50 transition hover:from-emerald-500/40 hover:to-teal-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/50 ring-2 ring-emerald-400/50 transition hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/60"
      >
        {isOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
