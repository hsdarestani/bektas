import { lazy, Suspense } from "react";
import HomePage from "./pages/HomePage";

const ExperiencePage = lazy(() => import("./pages/ExperiencePage"));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path !== "/experience") return <HomePage />;
  return <Suspense fallback={<div className="route-loader"><span>BEKTAS</span><i /></div>}><ExperiencePage /></Suspense>;
}
