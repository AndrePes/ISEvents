import { FormEvent, useState } from "react";
import { CheckCircle2, Loader2, Mail, Phone, User, X } from "lucide-react";
import { useAuth } from "../lib/auth";

interface ProviderRegistrationModalProps {
  onClose: () => void;
}

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  street: "",
  city: "",
  cityCode: "",
};

export function ProviderRegistrationModal({ onClose }: ProviderRegistrationModalProps) {
  const { signUpProvider } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.password || !form.phone.trim()) {
      setError("Bitte füllen Sie Name, E-Mail, Passwort und Telefonnummer aus.");
      return;
    }

    if (form.password.length < 8) {
      setError("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUpProvider(form.email.trim(), form.password, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        street: form.street.trim(),
        city: form.city.trim(),
        cityCode: form.cityCode.trim(),
      });

      setSuccessMessage(
        result.needsEmailConfirmation
          ? "Registrierung erfolgreich. Bitte bestätigen Sie Ihre E-Mail-Adresse."
          : "Registrierung erfolgreich. Sie sind jetzt angemeldet."
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Die Registrierung konnte nicht abgeschlossen werden."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
      <button
        type="button"
        aria-label="Registrierung schließen"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              className="text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Anbieter werden
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Erstellen Sie Ihren Zugang und verwalten Sie Ihre Angebote.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        {successMessage ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="max-w-sm text-sm text-slate-600">{successMessage}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-1.5 block text-xs text-slate-500">Name des Anbieters</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-amber-500">
                  <User className="h-4 w-4 text-slate-400" />
                  <input
                    value={form.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    placeholder="ISEvents Catering"
                  />
                </div>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">E-Mail</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-amber-500">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    placeholder="kontakt@anbieter.de"
                  />
                </div>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">Passwort</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                  placeholder="Mindestens 8 Zeichen"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">Telefon</span>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-amber-500">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <input
                    value={form.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    placeholder="+49 ..."
                  />
                </div>
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">Straße</span>
                <input
                  value={form.street}
                  onChange={(event) => handleChange("street", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">PLZ</span>
                <input
                  value={form.cityCode}
                  onChange={(event) => handleChange("cityCode", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs text-slate-500">Ort</span>
                <input
                  value={form.city}
                  onChange={(event) => handleChange("city", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                />
              </label>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrieren
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
