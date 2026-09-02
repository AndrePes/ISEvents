import { app, InvocationContext } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import { createClient } from "@supabase/supabase-js";
import { BookingRequestMessage, MailItem } from "./types";

function requiredSetting(name: string, fallbackName?: string): string {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
  if (!value) throw new Error(`${name} missing`);
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseMessage(queueEntry: unknown): BookingRequestMessage {
  const parsed = typeof queueEntry === "string" ? JSON.parse(queueEntry) : queueEntry;
  if (!parsed || typeof parsed !== "object") throw new Error("Invalid queue message");

  const message = parsed as BookingRequestMessage;
  if (message.version !== 1 || !message.bookingRequestId || !message.customer || !Array.isArray(message.items)) {
    throw new Error("Unsupported queue message");
  }
  return message;
}

function formatDateRange(message: BookingRequestMessage): string {
  const formatter = new Intl.DateTimeFormat("de-DE", { timeZone: "UTC" });
  const from = formatter.format(new Date(`${message.dateFrom}T00:00:00.000Z`));
  const to = formatter.format(new Date(`${message.dateTo}T00:00:00.000Z`));
  return from === to ? from : `${from} – ${to}`;
}

function renderItems(items: MailItem[]): string {
  return `<ul>${items.map((item) => `<li>
    <strong>${escapeHtml(item.name)}</strong><br>
    Anbieter: ${escapeHtml(item.provider.name)}<br>
    Preis: ${escapeHtml(String(item.pricePerEvent))} ${escapeHtml(item.priceUnit)}<br>
    ${escapeHtml(item.description)}
  </li>`).join("")}</ul>`;
}

function renderProviderMail(message: BookingRequestMessage, items: MailItem[]): string {
  return `<html><body>
    <h2>Neue Anfrage</h2>
    <p>Für den Zeitraum <strong>${escapeHtml(formatDateRange(message))}</strong> ist eine neue Anfrage eingegangen.</p>
    <p>Name: ${escapeHtml(message.customer.name)}<br>
    E-Mail: ${escapeHtml(message.customer.email)}<br>
    Telefon: ${escapeHtml(message.customer.phone)}<br>
    Veranstaltung: ${escapeHtml(message.eventType || "–")}<br>
    Gäste: ${escapeHtml(message.guestCount || "–")}</p>
    <p>Nachricht: ${escapeHtml(message.message || "–")}</p>
    <h3>Angefragte Leistungen</h3>
    ${renderItems(items)}
  </body></html>`;
}

function renderCustomerMail(message: BookingRequestMessage): string {
  return `<html><body>
    <h2>Ihre Anfrage bei ISEvents</h2>
    <p>Vielen Dank für Ihre Anfrage. Wir haben die ausgewählten Anbieter informiert.</p>
    <p>Zeitraum: <strong>${escapeHtml(formatDateRange(message))}</strong></p>
    <h3>Ihre Auswahl</h3>
    ${renderItems(message.items)}
  </body></html>`;
}

export async function mailWorker(queueEntry: unknown, context: InvocationContext): Promise<void> {
  const message = parseMessage(queueEntry);
  const supabase = createClient(requiredSetting("SUPABASE_URL"), requiredSetting("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: requestRow, error: readError } = await supabase
    .from("BookingRequests")
    .select("processing_status")
    .eq("id", message.bookingRequestId)
    .single();
  if (readError) throw new Error(`Booking request could not be read: ${readError.message}`);
  if (requestRow.processing_status === "Completed") {
    context.log(`Booking request ${message.bookingRequestId} was already processed`);
    return;
  }

  const { error: processingError } = await supabase
    .from("BookingRequests")
    .update({ processing_status: "Processing", updated_at: new Date().toISOString() })
    .eq("id", message.bookingRequestId);
  if (processingError) throw new Error(`Booking request could not be claimed: ${processingError.message}`);

  try {
    const emailClient = new EmailClient(
      requiredSetting("COMMUNICATION_SERVICES_CONNECTION_STRING", "ACS_CONNECTION_STRING")
    );
    const senderAddress = requiredSetting("EMAIL_SENDER", "SENDER_ADDRESS");
    const itemsByProvider = new Map<string, MailItem[]>();
    for (const item of message.items) {
      const providerItems = itemsByProvider.get(item.provider.email) ?? [];
      providerItems.push(item);
      itemsByProvider.set(item.provider.email, providerItems);
    }

    const sends = [...itemsByProvider.entries()].map(async ([email, items]) => {
      const poller = await emailClient.beginSend({
        senderAddress,
        recipients: { to: [{ address: email }] },
        content: { subject: "ISEvents – Neue Anfrage", html: renderProviderMail(message, items) },
      });
      const result = await poller.pollUntilDone();
      if (result.status !== "Succeeded") {
        throw new Error(`Provider email failed: ${result.error?.message ?? result.status}`);
      }
    });

    sends.push((async () => {
      const poller = await emailClient.beginSend({
        senderAddress,
        recipients: { to: [{ address: message.customer.email }] },
        content: { subject: "ISEvents – Ihre Anfrage", html: renderCustomerMail(message) },
      });
      const result = await poller.pollUntilDone();
      if (result.status !== "Succeeded") {
        throw new Error(`Customer email failed: ${result.error?.message ?? result.status}`);
      }
    })());

    await Promise.all(sends);

    const { error: completedError } = await supabase
      .from("BookingRequests")
      .update({ processing_status: "Completed", updated_at: new Date().toISOString() })
      .eq("id", message.bookingRequestId);
    if (completedError) throw new Error(`Booking request could not be completed: ${completedError.message}`);
  } catch (error) {
    await supabase
      .from("BookingRequests")
      .update({ processing_status: "Failed", updated_at: new Date().toISOString() })
      .eq("id", message.bookingRequestId);
    context.error(error);
    throw error;
  }
}

app.storageQueue("mailWorker", {
  queueName: process.env.MAIL_QUEUE_NAME ?? "mail-requests",
  connection: "AzureWebJobsStorage",
  handler: mailWorker,
});
