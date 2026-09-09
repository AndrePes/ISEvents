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

export interface MailItem {
  id: string;
  name: string;
  description: string;
  pricePerEvent: number;
  priceUnit: string;
  provider: Pick<Provider, "name" | "email">;
}

export interface CreateBookingRequestBody {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  dateFrom: string;
  dateTo: string;
  eventType: string;
  guestCount: string;
  message: string;
  items: MailItem[];
}

export interface BookingRequestMessage extends CreateBookingRequestBody {
  version: 1;
  bookingRequestId: string;
}
