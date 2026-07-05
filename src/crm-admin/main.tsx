import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./admin.css";

createRoot(document.getElementById("crm-root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
