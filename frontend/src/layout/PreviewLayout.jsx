import { Outlet } from "react-router-dom";
import Header from "../components/Header";

export default function PreviewLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />
      <div className="mx-auto max-w-8xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}
