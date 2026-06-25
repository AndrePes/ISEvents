import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  CalendarDays,
  Tag,
  SearchX,
  ShoppingBag,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { EventItem } from "../types";
import { ItemCard } from "../components/ItemCard";
import { RequestModal } from "../components/RequestModal";
import { fetchCatalogItems } from "../lib/catalogRepository";

type FilterTab = "Alle" | "Ausstattung" | "Dienstleistung";

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const legacyDateStr = searchParams.get("date") ?? "";
  const dateFrom = searchParams.get("dateFrom") ?? legacyDateStr;
  const dateTo = searchParams.get("dateTo") ?? dateFrom;
  const eventType = searchParams.get("eventType") ?? "";
  const dateRangeQuery = `dateFrom=${dateFrom}&dateTo=${dateTo}`;

  const [loading, setLoading] = useState(true);
  const [availableItems, setAvailableItems] = useState<EventItem[]>([]);
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedItems, setSelectedItems] = useState<EventItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("Alle");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState<"rating" | "price">("rating");

  useEffect(() => {
    if (!dateFrom || !dateTo) {
      navigate("/");
      return;
    }

    let ignore = false;

    async function loadCatalogItems() {
      setLoading(true);
      setErrorMessage("");

      try {
        const items = await fetchCatalogItems(dateFrom, dateTo);

        if (ignore) return;

        setTotalItemCount(items.length);
        setAvailableItems(items);
        setSelectedItems((currentSelectedItems) =>
          currentSelectedItems.filter((selectedItem) =>
            items.some((availableItem) => availableItem.id === selectedItem.id)
          )
        );
      } catch (error) {
        if (ignore) return;

        const message =
          error instanceof Error
            ? error.message
            : "Die Angebote konnten nicht geladen werden.";

        setTotalItemCount(0);
        setAvailableItems([]);
        setErrorMessage(message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCatalogItems();

    return () => {
      ignore = true;
    };
  }, [dateFrom, dateTo, navigate]);

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

  const filteredItems = useMemo(() => {
    let items =
      activeTab === "Alle"
        ? availableItems
        : availableItems.filter((i) => i.category === activeTab);

    if (sortBy === "rating") {
      items = [...items].sort((a, b) => b.rating - a.rating);
    } else {
      items = [...items].sort((a, b) => a.pricePerEvent - b.pricePerEvent);
    }
    return items;
  }, [availableItems, activeTab, sortBy]);

  const unavailableCount = totalItemCount - availableItems.length;

  const handleToggle = (item: EventItem) => {
    setSelectedItems((prev) =>
      prev.find((i) => i.id === item.id)
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, item]
    );
  };

  const isSelected = (item: EventItem) =>
    selectedItems.some((i) => i.id === item.id);

  const tabs: FilterTab[] = ["Alle", "Ausstattung", "Dienstleistung"];
  const tabCounts = {
    Alle: availableItems.length,
    Ausstattung: availableItems.filter((i) => i.category === "Ausstattung").length,
    Dienstleistung: availableItems.filter((i) => i.category === "Dienstleistung").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Zurück</span>
            </button>

            <div className="w-px h-5 bg-slate-200" />

            <div className="flex items-center gap-2">
                <img src="images/isevents_logo.svg" alt="ISEvents" width="100px"/>
            </div>
          </div>

          {/* Date & Event info */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-full">
              <CalendarDays className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-amber-700 font-medium">{formattedDateRange}</span>
            </div>
            {eventType && (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full">
                <Tag className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600">{eventType}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1
            className="text-slate-900 mb-1"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            }}
          >
            Verfügbare Angebote
          </h1>
          {!loading && (
            <p className="text-slate-500 text-sm">
              {availableItems.length} Angebote für{" "}
              <span className="font-medium text-slate-700">{formattedDateRange}</span>{" "}
              verfügbar
              {unavailableCount > 0 && (
                <span className="text-slate-400">
                  {" "}
                  · {unavailableCount} bereits gebucht
                </span>
              )}
            </p>
          )}
        </div>

        {loading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-100" />
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-slate-700 font-medium">Verfügbarkeit wird geprüft...</p>
              <p className="text-slate-400 text-sm mt-1">
                Wir suchen die besten Angebote für Ihr Event
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <SearchX className="w-7 h-7 text-red-400" />
            </div>
            <h3
              className="text-slate-900 mb-2"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              Angebote konnten nicht geladen werden
            </h3>
            <p className="text-slate-500 text-sm max-w-md">{errorMessage}</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {tab}
                    <span
                      className={`ml-1.5 text-xs ${
                        activeTab === tab ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      ({tabCounts[tab]})
                    </span>
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">Sortierung:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rating" | "price")}
                  className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:border-amber-400 bg-white"
                >
                  <option value="rating">Bewertung</option>
                  <option value="price">Preis (aufsteigend)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <SearchX className="w-7 h-7 text-slate-400" />
                </div>
                <h3
                  className="text-slate-900 mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
                >
                  Keine Angebote gefunden
                </h3>
                <p className="text-slate-500 text-sm max-w-xs">
                  Für diesen Filter sind keine Angebote verfügbar. Versuchen Sie
                  einen anderen Filter oder ein anderes Datum.
                </p>
                <button
                  onClick={() => setActiveTab("Alle")}
                  className="mt-4 px-4 py-2 text-sm bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                >
                  Alle anzeigen
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    isSelected={isSelected(item)}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Sticky Footer - Selection Bar */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-4">
          <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl shadow-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <div
                  className="text-white font-medium text-sm"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {selectedItems.length}{" "}
                  {selectedItems.length === 1 ? "Angebot" : "Angebote"} ausgewählt
                </div>
                <div className="text-white/50 text-xs">
                  {selectedItems.map((i) => i.name).join(", ")}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex-shrink-0 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Anfrage senden →
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <RequestModal
          selectedItems={selectedItems}
          dateFrom={dateFrom}
          dateTo={dateTo}
          eventType={eventType}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            navigate(
              `/success?${dateRangeQuery}&eventType=${encodeURIComponent(
                eventType
              )}&count=${selectedItems.length}`
            );
          }}
        />
      )}
    </div>
  );
}
