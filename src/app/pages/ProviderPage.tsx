import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft,
  Edit,
  Loader2,
  LogOut,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Checkbox } from "../components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { EquipmentServiceRow, EVENT_TYPES, ProviderOfferFormValues, ProviderRow } from "../types";
import { useAuth } from "../lib/auth";
import {
  createProviderOffer,
  deleteProviderOffers,
  fetchProviderOffers,
  fetchProviderProfile,
  updateProviderOffer,
  updateProviderProfile,
} from "../lib/providerRepository";

type ProfileForm = Pick<ProviderRow, "name" | "email" | "phone" | "street" | "city" | "cityCode">;

const EMPTY_PROFILE: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  cityCode: "",
};

const EMPTY_OFFER: ProviderOfferFormValues = {
  visible: true,
  name: "",
  category: "Ausstattung",
  subcategory: "",
  description: "",
  price: "",
  priceUnit: "Event",
  imageUrl: "",
  suitableFor: [],
  bookedDates: [],
  highlights: [],
};

function toTextList(values: unknown): string {
  return Array.isArray(values)
    ? values.filter((value): value is string => typeof value === "string").join("\n")
    : "";
}

function fromTextList(value: string): string[] {
  return value
    .split(/\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toOfferForm(offer: EquipmentServiceRow): ProviderOfferFormValues {
  return {
    id: offer.id,
    visible: offer.visible ?? true,
    name: offer.name ?? "",
    category: offer.category === "Dienstleistung" ? "Dienstleistung" : "Ausstattung",
    subcategory: offer.subcategory ?? "",
    description: offer.description ?? "",
    price: offer.price == null ? "" : String(offer.price),
    priceUnit: offer.priceUnit ?? "Event",
    imageUrl: offer.imageUrl ?? "",
    suitableFor: fromTextList(toTextList(offer.suitableFor)),
    bookedDates: fromTextList(toTextList(offer.bookedDates)),
    highlights: fromTextList(toTextList(offer.highlights)),
  };
}

function formatPrice(offer: EquipmentServiceRow): string {
  const amount = Number(offer.price);
  const value = Number.isFinite(amount)
    ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)
    : "0,00 EUR";

  return `${value} / ${offer.priceUnit ?? "Event"}`;
}

function OfferModal({
  offer,
  onClose,
  onSave,
}: {
  offer: ProviderOfferFormValues;
  onClose: () => void;
  onSave: (offer: ProviderOfferFormValues) => Promise<void>;
}) {
  const [form, setForm] = useState(offer);
  const [suitableForText, setSuitableForText] = useState(offer.suitableFor.join("\n"));
  const [bookedDatesText, setBookedDatesText] = useState(offer.bookedDates.join("\n"));
  const [highlightsText, setHighlightsText] = useState(offer.highlights.join("\n"));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim() || !form.subcategory.trim() || !form.price.trim()) {
      setError("Bitte füllen Sie Name, Unterkategorie und Preis aus.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSave({
        ...form,
        suitableFor: fromTextList(suitableForText),
        bookedDates: fromTextList(bookedDatesText),
        highlights: fromTextList(highlightsText),
      });
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Das Angebot konnte nicht gespeichert werden."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center">
      <button
        type="button"
        aria-label="Angebot schließen"
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2
              className="text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              {form.id ? "Angebot bearbeiten" : "Angebot hinzufügen"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Sichtbarkeit, Preis und Event-Eignung verwalten.
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

        <div className="grid gap-4 overflow-y-auto p-6 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs text-slate-500">Name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Kategorie</span>
            <select
              value={form.category}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category: event.target.value as ProviderOfferFormValues["category"],
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            >
              <option value="Ausstattung">Ausstattung</option>
              <option value="Dienstleistung">Dienstleistung</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Unterkategorie</span>
            <input
              value={form.subcategory}
              onChange={(event) =>
                setForm((current) => ({ ...current, subcategory: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Preis</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) =>
                setForm((current) => ({ ...current, price: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Preiseinheit</span>
            <input
              value={form.priceUnit}
              onChange={(event) =>
                setForm((current) => ({ ...current, priceUnit: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs text-slate-500">Beschreibung</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs text-slate-500">Bild-URL</span>
            <input
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Passende Eventtypen</span>
            <textarea
              value={suitableForText}
              onChange={(event) => setSuitableForText(event.target.value)}
              placeholder={EVENT_TYPES.join(", ")}
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-xs text-slate-500">Gebuchte Daten</span>
            <textarea
              value={bookedDatesText}
              onChange={(event) => setBookedDatesText(event.target.value)}
              placeholder="2026-09-12"
              className="min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1.5 block text-xs text-slate-500">Highlights</span>
            <textarea
              value={highlightsText}
              onChange={(event) => setHighlightsText(event.target.value)}
              className="min-h-20 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
            />
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3">
            <Checkbox
              checked={form.visible}
              onCheckedChange={(checked) =>
                setForm((current) => ({ ...current, visible: checked === true }))
              }
            />
            <span className="text-sm text-slate-700">Im Katalog sichtbar</span>
          </label>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Speichern
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ProviderPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileForm>(EMPTY_PROFILE);
  const [offers, setOffers] = useState<EquipmentServiceRow[]>([]);
  const [selectedOfferIds, setSelectedOfferIds] = useState<Array<string | number>>([]);
  const [editingOffer, setEditingOffer] = useState<ProviderOfferFormValues | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, navigate, user]);

  const loadProviderData = async (providerId: string) => {
    setPageLoading(true);
    setError("");

    try {
      const [providerProfile, providerOffers] = await Promise.all([
        fetchProviderProfile(providerId),
        fetchProviderOffers(providerId),
      ]);

      setProfile({
        name: providerProfile?.name ?? "",
        email: providerProfile?.email ?? user?.email ?? "",
        phone: providerProfile?.phone ?? "",
        street: providerProfile?.street ?? "",
        city: providerProfile?.city ?? "",
        cityCode: providerProfile?.cityCode ?? "",
      });
      setOffers(providerOffers);
      setSelectedOfferIds([]);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Ihre Profildaten konnten nicht geladen werden."
      );
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadProviderData(user.id);
    }
  }, [user?.id]);

  const allSelected = useMemo(
    () => offers.length > 0 && selectedOfferIds.length === offers.length,
    [offers.length, selectedOfferIds.length]
  );

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user?.id) return;
    if (!profile.name?.trim() || !profile.email?.trim() || !profile.phone?.trim()) {
      setError("Bitte füllen Sie Name, E-Mail und Telefonnummer aus.");
      return;
    }

    setSavingProfile(true);
    setError("");
    setNotice("");

    try {
      await updateProviderProfile(user.id, {
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        street: profile.street?.trim() ?? "",
        city: profile.city?.trim() ?? "",
        cityCode: profile.cityCode?.trim() ?? "",
      });
      setNotice("Kontaktdaten gespeichert.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Ihre Kontaktdaten konnten nicht gespeichert werden."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveOffer = async (offer: ProviderOfferFormValues) => {
    if (!user?.id) return;

    if (offer.id) {
      await updateProviderOffer(user.id, offer);
    } else {
      await createProviderOffer(user.id, offer);
    }

    setEditingOffer(null);
    await loadProviderData(user.id);
    setNotice("Angebot gespeichert.");
  };

  const handleDeleteOffers = async () => {
    if (!user?.id || selectedOfferIds.length === 0) return;
    const confirmed = window.confirm("Ausgewählte Angebote wirklich löschen?");

    if (!confirmed) return;

    try {
      await deleteProviderOffers(user.id, selectedOfferIds);
      await loadProviderData(user.id);
      setNotice("Ausgewählte Angebote gelöscht.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Die Angebote konnten nicht gelöscht werden."
      );
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (authLoading || pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
          Profil wird geladen...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <img src="images/isevents_logo.svg" alt="ISEvents" width="120" />
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1
            className="mb-1 text-slate-900"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
            }}
          >
            Anbieter-Profil
          </h1>
          <p className="text-sm text-slate-500">
            Verwalten Sie Ihre Kontaktdaten und alle Angebote im Katalog.
          </p>
        </div>

        {(error || notice) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-100 bg-red-50 text-red-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>
        )}

        <form
          onSubmit={handleProfileSubmit}
          className="mb-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2
              className="text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Kontaktdaten
            </h2>
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-70"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Speichern
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ["name", "Name des Anbieters"],
              ["email", "E-Mail"],
              ["phone", "Telefon"],
              ["street", "Straße"],
              ["cityCode", "PLZ"],
              ["city", "Ort"],
            ].map(([field, label]) => (
              <label key={field}>
                <span className="mb-1.5 block text-xs text-slate-500">{label}</span>
                <input
                  type={field === "email" ? "email" : "text"}
                  value={profile[field as keyof ProfileForm] ?? ""}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500"
                />
              </label>
            ))}
          </div>
        </form>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2
                className="text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Angebote
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {offers.length} Angebote in Ihrem Profil
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(checked) =>
                      setSelectedOfferIds(checked ? offers.map((offer) => offer.id) : [])
                    }
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Preis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-slate-500">
                    Noch keine Angebote vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                offers.map((offer) => {
                  const selected = selectedOfferIds.includes(offer.id);

                  return (
                    <TableRow key={offer.id} data-state={selected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected}
                          onCheckedChange={(checked) =>
                            setSelectedOfferIds((current) =>
                              checked
                                ? [...current, offer.id]
                                : current.filter((id) => id !== offer.id)
                            )
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium text-slate-800">{offer.name}</TableCell>
                      <TableCell>{offer.category}</TableCell>
                      <TableCell>{formatPrice(offer)}</TableCell>
                      <TableCell>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            offer.visible
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {offer.visible ? "Sichtbar" : "Ausgeblendet"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => setEditingOffer(toOfferForm(offer))}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                          Bearbeiten
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setEditingOffer(EMPTY_OFFER)}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-600"
            >
              <Plus className="h-4 w-4" />
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={handleDeleteOffers}
              disabled={selectedOfferIds.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Löschen
            </button>
          </div>
        </section>
      </main>

      {editingOffer && (
        <OfferModal
          offer={editingOffer}
          onClose={() => setEditingOffer(null)}
          onSave={handleSaveOffer}
        />
      )}
    </div>
  );
}
