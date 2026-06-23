import {
  EquipmentServiceRow,
  EventItem,
  Provider,
  ProviderRow,
} from "../types";
import { getSupabaseClient } from "./supabase";

const CATEGORY_PLACEHOLDER_IMAGES: Record<EventItem["category"], string> = {
  Ausstattung:
    "https://images.unsplash.com/photo-1727931301188-55b23fa9672e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  Dienstleistung:
    "https://images.unsplash.com/photo-1766111242568-d935ea63f32f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
};

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function toNumber(value: number | string | null): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function toProvider(row?: ProviderRow): Provider {
  return {
    id: row?.id,
    name: row?.name ?? "",
    email: row?.email ?? "",
    phone: row?.phone ?? "",
    street: row?.street ?? "",
    city: row?.city ?? "",
    cityCode: row?.cityCode ?? "",
  };
}

function toEventItem(
  service: EquipmentServiceRow,
  providersById: Map<string, ProviderRow>
): EventItem | null {
  if (!service || !providersById) {
    console.error("Failed to create EventItem. One or more parameters are null or undefined.");
    return null;
  }

  if (
    service.category !== "Ausstattung" &&
    service.category !== "Dienstleistung"
  ) {
    console.error("Event catgeory not set for event:", service)
    return null;
  }

  return {
    id: String(service.id),
    name: service.name ?? "",
    category: service.category,
    subcategory: service.subcategory ?? "",
    description: service.description ?? "",
    pricePerEvent: toNumber(service.price),
    priceUnit: service.priceUnit ?? "",
    image:
      service.imageUrl?.trim() ||
      CATEGORY_PLACEHOLDER_IMAGES[service.category],
    provider: toProvider(
      service.providerId ? providersById.get(service.providerId) : undefined
    ),
    suitableFor: toStringArray(service.suitableFor),
    bookedDates: toStringArray(service.bookedDates),
    rating: toNumber(service.rating),
    reviewCount: toNumber(service.reviewCount),
    highlights: toStringArray(service.highlights),
  };
}

export async function fetchCatalogItems(
  dateFrom?: string,
  dateTo = dateFrom
): Promise<EventItem[]> {
  // Get the client
  const supabase = getSupabaseClient();

  // Fetch all rows from EquipmentServices
  const { data: services, error: servicesError } = await supabase
    .from("EquipmentServices")
    .select("*")
    .order("created_at", { ascending: false });

  // If error
  if (servicesError) {
    throw new Error(servicesError.message);
  }

  //
  const serviceRows = (services ?? []) as EquipmentServiceRow[];
  
  // Extract all provider ids from EquipmentServices
  const providerIds = Array.from(
    new Set(
      serviceRows
        .map((service) => service.providerId)
        .filter((providerId): providerId is string => Boolean(providerId))
    )
  );

  let providerRows: ProviderRow[] = [];

  if (providerIds.length > 0) {
    const { data: providers, error: providersError } = await supabase
      .from("Provider")
      .select("*")
      .in("id", providerIds);

    if (providersError) {
      throw new Error(providersError.message);
    }

    providerRows = (providers ?? []) as ProviderRow[];
  }

  const providersById = new Map(
    providerRows.map((provider) => [provider.id, provider])
  );

  const items = serviceRows
    .map((service) => toEventItem(service, providersById))
    .filter((item): item is EventItem => Boolean(item));

  if (!dateFrom || !dateTo) {
    return items;
  }

  return filterAvailableItems(items, dateFrom, dateTo);
}

export function filterAvailableItems(
  items: EventItem[],
  dateFrom: string,
  dateTo = dateFrom
): EventItem[] {
  const [rangeStart, rangeEnd] =
    dateFrom <= dateTo ? [dateFrom, dateTo] : [dateTo, dateFrom];

  return items.filter(
    (item) =>
      !item.bookedDates.some(
        (bookedDate) => bookedDate >= rangeStart && bookedDate <= rangeEnd
      )
  );
}
