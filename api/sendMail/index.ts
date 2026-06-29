import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { EmailClient } from "@azure/communication-email";
import { EventItem } from "../../src/app/types";

export async function sendMail(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    try {

        const body = await request.json() as {
            email: string;
            items: EventItem[];
        };

        const connectionString = process.env.ACS_CONNECTION_STRING;

        if (!connectionString) {
            throw new Error("ACS_CONNECTION_STRING missing");
        }

        const client = new EmailClient(connectionString);

        const html = `
            <html>
                <body>
                    <h2>Neue Anfrage</h2>

                    <ul>
                        ${body.items
                            .map(item => `<li>${item.name}</li>`)
                            .join("")}
                    </ul>

                </body>
            </html>
        `;

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
                plainText: "Neue Anfrage",
                html
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