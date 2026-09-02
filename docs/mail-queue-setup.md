# Entkoppelten Mailversand konfigurieren

Der HTTP-Endpunkt `POST /api/sendMail` legt zuerst eine Zeile in
`BookingRequests` an und schreibt danach eine Nachricht in die Storage Queue
`mail-requests`. Er antwortet mit HTTP `202`, sobald die Nachricht angenommen
wurde. Der Queue-Trigger `mailWorker` versendet je Anbieter eine Mail, sendet
die Bestätigung an den Kunden und setzt `processing_status` auf `Completed`.

## 1. Supabase vorbereiten

1. Öffnen Sie im Supabase Dashboard den **SQL Editor**.
2. Führen Sie den Inhalt von
   `supabase/migrations/20260902180000_create_booking_requests.sql` aus. Bei
   Nutzung der Supabase CLI kann die Migration stattdessen mit
   `supabase db push` ausgerollt werden.
3. Öffnen Sie **Project Settings > API Keys** und erstellen bzw. kopieren Sie
   einen serverseitigen Secret Key (`sb_secret_...`). Bei älteren Projekten
   funktioniert weiterhin der Legacy-`service_role`-Key.
4. Hinterlegen Sie URL und Secret ausschließlich in der Function App. Der
   Secret Key darf nicht als `VITE_...`-Variable oder in Frontend-Code landen.

Die Migration ergänzt bewusst die UUID-Spalte `id`. Ohne eine eindeutige ID
kann eine Queue-Nachricht nicht zuverlässig genau einer Datenbankzeile
zugeordnet werden. RLS ist aktiv; `anon` und `authenticated` erhalten keinen
direkten Tabellenzugriff. Die Function greift mit dem serverseitigen Secret
Key zu. Ist im Request ein gültiges Supabase-Bearer-Token enthalten, wird
dessen User-ID als `customer_id` gespeichert, sonst bleibt sie `null`.

