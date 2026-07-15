import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import LandingPage from "@/components/LandingPage";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element "#root" not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
