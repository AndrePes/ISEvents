import { useState } from "react";
import { useNavigate } from "react-router";
import { format, startOfDay } from "date-fns";
import { de } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  CalendarIcon,
  ChevronDown,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Heart,
  Cake,
  Building2,
  Award,
  GraduationCap,
  Baby,
  Snowflake,
  PartyPopper,
} from "lucide-react";
import { DateRangePicker } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { EVENT_TYPES } from "../types";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: CalendarIcon,
    title: "Datum wählen",
    description:
      "Wählen Sie das Datum Ihres Events. Wir prüfen sofort die Verfügbarkeit aller Anbieter.",
  },
  {
    step: "02",
    icon: Sparkles,
    title: "Auswählen",
    description:
      "Stöbern Sie durch alle verfügbaren Ausstattungen und Dienstleistungen und wählen Sie Ihre Favoriten.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    title: "Anfrage senden",
    description:
      "Mit einem Klick senden Sie Ihre Anfrage direkt an alle gewählten Anbieter.",
  },
];

const STATS = [
  { value: "50+", label: "Anbieter" },
  { value: "200+", label: "Events pro Jahr" },
  { value: "4.9★", label: "Kundenbewertung" },
  { value: "100%", label: "Kostenlos anfragen" },
];

function formatDateRange(range: DateRange | undefined): string {
  if (!range?.from) return "Datum auswählen";
  if (!range.to) return format(range.from, "dd. MMMM yyyy", { locale: de });

  return `${format(range.from, "dd. MMMM yyyy", { locale: de })} - ${format(
    range.to,
    "dd. MMMM yyyy",
    { locale: de }
  )}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedEventType, setSelectedEventType] = useState<string>("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [error, setError] = useState("");

  const today = startOfDay(new Date());

  const handleSearch = () => {
    if (!selectedDateRange?.from || !selectedDateRange.to) {
      setError("Bitte wählen Sie einen vollständigen Zeitraum aus.");
      return;
    }
    if (!selectedEventType) {
      setError("Bitte wählen Sie einen Eventtyp aus.");
      return;
    }
    setError("");
    const dateFrom = format(selectedDateRange.from, "yyyy-MM-dd");
    const dateTo = format(selectedDateRange.to, "yyyy-MM-dd");
    navigate(
      `/catalog?dateFrom=${dateFrom}&dateTo=${dateTo}&eventType=${encodeURIComponent(
        selectedEventType
      )}`
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(images/hero_image.jpg)' }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-500/80 via-slate-900/60 to-slate-900/90" />

        {/* Nav */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
              <img src="images/isevents_logo.svg" alt="ISEvents" width="200px"/>
          </div>
          <div className="hidden md:flex items-center gap-6 text-white/80 text-sm">
            <a href="#wie-es-funktioniert" className="hover:text-white transition-colors">
              Wie es funktioniert
            </a>
            <a href="#kontakt" className="hover:text-white transition-colors">
              Kontakt
            </a>
            <a
              href="mailto:info@isevents.de"
              className="px-4 py-2 border border-white/30 rounded-full text-white hover:bg-white/10 transition-colors"
            >
              Anbieter werden
            </a>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Einfach. Schnell. Unvergesslich.
          </div>

          <h1
            className="text-white mb-4 max-w-3xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.15,
            }}
          >
            Ihr perfektes Event
            <span className="block text-amber-400">beginnt hier.</span>
          </h1>

          <p className="text-white/70 text-lg max-w-xl mb-10">
            Mieten Sie Ausstattung und buchen Sie Dienstleistungen für Ihre
            Veranstaltung – alles an einem Ort, in wenigen Minuten.
          </p>

          {/* Search Card */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Event Type */}
              <div className="relative">
                <label className="block text-slate-500 text-xs mb-1.5 text-left">
                  Eventtyp
                </label>
                <button
                  onClick={() => {
                    setEventTypeOpen(!eventTypeOpen);
                    setCalendarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-left hover:border-amber-400 transition-colors focus:outline-none focus:border-amber-500"
                >
                  <span className={selectedEventType ? "text-slate-900" : "text-slate-400"}>
                    {selectedEventType || "Art des Events wählen"}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${eventTypeOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {eventTypeOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {EVENT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedEventType(type);
                          setEventTypeOpen(false);
                          setError("");
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-amber-50 hover:text-amber-700 transition-colors ${
                          selectedEventType === type
                            ? "bg-amber-50 text-amber-700"
                            : "text-slate-700"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Date Range Picker */}
              <div>
                <label className="block text-slate-500 text-xs mb-1.5 text-left">
                  Zeitraum des Events
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      onClick={() => setEventTypeOpen(false)}
                      className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl text-left hover:border-amber-400 transition-colors focus:outline-none focus:border-amber-500"
                    >
                      <span
                        className={selectedDateRange?.from ? "text-slate-900" : "text-slate-400"}
                      >
                        {formatDateRange(selectedDateRange)}
                      </span>
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <DateRangePicker
                      selected={selectedDateRange}
                      onSelect={(range) => {
                        setSelectedDateRange(range);
                        setError("");
                        if (range?.from && range.to) {
                          setCalendarOpen(false);
                        }
                      }}
                      disabled={(date) => date < today}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mb-3 text-left">{error}</p>
            )}

            <button
              onClick={handleSearch}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-colors font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Verfügbarkeit prüfen
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-amber-400 text-xl"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                >
                  {stat.value}
                </div>
                <div className="text-white/60 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="relative z-10 flex justify-center pb-8 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/40" />
        </div>
      </section>

      {/* How it works */}
      <section id="wie-es-funktioniert" className="py-24 px-4 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block text-amber-600 text-sm font-medium mb-3">
              SO EINFACH GEHT'S
            </span>
            <h2
              className="text-slate-900"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              }}
            >
              In 3 Schritten zum perfekten Event
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </div>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8 h-0.5 bg-amber-200 z-10" />
                )}
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4 mt-2">
                  <item.icon className="w-6 h-6 text-amber-500" />
                </div>
                <h3
                  className="text-slate-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                >
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block text-amber-600 text-sm font-medium mb-3">
            FÜR JEDEN ANLASS
          </span>
          <h2
            className="text-slate-900 mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            }}
          >
            Welche Art von Event planen Sie?
          </h2>
          <p className="text-slate-500 mb-12 max-w-xl mx-auto">
            Von der romantischen Hochzeit bis zur professionellen Firmenfeier –
            wir haben für jeden Anlass die richtigen Anbieter.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                icon: Heart,
                label: "Hochzeit",
                color: "from-rose-50 to-pink-50",
                border: "border-rose-100",
                iconColor: "text-rose-500",
                iconBg: "bg-rose-100",
              },
              {
                icon: Cake,
                label: "Geburtstag",
                color: "from-amber-50 to-yellow-50",
                border: "border-amber-100",
                iconColor: "text-amber-600",
                iconBg: "bg-amber-100",
              },
              {
                icon: Building2,
                label: "Firmenfeier",
                color: "from-blue-50 to-indigo-50",
                border: "border-blue-100",
                iconColor: "text-blue-600",
                iconBg: "bg-blue-100",
              },
              {
                icon: Award,
                label: "Jubiläum",
                color: "from-violet-50 to-purple-50",
                border: "border-violet-100",
                iconColor: "text-violet-600",
                iconBg: "bg-violet-100",
              },
              {
                icon: GraduationCap,
                label: "Abschlussfeier",
                color: "from-emerald-50 to-teal-50",
                border: "border-emerald-100",
                iconColor: "text-emerald-600",
                iconBg: "bg-emerald-100",
              },
              {
                icon: Baby,
                label: "Taufe / Kommunion",
                color: "from-sky-50 to-blue-50",
                border: "border-sky-100",
                iconColor: "text-sky-600",
                iconBg: "bg-sky-100",
              },
              {
                icon: Snowflake,
                label: "Weihnachtsfeier",
                color: "from-red-50 to-orange-50",
                border: "border-red-100",
                iconColor: "text-red-500",
                iconBg: "bg-red-100",
              },
              {
                icon: PartyPopper,
                label: "Andere",
                color: "from-slate-50 to-gray-50",
                border: "border-slate-100",
                iconColor: "text-slate-600",
                iconBg: "bg-slate-100",
              },
            ].map((evt) => (
              <button
                key={evt.label}
                onClick={() => {
                  setSelectedEventType(evt.label);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`p-5 rounded-2xl bg-gradient-to-br ${evt.color} border ${evt.border} hover:shadow-md transition-all hover:-translate-y-0.5 text-center`}
              >
                <div className={`w-10 h-10 rounded-xl ${evt.iconBg} flex items-center justify-center mx-auto mb-2`}>
                  <evt.icon className={`w-5 h-5 ${evt.iconColor}`} />
                </div>
                <div className="text-slate-700 text-sm font-medium">{evt.label}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 bg-slate-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-white mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            }}
          >
            Bereit, Ihr Event zu planen?
          </h2>
          <p className="text-white/60 mb-8">
            Wählen Sie jetzt Ihr Datum und entdecken Sie alle verfügbaren
            Angebote – kostenlos und unverbindlich.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors"
          >
            Jetzt starten
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontakt" className="bg-slate-950 text-white/50 py-10 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
          <span
            className="text-white text-base"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            ISEvents
          </span>
        </div>
        <p>© 2026 ISEvents. Alle Rechte vorbehalten.</p>
        <p className="mt-1">
          <a href="mailto:info@isevents.de" className="hover:text-white transition-colors">
            info@isevents.de
          </a>
        </p>
      </footer>
    </div>
  );
}
