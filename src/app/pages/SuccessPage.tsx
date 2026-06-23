import { useSearchParams, useNavigate } from "react-router";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle2, Star, ArrowLeft, Calendar, Mail, Clock } from "lucide-react";

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const legacyDateStr = searchParams.get("date") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? legacyDateStr;
  const dateTo = searchParams.get("dateTo") ?? dateFrom;
  const eventType = searchParams.get("eventType") ?? "";
  const count = searchParams.get("count") ?? "1";
  const dateRangeQuery = `dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const formattedDateRange = useMemo(() => {
    if (!dateFrom || !dateTo) return "";
    try {
      const formattedFrom = format(parseISO(dateFrom), "dd. MMMM yyyy", {
        locale: de,
      });
      const formattedTo = format(parseISO(dateTo), "dd. MMMM yyyy", {
        locale: de,
      });

      return dateFrom === dateTo ? formattedFrom : `${formattedFrom} - ${formattedTo}`;
    } catch {
      return dateFrom === dateTo ? dateFrom : `${dateFrom} - ${dateTo}`;
    }
  }, [dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span
            className="text-slate-900 text-lg"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            ISEvents
          </span>
        </div>
      </div>

      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="relative inline-flex mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="absolute -right-1 -top-1 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>

          <h1
            className="text-slate-900 mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              lineHeight: 1.2,
            }}
          >
            Anfrage erfolgreich gesendet!
          </h1>

          <p className="text-slate-500 mb-8 leading-relaxed">
            Ihre Anfrage für{" "}
            <span className="font-medium text-slate-700">{count}</span>{" "}
            {parseInt(count) === 1 ? "Angebot wurde" : "Angebote wurden"} direkt
            an die jeweiligen Anbieter weitergeleitet.
          </p>

          {/* Event Details */}
          <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left space-y-3">
            {eventType && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Eventtyp</div>
                  <div className="text-slate-700 font-medium text-sm">{eventType}</div>
                </div>
              </div>
            )}
            {formattedDateRange && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-400">Eventzeitraum</div>
                  <div className="text-slate-700 font-medium text-sm">{formattedDateRange}</div>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Anfragen gesendet an</div>
                <div className="text-slate-700 font-medium text-sm">
                  {count} {parseInt(count) === 1 ? "Anbieter" : "Anbieter"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-400">Antwortzeit</div>
                <div className="text-slate-700 font-medium text-sm">
                  Die Anbieter melden sich in der Regel innerhalb von 24 Stunden
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left">
            <p className="text-amber-800 text-sm">
              <span className="font-medium">Tipp:</span> Prüfen Sie Ihre E-Mails
              – die Anbieter werden Sie direkt kontaktieren, um Details zu
              besprechen.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Zurück zur Startseite
            </button>
            <button
              onClick={() =>
                navigate(
                  `/catalog?${dateRangeQuery}&eventType=${encodeURIComponent(eventType)}`
                )
              }
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors text-sm font-medium"
            >
              Weitere hinzufügen
            </button>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-400 text-xs mt-6">
          Bei Fragen erreichen Sie uns unter{" "}
          <a href="mailto:info@isevents.de" className="text-amber-600 hover:text-amber-700">
            info@isevents.de
          </a>
        </p>
      </div>
    </div>
  );
}
