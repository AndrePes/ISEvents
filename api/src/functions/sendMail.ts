import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { QueueClient } from "@azure/storage-queue";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { BookingRequestMessage, CreateBookingRequestBody, MailItem } from "./types";

const queueName = process.env.MAIL_QUEUE_NAME ?? "mail-requests";

class RequestError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

function requiredSetting(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function getSupabaseAdmin(): SupabaseClient {
  return createClient(requiredSetting("SUPABASE_URL"), requiredSetting("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function getQueueClient(): QueueClient {
  return new QueueClient(requiredSetting("AzureWebJobsStorage"), queueName);
}

function assertDate(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RequestError(400, `${field} must use YYYY-MM-DD format`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new RequestError(400, `${field} is not a valid date`);
  }
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new RequestError(400, `${field} is required`);
  }
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new RequestError(400, `${field} exceeds ${maxLength} characters`);
  }
  return normalized;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBody(input: unknown): CreateBookingRequestBody {
  if (!input || typeof input !== "object") {
    throw new RequestError(400, "Request body must be a JSON object");
  }

  const value = input as Partial<CreateBookingRequestBody>;
  assertDate(value.dateFrom, "dateFrom");
  assertDate(value.dateTo, "dateTo");
  if (value.dateFrom > value.dateTo) throw new RequestError(400, "dateFrom must not be after dateTo");
  if (!Array.isArray(value.items) || value.items.length === 0) {
    throw new RequestError(400, "At least one item is required");
  }
  if (value.items.length > 100) throw new RequestError(400, "A maximum of 100 items is allowed");

  const items: MailItem[] = value.items.map((item, index) => {
    if (!item || typeof item !== "object" || !item.provider) {
      throw new RequestError(400, `items[${index}] is invalid`);
    }
    const providerEmail = requiredText(item.provider.email, `items[${index}].provider.email`, 320);
    if (!isEmail(providerEmail)) {
      throw new RequestError(400, `items[${index}].provider.email is invalid`);
    }
    return {
      id: requiredText(item.id, `items[${index}].id`, 100),
      name: requiredText(item.name, `items[${index}].name`, 200),
      description: typeof item.description === "string" ? item.description.slice(0, 2_000) : "",
      pricePerEvent: Number.isFinite(Number(item.pricePerEvent)) ? Number(item.pricePerEvent) : 0,
      priceUnit: typeof item.priceUnit === "string" ? item.priceUnit.slice(0, 50) : "",
      provider: {
        name: requiredText(item.provider.name, `items[${index}].provider.name`, 200),
        email: providerEmail,
      },
    };
  });

  const customerEmail = requiredText(value.customer?.email, "customer.email", 320);
  if (!isEmail(customerEmail)) {
    throw new RequestError(400, "customer.email is invalid");
  }

  return {
    customer: {
      name: requiredText(value.customer?.name, "customer.name", 200),
      email: customerEmail,
      phone: requiredText(value.customer?.phone, "customer.phone", 100),
    },
    dateFrom: value.dateFrom,
    dateTo: value.dateTo,
    eventType: typeof value.eventType === "string" ? value.eventType.slice(0, 100) : "",
    guestCount: typeof value.guestCount === "string" ? value.guestCount.slice(0, 20) : "",
    message: typeof value.message === "string" ? value.message.slice(0, 4_000) : "",
    items,
  };
}

async function getAuthenticatedCustomerId(request: HttpRequest, supabase: SupabaseClient): Promise<string | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const { data, error } = await supabase.auth.getUser(authorization.slice("Bearer ".length));
  if (error || !data.user) throw new RequestError(401, "Invalid access token");
  return data.user.id;
}

export async function sendMail(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  let bookingRequestId: string | undefined;
  let supabase: SupabaseClient | undefined;

  try {
    const body = parseBody(await request.json());
    supabase = getSupabaseAdmin();
    const customerId = await getAuthenticatedCustomerId(request, supabase);
    const { data, error } = await supabase
      .from("BookingRequests")
      .insert({
        from_date: `${body.dateFrom}T00:00:00.000Z`,
        to_date: `${body.dateTo}T00:00:00.000Z`,
        status: "Open",
        processing_status: "Pending",
        customer_id: customerId,
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(`Booking request could not be saved: ${error?.message ?? "missing id"}`);
    }
    bookingRequestId = data.id;

    const queueMessage: BookingRequestMessage = { version: 1, bookingRequestId, ...body };
    const serializedMessage = JSON.stringify(queueMessage);
    if (Buffer.byteLength(serializedMessage, "utf8") > 48_000) {
      throw new RequestError(413, "Request is too large for the mail queue");
    }

    // Azure Functions Queue triggers expect base64 messages by default.
    await getQueueClient().sendMessage(Buffer.from(serializedMessage, "utf8").toString("base64"));

    return { status: 202, jsonBody: { bookingRequestId, processingStatus: "Pending" } };
  } catch (error) {
    if (bookingRequestId && supabase) {
      await supabase
        .from("BookingRequests")
        .update({ processing_status: "EnqueueFailed", updated_at: new Date().toISOString() })
        .eq("id", bookingRequestId);
    }
    context.error(error);
    const status = error instanceof RequestError ? error.status : 500;
    return {
      status,
      jsonBody: {
        error: status < 500 && error instanceof Error ? error.message : "Booking request could not be queued",
      },
    };
  }
}

app.http("sendMail", { methods: ["POST"], authLevel: "anonymous", handler: sendMail });
