import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/modules/auth/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
          <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={4500}
          toastOptions={{
            style: {
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text-primary)",
              fontSize: "13px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
            },
            classNames: {
              title: "font-semibold",
              description: "text-[var(--color-text-secondary)] !text-xs",
              closeButton:
                "!bg-[var(--color-bg-overlay)] !border-[var(--color-border)] !text-[var(--color-text-muted)] hover:!text-[var(--color-text-primary)]",
            },
          }}
        />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