Referenz: [Supabase API Keys](https://supabase.com/docs/guides/getting-started/api-keys)
und [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 2. Azure Storage Queue anlegen

1. Erstellen Sie ein Storage Account oder verwenden Sie das Storage Account
   der Function App.
2. Öffnen Sie **Data storage > Queues > + Queue** und legen Sie
   `mail-requests` an. Queue-Namen müssen kleingeschrieben sein.
3. Kopieren Sie unter **Access keys > Connection string** einen Connection
   String. In Produktion sollte der Zugriff nach Möglichkeit über Managed
   Identity/RBAC umgestellt werden; der aktuelle Code nutzt einen Connection
   String.
4. Azure Functions legt nach fünf fehlgeschlagenen Versuchen automatisch die
   Queue `mail-requests-poison` an. Überwachen Sie diese Queue und richten Sie
   dafür einen Azure-Monitor-Alarm ein.

Referenzen: [Queue im Portal erstellen](https://learn.microsoft.com/azure/storage/queues/storage-quickstart-queues-portal)
und [Azure Functions Queue Trigger](https://learn.microsoft.com/azure/azure-functions/functions-bindings-storage-queue-trigger).

## 3. Azure Communication Services Email konfigurieren

1. Erstellen Sie eine **Email Communication Services**-Ressource.
2. Richten Sie eine Azure Managed Domain oder eine eigene Domain ein. Bei einer
   eigenen Domain müssen die im Portal genannten DNS-Einträge verifiziert sein.
3. Verbinden Sie die verifizierte E-Mail-Domain mit der verwendeten
   **Azure Communication Services**-Ressource.
4. Kopieren Sie in der Communication-Services-Ressource unter **Keys** den
   Connection String.
5. Kopieren Sie auf der Domain-Seite die vollständige `MailFrom`-Adresse. Nur
   eine Absenderadresse der verbundenen und verifizierten Domain funktioniert.

Referenzen: [E-Mail-Domain verbinden](https://learn.microsoft.com/azure/communication-services/quickstarts/email/connect-email-communication-resource)
und [eigene Domain verifizieren](https://learn.microsoft.com/azure/communication-services/quickstarts/email/add-custom-verified-domains).

## 4. Function App konfigurieren und deployen

Verwenden Sie Node.js 22 oder neuer und setzen Sie unter
**Function App > Settings > Environment variables** diese App Settings:

| Name | Wert |
| --- | --- |
| `AzureWebJobsStorage` | Storage-Connection-String für Queue und Function Runtime |
| `MAIL_QUEUE_NAME` | `mail-requests` |
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | Supabase Secret Key (`sb_secret_...`) oder Legacy-Service-Role-Key |
| `COMMUNICATION_SERVICES_CONNECTION_STRING` | ACS Connection String |
| `EMAIL_SENDER` | verifizierte vollständige `MailFrom`-Adresse |
| `FUNCTIONS_WORKER_RUNTIME` | `node` |

Anschließend im Verzeichnis `api`:

```bash
npm ci
npm run build
func azure functionapp publish <FUNCTION_APP_NAME>
```

Prüfen Sie nach dem Deployment in der Function App, dass sowohl `sendMail` als
auch `mailWorker` erkannt wurden.

### Wichtig bei Azure Static Web Apps

Eine von Static Web Apps **verwaltete** API unterstützt ausschließlich
HTTP-Trigger und kann `mailWorker` deshalb nicht ausführen. Deployen Sie den
Ordner `api` als eigenständige Azure Function App. Bei einem Static-Web-Apps-
Standard-Plan können Sie diese anschließend unter **Settings > APIs** als
"Bring your own Functions"-Backend verknüpfen. Setzen Sie dann im
Static-Web-Apps-Workflow `api_location: ""`, damit nicht zusätzlich eine
verwaltete API deployed wird. Der bestehende Frontend-Aufruf `/api/sendMail`
funktioniert über die Verknüpfung unverändert.

Ohne Backend-Verknüpfung müssen Sie im Frontend die vollständige Function-URL
verwenden und CORS für die Web-App-Domain konfigurieren. Die Verknüpfung ist
daher für dieses Repository die einfachere Variante.

Referenz: [Eigene Function App mit Static Web Apps verknüpfen](https://learn.microsoft.com/azure/static-web-apps/functions-bring-your-own)
und [Unterschiede der API-Varianten](https://learn.microsoft.com/azure/static-web-apps/apis-functions).

`host.json` verarbeitet pro Instanz bis zu acht Queue-Nachrichten parallel.
Der Consumption- oder Flex-Consumption-Plan kann Queue-Trigger anhand des
Rückstaus horizontal skalieren. Prüfen Sie vor hoher Last die ACS-Versandlimits
und beantragen Sie nötigenfalls eine Erhöhung.

## 5. Lokal testen

Starten Sie Azurite und legen Sie dort die Queue `mail-requests` an. Tragen Sie
in `api/local.settings.json` dieselben Namen ein; die Datei darf nicht committed
werden:

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "MAIL_QUEUE_NAME": "mail-requests",
    "SUPABASE_URL": "https://<project-ref>.supabase.co",
    "SUPABASE_SECRET_KEY": "sb_secret_...",
    "COMMUNICATION_SERVICES_CONNECTION_STRING": "endpoint=https://...;accesskey=...",
    "EMAIL_SENDER": "DoNotReply@<verified-domain>"
  }
}
```

Danach `npm start` im Verzeichnis `api` ausführen und eine Anfrage im Frontend
absenden. Erwarteter Ablauf:

1. `POST /api/sendMail` liefert `202` und eine `bookingRequestId`.
2. Die neue Zeile steht zunächst auf `Pending`, kurz darauf auf `Processing`.
3. Nach erfolgreichem Versand steht sie auf `Completed`.
4. Bei einem Worker-Fehler steht sie während der Wiederholungen auf `Failed`;
   nach Ausschöpfen der Versuche liegt die Nachricht in `mail-requests-poison`.
5. Schlägt bereits das Einreihen fehl, steht die Zeile auf `EnqueueFailed`.

## Betriebshinweise

- Storage Queues liefern Nachrichten mindestens einmal aus. Der Worker
  überspringt bereits abgeschlossene Requests. Bei einem Prozessabbruch nach
  einem Teilversand können einzelne Empfänger bei der Wiederholung dennoch eine
  zweite Mail erhalten. Vollständige Exactly-once-Zustellung erfordert eine
  zusätzliche Mail-Outbox-Tabelle mit einem Status pro Empfänger.
- Die Queue enthält Kontaktdaten. Beschränken Sie Storage-Zugriffe, aktivieren
  Sie Logging ohne Message-Body und definieren Sie eine passende Queue-TTL bzw.
  Lösch- und Datenschutzstrategie.
- Der öffentliche HTTP-Endpunkt sollte produktiv durch Rate Limiting, Bot-Schutz
  und Azure-Monitor-Alarme gegen Missbrauch abgesichert werden.
