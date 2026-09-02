export interface Provider {
  id?: string;
  name: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  cityCode?: string;
}

export interface EventItem {
  id: string;
  visible?: boolean;
  name: string;
  category: "Ausstattung" | "Dienstleistung";
  subcategory: string;
  description: string;
  pricePerEvent: number;
  priceUnit: string;
  image: string;
  provider: Provider;
  suitableFor: string[];
  bookedDates: string[]; // "YYYY-MM-DD" format
  rating: number;
  reviewCount: number;
  highlights: string[];
}

export interface ProviderRow {
  id: string;
  created_at: string | null;
  name: string | null;
  street: string | null;
  city: string | null;
  cityCode: string | null;
  email: string | null;
  phone: string | null;
}

export interface EquipmentServiceRow {
  id: number | string;
  created_at: string | null;
  visible: boolean;
  name: string | null;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  price: number | string | null;
  priceUnit: string | null;
  providerId: string | null;
  suitableFor: unknown;
  bookedDates: unknown;
  rating: number | string | null;
  reviewCount: number | string | null;
  highlights: unknown;
  imageUrl?: string | null;
}

export interface BookingRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  dateFrom: string;
  dateTo: string;
  eventType: string;
  guestCount: string;
  message: string;
  selectedItems: EventItem[];
}

export const EVENT_TYPES = [
  "Hochzeit",
  "Geburtstag",
  "Firmenfeier",
  "Jubiläum",
  "Abschlussfeier",
  "Taufe / Kommunion",
  "Weihnachtsfeier",
  "Andere",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface ProviderOfferFormValues {
  id?: number | string;
  visible: boolean;
  name: string;
  category: EventItem["category"];
  subcategory: string;
  description: string;
  price: string;
  priceUnit: string;
  imageUrl: string;
  suitableFor: string[];
  bookedDates: string[];
  highlights: string[];
}
