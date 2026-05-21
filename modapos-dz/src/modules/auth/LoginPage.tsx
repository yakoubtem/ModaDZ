import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Store } from "lucide-react";
import { useIPC } from "@/hooks/useIPC";
import { useAuth } from "./AuthContext";
import type { User } from "@/types";
import { toast } from "sonner";

const PIN_LENGTH = 4;

export function LoginPage() {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const api = useIPC();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDigit = (digit: string) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === PIN_LENGTH) handleSubmit(next);
  };

  const handleSubmit = async (pinValue: string) => {
    setIsLoading(true);
    try {
      const user = await api<User | null>("users:verifyPin", pinValue);
      if (user) {
        login(user);
        navigate("/dashboard", { replace: true });
      } else {
        toast.error("Code PIN incorrect");
        setPin("");
      }
    } catch {
      toast.error("Erreur de connexion");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[var(--color-bg-base)] animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-10">
        <div className="w-16 h-16 rounded-[var(--radius-xl)] bg-[var(--color-accent)] flex items-center justify-center shadow-[var(--shadow-glow)]">
          <Store className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">ModaDZ</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Entrez votre code PIN pour continuer
          </p>
        </div>
      </div>

      {/* PIN dots */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? "bg-[var(--color-accent)] border-[var(--color-accent)] scale-110"
                : "bg-transparent border-[var(--color-border-strong)]"
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-[260px]">
        {digits.map((d, i) =>
          d === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => {
                if (d === "⌫") setPin((p) => p.slice(0, -1));
                else handleDigit(d);
              }}
              disabled={isLoading}
              className={`h-14 rounded-[var(--radius-lg)] text-xl font-medium transition-all duration-100 active:scale-95 select-none
                ${d === "⌫"
                  ? "text-[var(--color-text-muted)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-overlay)] hover:text-[var(--color-danger)]"
                  : "text-[var(--color-text-primary)] bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] hover:border-[var(--color-border-strong)]"
                }`}
            >
              {d}
            </button>
          )
        )}
      </div>

      {/* Lock icon */}
      <div className="flex items-center gap-1.5 mt-10 text-[var(--color-text-muted)] text-xs">
        <Lock className="w-3 h-3" />
        <span>Session sécurisée locale</span>
      </div>
    </div>
  );
}
