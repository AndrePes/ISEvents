import { useState } from "react";
import { X, Send, CheckCircle2, Loader2, User, Mail, Phone, MessageSquare } from "lucide-react";
import { EventItem } from "../types";
import { request } from "https";

interface RequestModalProps {
  selectedItems: EventItem[];
  dateFrom: string;
  dateTo: string;
  eventType: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  guestCount: string;
  rentalDuration: number;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  guestCount: "",
  rentalDuration: 1,
  message: "",
};

interface SendMailRequest {
  email: string;
  messageHeader: string;
  messageBody: string;
  dateRange: string;
  items: EventItem[];
}

function formatDateDE(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}

function formatDateRangeDE(dateFrom: string, dateTo: string): string {
  const formattedFrom = formatDateDE(dateFrom);
  const formattedTo = formatDateDE(dateTo);

  if (!formattedFrom || !formattedTo) return "";
  return dateFrom === dateTo ? formattedFrom : `${formattedFrom} - ${formattedTo}`;
}

function getDayCount(dateFrom: string, dateTo: string): number {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}

export function RequestModal({
  selectedItems,
  dateFrom,
  dateTo,
  eventType,
  onClose,
  onSuccess,
}: RequestModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const groupItemsByProviderEmail = (items: EventItem[]): Record<string, EventItem[]> => {
    return items.reduce<Record<string, EventItem[]>>((groups, item) => {
      const email = item.provider.email;

      if (!groups[email]) {
        groups[email] = [];
      }

      groups[email].push(item);

      return groups;
    }, {});
  }

  const validate = (): boolean => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Bitte geben Sie Ihren Namen ein.";
    if (!form.email.trim()) {
      newErrors.email = "Bitte geben Sie Ihre E-Mail ein.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Bitte eine gültige E-Mail eingeben.";
    }
    if (!form.phone.trim()) newErrors.phone = "Bitte geben Sie Ihre Telefonnummer ein.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    // In a real implementation, this would call a backend API or Supabase Edge Function
    // to send emails to each provider's email address:
    const aRecipients = selectedItems.map(et => ({
      address: et.provider.email}));

    const groupedItems = groupItemsByProviderEmail(selectedItems);
    console.log(groupedItems);
    
    const aPromises = [];

    // Send emails to each provider
    Object.entries(groupedItems).forEach(([email, items]) => {
      aPromises.push(new Promise (async (resolve) => {
        console.log(`Send email to ${email}`);
        
        items.forEach(item => {
          console.log(`- ${item.name}`);
        });

        const req: SendMailRequest = {
            email: form.email,
            messageHeader: "Neue Anfrage",
            messageBody: "Sie haben eine neue Anfrage erhalten.",
            dateRange: formatDateRangeDE(dateFrom, dateTo),
            items: selectedItems,
        };

        const response = await fetch("/api/sendMail", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(req)
        });

        if (!response.ok) {
          setLoading(false);
          const error = await response.json();
          throw new Error(error.error ?? "Unknown error");
        }
      
      }));
    });

    // Send a confirmation email to requester
    aPromises.push(new Promise (async (resolve) => {
      console.log(`Send confirmation email to ${form.email}`);
      
      const req: SendMailRequest = {
          email: form.email,
          messageHeader: "Ihre Anfrage bei ISEvents",
          messageBody: "Vielen Dank für Ihre Anfrage. Wir haben alle Anbieter informiert. Sie erhalten in Kürze Rückmeldungen von den Anbietern.",
          dateRange: formatDateRangeDE(dateFrom, dateTo),
          items: selectedItems,
      };

      const response = await fetch("/api/sendMail", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
          setLoading(false);
          const error = await response.json();
          throw new Error(error.error ?? "Unknown error");
      }

    }));

    const allPromises = Promise.all(aPromises).catch((error) => {
      console.error("Error sending emails:", error);
      setLoading(false);
      return;
    });

    console.log("All emails sent successfully.", allPromises);
    setLoading(false);
    setSent(true);
    onSuccess();
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2
              className="text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Anfrage senden
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              An {selectedItems.length}{" "}
              {selectedItems.length === 1 ? "Anbieter" : "Anbieter"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {sent ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3
                className="text-slate-900 mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
              >
                Anfrage wird gesendet!
              </h3>
              <p className="text-slate-500 text-sm">
                Ihre Anfrage wird an alle Anbieter weitergeleitet.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Selected items summary */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="text-xs font-medium text-amber-700 mb-2">
                  IHRE AUSWAHL ({selectedItems.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-200 rounded-full text-xs text-slate-700"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
                <div className="mt-2 text-xs text-amber-600">
                  <span> Zeitraum: {formatDateRangeDE(dateFrom, dateTo)} ({getDayCount(dateFrom, dateTo)} Tage) · {eventType}</span>
                  <br />

                  <i> Für individuelle Mietdauer der einzelnen Angebote können gern mit dem Anbieter festgelegt werden.</i>
                </div>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">
                    Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Max Mustermann"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-colors ${
                        errors.name
                          ? "border-red-300 focus:border-red-400"
                          : "border-slate-200 focus:border-amber-400"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-1.5">
                    Telefonnummer *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="+49 170 1234567"
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-colors ${
                        errors.phone
                          ? "border-red-300 focus:border-red-400"
                          : "border-slate-200 focus:border-amber-400"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">
                  E-Mail-Adresse *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="max@beispiel.de"
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 transition-colors ${
                      errors.email
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-amber-400"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">
                  Anzahl der Gäste (ca.)
                </label>
                <input
                  type="number"
                  value={form.guestCount}
                  onChange={(e) => handleChange("guestCount", e.target.value)}
                  placeholder="z.B. 80"
                  min="1"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
                />
              </div>

              {/* <div>
                <label className="block text-sm text-slate-700 mb-1.5">
                  Mietdauer
                </label>
                <input
                  type="number"
                  value={form.rentalDuration}
                  onChange={(e) => handleChange("rentalDuration", e.target.value)}
                  placeholder="z.B. 1"
                  min="1"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors"
                />
              </div> */}

              <div>
                <label className="block text-sm text-slate-700 mb-1.5">
                  Nachricht / Besondere Wünsche
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={form.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    placeholder="Teilen Sie uns Ihre besonderen Wünsche mit..."
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-colors resize-none"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-400">
                * Pflichtfelder. Ihre Anfrage wird direkt an die Anbieter der
                ausgewählten Leistungen weitergeleitet.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        {!sent && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-70 text-white rounded-xl font-medium transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Wird gesendet...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Anfrage senden
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
