import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/profile", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Bitte geben Sie E-Mail-Adresse und Passwort ein.");
      return;
    }

    setLoading(true);

    try {
      await signIn(email.trim(), password);
      navigate("/profile", { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Die Anmeldung konnte nicht abgeschlossen werden."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Link>
          <img src="images/isevents_logo.svg" alt="ISEvents" width="120" />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
        >
          <h1
            className="mb-2 text-slate-900"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              fontWeight: 700,
            }}
          >
            Anbieter Login
          </h1>
          <p className="mb-8 text-sm text-slate-500">
            Melden Sie sich an, um Kontaktdaten und Angebote zu verwalten.
          </p>

          <div className="space-y-4">
            <label>
              <span className="mb-1.5 block text-xs text-slate-500">E-Mail-Adresse</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-amber-500">
                <Mail className="h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  autoComplete="email"
                />
              </div>
            </label>

            <label>
              <span className="mb-1.5 block text-xs text-slate-500">Passwort</span>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-amber-500">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  autoComplete="current-password"
                />
              </div>
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || authLoading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-70"
          >
            {(loading || authLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
            Einloggen
          </button>
        </form>
      </main>
    </div>
  );
}
