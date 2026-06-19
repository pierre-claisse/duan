// Non-blocking sign-in modal for the professor. Opened from the NavBar; the
// public pages stay usable without it. One password field.
import { useCallback, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "./AuthProvider";

export function LoginScreen({ onClose }: { onClose: () => void }) {
  const { signIn } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password || inFlight) return;
      setInFlight(true);
      setError(null);
      try {
        const ok = await signIn(password);
        if (ok) onClose();
        else setError("Mot de passe incorrect.");
      } catch (err) {
        setError(
          err instanceof Error
            ? `Échec du chargement des identifiants : ${err.message}`
            : "Échec du chargement des identifiants.",
        );
      } finally {
        setInFlight(false);
      }
    },
    [password, inFlight, signIn, onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-xl border border-content/20 bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-content/10 px-5 py-4">
          <h2 id="login-title" className="text-lg font-semibold text-content">
            Connexion prof
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-content/40 hover:bg-content/5 hover:text-content"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">
          <label className="block">
            <span className="mb-1 block text-xs text-content/50">Mot de passe</span>
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              className="w-full rounded-lg border border-content/20 bg-content/5 px-3 py-2 text-sm text-content placeholder:text-content/30 focus:outline-none focus:ring-2 focus:ring-accent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-content/10 px-5 py-3">
          <button
            type="submit"
            disabled={!password || inFlight}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {inFlight ? "Connexion…" : "Se connecter"}
          </button>
        </div>
      </form>
    </div>
  );
}
