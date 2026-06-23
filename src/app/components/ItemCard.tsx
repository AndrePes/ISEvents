import { Check, Star, User } from "lucide-react";
import { EventItem } from "../types";

interface ItemCardProps {
  item: EventItem;
  isSelected: boolean;
  onToggle: (item: EventItem) => void;
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  Ausstattung: { bg: "bg-blue-50", text: "text-blue-700" },
  Dienstleistung: { bg: "bg-violet-50", text: "text-violet-700" },
};

function formatPrice(item: EventItem): string {
  const formatted = item.pricePerEvent.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: Number.isInteger(item.pricePerEvent) ? 0 : 2,
  });
  const unit = item.priceUnit.replace(/^EUR\s*\/\s*/i, "").trim();

  return unit ? `ab ${formatted} / ${unit}` : `ab ${formatted}`;
}

export function ItemCard({ item, isSelected, onToggle }: ItemCardProps) {
  const catStyle = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.Ausstattung;

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border-2 transition-all duration-200 flex flex-col hover:shadow-md ${
        isSelected
          ? "border-amber-400 shadow-amber-100 shadow-md"
          : "border-slate-100 hover:border-slate-200"
      }`}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Category badge */}
        <div className="absolute bottom-2 left-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${catStyle.bg} ${catStyle.text}`}
          >
            {item.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <div className="text-xs text-slate-400 mb-0.5">{item.subcategory}</div>
          <h3
            className="text-slate-900 leading-snug"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
          >
            {item.name}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Highlights */}
        <ul className="space-y-1">
          {item.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5 text-xs text-slate-600">
              <Check className="w-3 h-3 text-amber-500 flex-shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-sm text-slate-700">
                {item.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({item.reviewCount})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <User className="w-3 h-3" />
              {item.provider.name || "Anbieter"}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div
              className="text-slate-900"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600 }}
            >
              {formatPrice(item)}
            </div>
            <button
              onClick={() => onToggle(item)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isSelected
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-slate-900 text-white hover:bg-slate-700"
              }`}
            >
              {isSelected ? "Ausgewählt" : "Auswählen"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
