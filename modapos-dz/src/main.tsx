import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/modules/auth/AuthContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
