import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import { EventItem } from "./types";

function getDayCount(dateFrom: string, dateTo: string): number {
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  const diffTime = Math.abs(to.getTime() - from.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
}

export async function sendMail(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as {
            email: string;
            messageHeader: string;
            messageBody: string;
            dateRange: string;
            items: EventItem[];
        };

        const connectionString = process.env.ACS_CONNECTION_STRING;

        if (!connectionString) {
            throw new Error("ACS_CONNECTION_STRING missing");
        }

        const client = new EmailClient(connectionString);
        const bodyContent = `
            <html>
                <body>
                    <h2>${body.messageHeader}</h2>
                    <p>${body.messageBody}</p>
                    <h3>Ihre Auswahl:</h3>
                    <ul>
                        ${body.items
                            .map(item => `<li>
                                Name: ${item.name} 
                                <br />
                                Anbieter: ${item.provider.name}
                                <br />
                                Preis: ${item.pricePerEvent} ${item.priceUnit}
                                <br />
                                Beschreibung: ${item.description}
                                </li>`)
                            .join("")}
                    </ul>
                </body>
            </html>
        `;

        console.log("Sending email to:", body.email);
        console.log("Email content:", bodyContent);

        const poller = await client.beginSend({
            senderAddress: process.env.SENDER_ADDRESS!,
            recipients: {
                to: [
                    {
                        address: body.email
                    }
                ]
            },
            content: {
                subject: "ISEvents - Neue Anfrage",
                html: bodyContent
            }
        });

        const result = await poller.pollUntilDone();

        return {
            status: 200,
            jsonBody: result
        };

    } catch (err: any) {
        context.error(err);
        return {
            status: 500,
            jsonBody: {
                error: err.message
            }
        };
    }
}

app.http("sendMail", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: sendMail
});