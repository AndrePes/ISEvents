# ISEvents

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-blue)
![Build](https://img.shields.io/badge/build-Vite-646CFF)
![Cloud](https://img.shields.io/badge/cloud-Microsoft%20Azure-0078D4)
![Database](https://img.shields.io/badge/database-Supabase%20PostgreSQL-3ECF8E)
![License](https://img.shields.io/badge/license-TBD-lightgrey)

**ISEvents** is a regional marketplace platform for event equipment and services. It connects private customers and businesses with local providers through one centralized system.

Instead of contacting multiple providers individually, customers can submit a single request describing the equipment or services they need. ISEvents can then route this request to suitable regional providers, allowing them to respond with availability and offers.

The platform initially focuses on the **Isenbüttel and Gifhorn region in Germany**, while the technical architecture is designed with future regional expansion and scalability in mind.

---

## ✨ Features

ISEvents is designed to provide a simple and centralized workflow for both customers and event service providers.

Current and planned features include:

- Centralized requests for event equipment and services
- Distribution of customer requests to multiple suitable providers
- Provider-specific request and booking management
- Status tracking for booking requests
- Email communication with providers
- Regional provider marketplace
- Customer and provider authentication
- Provider availability and calendar integration
- iCal / calendar subscription support
- AI-powered conversational booking assistant
- Intelligent matching between customer requests and providers
- Scalable cloud-based backend architecture

Example customer request:

> "I need a popcorn machine for my birthday party on September 1, 2026."

In the future, requests like this can be processed through an integrated AI assistant that extracts relevant information such as the requested equipment, event date, location, and additional requirements.

---

## 🛠 Tech Stack

### Frontend

- **TypeScript**
- **React**
- **Vite**
- **Azure Static Web Apps**

### Backend

- **Azure Functions**
- TypeScript-based serverless APIs
- Central business logic and request processing

### Database & Data Services

- **Supabase Cloud**
- **PostgreSQL**
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)
- Supabase Realtime where required

### Communication

- **Azure Communication Services**
- **Azure Communication Services Email**

### DevOps & Hosting

- **GitHub**
- **GitHub Actions**
- CI/CD deployment
- **Microsoft Azure**

### AI & Future Services

- Microsoft Azure AI services
- Conversational booking assistant
- Natural-language request processing
- AI-assisted provider and equipment matching

---

## 🏗 Architecture Overview

The architecture follows a cloud-native approach with a clear separation between frontend, backend business logic, and persistence.

```text
                        ┌──────────────────────┐
                        │      Customer        │
                        │   Web / AI Chatbot   │
                        └──────────┬───────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │   React + TypeScript     │
                    │          Vite            │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Azure Static Web Apps    │
                    └──────────┬───────────────┘
                               │
                               │ HTTPS / REST API
                               ▼
                     ┌─────────────────────────┐
                     │    Azure Functions      │
                     │                         │
                     │  API & Business Logic   │
                     └───────┬────────┬────────┘
                             │        │
                   ┌─────────┘        └──────────┐
                   │                             │
                   ▼                             ▼
        ┌──────────────────────┐      ┌────────────────────────┐
        │      Supabase        │      │ Azure Communication    │
        │                      │      │ Services               │
        │ PostgreSQL           │      │                        │
        │ Auth                 │      │ Email                  │
        │ Storage              │      └────────────────────────┘
        │ RLS / Realtime       │
        └──────────────────────┘
```

Azure Functions act as the central API and business-logic layer. The frontend does not need to contain sensitive business processes or credentials and communicates with backend services through defined APIs.

Supabase provides the central PostgreSQL database and supporting data services, while Microsoft Azure is responsible for application hosting, backend processing, communication services, and future AI workloads.

---

## 🔄 Example Request Flow

A simplified booking request can follow this workflow:

```text
Customer
   │
   │ Creates request
   ▼
ISEvents Frontend
   │
   ▼
Azure Function API
   │
   ├── Validate request
   ├── Store booking request
   ├── Find suitable providers
   ├── Create provider requests
   └── Send notifications
          │
          ▼
Azure Communication Services
          │
          ▼
      Providers
```

The booking request itself is stored in Supabase and can move through different lifecycle states, for example:

```text
New
 │
 ▼
Open
 │
 ▼
AwaitResponse
 │
 ▼
Completed
```

This approach keeps request processing asynchronous and allows additional workflows such as provider responses, reminders, availability checks, or notifications to be added later.

---

## 🤖 AI-Powered Booking Assistant

A future core feature of ISEvents is a conversational assistant integrated directly into the customer experience.

Instead of navigating through multiple forms, customers will be able to describe their event requirements using natural language.

For example:

```text
Customer:
"I need a popcorn machine and a small sound system
for a birthday party on September 1, 2026."
```

The assistant can transform this message into structured booking information:

```json
{
  "eventDate": "2026-09-01",
  "equipment": [
    "Popcorn Machine",
    "Sound System"
  ],
  "eventType": "Birthday Party"
}
```

The structured request can then be processed by the existing Azure Functions backend and matched with suitable providers.

---

## 🎯 Project Vision

The long-term goal of ISEvents is to build a digital ecosystem for regional event planning.

Customers should be able to:

- describe what they need,
- discover suitable local providers,
- submit one centralized request,
- receive multiple offers,
- and manage their event requirements from one platform.

Providers should be able to:

- receive qualified regional requests,
- manage availability,
- respond with offers,
- manage bookings,
- and synchronize reservations with their existing calendars.

By combining a regional marketplace with cloud-native technologies and conversational AI, ISEvents aims to make organizing events significantly easier for both customers and local providers.

---

## 🚧 Project Status

ISEvents is currently **under active development**.

The architecture, APIs, database model, booking workflows, provider management, and future AI integration are being developed incrementally.

The current technical direction prioritizes:

- clear separation of concerns,
- scalable cloud infrastructure,
- maintainable TypeScript code,
- secure backend APIs,
- reliable provider communication,
- and an architecture that can evolve as the marketplace grows.