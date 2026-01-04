import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import PreviewLayout from "../layout/PreviewLayout";
import Dashboard from "../pages/Dashboard";
import UploadInvoice from "../pages/UploadInvoice";
import UploadedFiles from "../pages/UploadedFiles";
import BuyersList from "../pages/BuyersList";
import InvoicePreview from "../pages/InvoicePreview";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="/upload" element={<UploadInvoice />} />
          <Route path="/uploaded-files" element={<UploadedFiles />} />
          <Route path="/buyers" element={<BuyersList />} />
        </Route>
        <Route path="/invoice-preview" element={<PreviewLayout />}>
          <Route index element={<InvoicePreview />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
