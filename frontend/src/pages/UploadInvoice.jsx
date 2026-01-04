import { useState } from "react";
import Modal from "../components/Modal";
import { uploadFile } from "../services/api";

export default function UploadInvoice() {
  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const result = await uploadFile(file);
      setUploadResult(result);
      setShowModal(true);
    } catch (err) {
      setError(err.message || "Upload failed");
      setShowModal(true);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFile(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Upload Invoice</h2>
        <p className="text-sm text-slate-400">
          Accepts PDF, PNG, JPG, JPEG, XLSX, DOCX only
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer flex-col gap-3 rounded-2xl border border-dashed border-emerald-400/50 bg-white/5 p-6 text-center transition hover:border-emerald-300 hover:bg-emerald-400/5">
          <span className="text-sm font-semibold text-white">
            Drop an Invoice here or click to browse
          </span>
          <span className="text-xs text-slate-400">Maximum size 10 MB</span>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={uploading}
          />
          {file && (
            <span className="mt-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/50">
              {file.name}
            </span>
          )}
        </label>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!file || uploading}
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-950 border-t-transparent"></div>
              Uploading...
            </>
          ) : (
            "Upload Invoice"
          )}
        </button>
      </form>

      {showModal && (
        <Modal
          title={error ? "Upload Failed" : "Upload Complete"}
          message={
            error
              ? error
              : uploadResult
              ? `${
                  file?.name || "Invoice"
                } uploaded successfully! You can now view it in Uploaded Files.`
              : "Invoice uploaded successfully."
          }
          onClose={handleCloseModal}
        />
      )}
    </section>
  );
}
