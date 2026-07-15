export interface EventItem {
  id: string;
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

export interface Provider {
  id?: string;
  name: string;
  email: string;
  phone: string;
  street?: string;
  city?: string;
  cityCode?: string;
}