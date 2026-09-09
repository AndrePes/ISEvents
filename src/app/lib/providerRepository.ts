import { EquipmentServiceRow, ProviderOfferFormValues, ProviderRow } from "../types";
import { getSupabaseClient } from "./supabase";

function cleanStringList(values: string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export async function fetchProviderProfile(providerId: string): Promise<ProviderRow | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("Provider")
    .select("*")
    .eq("id", providerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProviderRow | null;
}

export async function updateProviderProfile(
  providerId: string,
  profile: Pick<ProviderRow, "name" | "email" | "phone" | "street" | "city" | "cityCode">
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("Provider")
    .update(profile)
    .eq("id", providerId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function fetchProviderOffers(providerId: string): Promise<EquipmentServiceRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("EquipmentServices")
    .select("*")
    .eq("providerId", providerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as EquipmentServiceRow[];
}

function toOfferPayload(providerId: string, offer: ProviderOfferFormValues) {
  return {
    visible: offer.visible,
    name: offer.name.trim(),
    category: offer.category,
    subcategory: offer.subcategory.trim(),
    description: offer.description.trim(),
    price: Number(offer.price) || 0,
    priceUnit: offer.priceUnit.trim(),
    imageUrl: offer.imageUrl.trim() || null,
    providerId,
    suitableFor: cleanStringList(offer.suitableFor),
    bookedDates: cleanStringList(offer.bookedDates),
    highlights: cleanStringList(offer.highlights),
  };
}

export async function createProviderOffer(
  providerId: string,
  offer: ProviderOfferFormValues
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("EquipmentServices")
    .insert(toOfferPayload(providerId, offer));

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProviderOffer(
  providerId: string,
  offer: ProviderOfferFormValues
): Promise<void> {
  if (!offer.id) {
    throw new Error("Angebot kann ohne ID nicht gespeichert werden.");
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("EquipmentServices")
    .update(toOfferPayload(providerId, offer))
    .eq("id", offer.id)
    .eq("providerId", providerId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteProviderOffers(
  providerId: string,
  offerIds: Array<string | number>
): Promise<void> {
  if (offerIds.length === 0) return;

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("EquipmentServices")
    .delete()
    .eq("providerId", providerId)
    .in("id", offerIds);

  if (error) {
    throw new Error(error.message);
  }
}
