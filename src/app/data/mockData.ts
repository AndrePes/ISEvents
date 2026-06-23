import { EventItem } from "../types";

// Booked dates are relative to today (March 25, 2026)
// These simulate existing reservations in the database

export const MOCK_ITEMS: EventItem[] = [
  {
    id: "1",
    name: "Premium Festzelt",
    category: "Ausstattung",
    subcategory: "Zelt & Überdachung",
    description:
      "Elegantes Festzelt für bis zu 200 Personen, inklusive Seitenteile, Bodenbelag und Beleuchtung. Ideal für Hochzeiten und Firmenfeiern.",
    pricePerEvent: 890,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1768179123386-a86a85f1c35c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "ZeltProfi GmbH",
      email: "info@zeltprofi.de",
      phone: "+49 170 1234567",
    },
    suitableFor: ["Hochzeit", "Firmenfeier", "Jubiläum", "Andere"],
    bookedDates: [
      "2026-03-29",
      "2026-04-04",
      "2026-04-11",
      "2026-04-25",
      "2026-05-09",
    ],
    rating: 4.9,
    reviewCount: 87,
    highlights: [
      "Bis zu 200 Personen",
      "Inkl. Auf- und Abbau",
      "Wetterfest & beheizt",
    ],
  },
  {
    id: "2",
    name: "DJ & Soundanlage",
    category: "Dienstleistung",
    subcategory: "Musik & Entertainment",
    description:
      "Professioneller DJ mit hochwertiger Soundanlage und Lichtshow. Wir sorgen für unvergessliche Stimmung auf Ihrer Veranstaltung.",
    pricePerEvent: 650,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1766111242568-d935ea63f32f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "DJ Sound Service",
      email: "booking@djsound.de",
      phone: "+49 172 9876543",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Andere",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-04",
      "2026-04-11",
      "2026-05-02",
      "2026-05-16",
    ],
    rating: 4.8,
    reviewCount: 134,
    highlights: [
      "Professionelle Lichtshow",
      "Riesige Musikbibliothek",
      "5h Spielzeit inklusive",
    ],
  },
  {
    id: "3",
    name: "Catering Service",
    category: "Dienstleistung",
    subcategory: "Gastronomie",
    description:
      "Erstklassiges Catering mit frisch zubereiteten Speisen. Von Fingerfood bis zum mehrgängigen Menü – wir verwöhnen Ihre Gäste.",
    pricePerEvent: 55,
    priceUnit: "Person",
    image:
      "https://images.unsplash.com/photo-1671612451404-f4f8fc5fe25e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Gourmet Events GmbH",
      email: "catering@gourmet-events.de",
      phone: "+49 89 12345678",
    },
    suitableFor: [
      "Hochzeit",
      "Firmenfeier",
      "Jubiläum",
      "Taufe / Kommunion",
      "Andere",
    ],
    bookedDates: [
      "2026-04-05",
      "2026-04-12",
      "2026-04-18",
      "2026-05-02",
      "2026-05-23",
    ],
    rating: 4.7,
    reviewCount: 209,
    highlights: [
      "Frische Zutaten",
      "Vegetarische Optionen",
      "Service-Personal inklusive",
    ],
  },
  {
    id: "4",
    name: "Blumen & Floristik",
    category: "Ausstattung",
    subcategory: "Dekoration",
    description:
      "Wunderschöne Blumenarrangements für jeden Anlass. Tischgestecke, Brautsträuße, Raumdekoration – alles nach Ihren Wünschen.",
    pricePerEvent: 380,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1773609689096-5543f8dfa532?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Blumen Atelier Rosa",
      email: "info@blumen-rosa.de",
      phone: "+49 171 3456789",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Jubiläum",
      "Taufe / Kommunion",
      "Andere",
    ],
    bookedDates: [
      "2026-03-29",
      "2026-04-18",
      "2026-04-25",
      "2026-05-09",
      "2026-05-30",
    ],
    rating: 5.0,
    reviewCount: 62,
    highlights: [
      "Individuelle Gestaltung",
      "Saisonale Blumen",
      "Aufbau inklusive",
    ],
  },
  {
    id: "5",
    name: "LED-Bühnenbeleuchtung",
    category: "Ausstattung",
    subcategory: "Beleuchtung & Technik",
    description:
      "Professionelle LED-Beleuchtungsanlage mit Lichteffekten und programmierbaren Shows. Verwandeln Sie jeden Raum in eine Bühne.",
    pricePerEvent: 480,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1765278248871-1d574fb1392d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "LightShow Technik",
      email: "kontakt@lightshow.de",
      phone: "+49 160 5678901",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Abschlussfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-03-29",
      "2026-04-11",
      "2026-04-25",
      "2026-05-16",
      "2026-05-30",
    ],
    rating: 4.6,
    reviewCount: 45,
    highlights: [
      "Farbwechsel-Effekte",
      "Inkl. Techniker",
      "Bis zu 500 qm Fläche",
    ],
  },
  {
    id: "6",
    name: "Bestuhlung & Mobiliar",
    category: "Ausstattung",
    subcategory: "Möbel & Ausstattung",
    description:
      "Elegante Stühle, Tische und Stehtische für Ihre Veranstaltung. Verschiedene Stile verfügbar: klassisch, modern, rustikal.",
    pricePerEvent: 14,
    priceUnit: "Stück",
    image:
      "https://images.unsplash.com/photo-1727931301188-55b23fa9672e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "EventMöbel Verleih",
      email: "info@eventmoebel.de",
      phone: "+49 89 23456789",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Taufe / Kommunion",
      "Weihnachtsfeier",
      "Andere",
    ],
    bookedDates: ["2026-04-05", "2026-05-02"],
    rating: 4.5,
    reviewCount: 178,
    highlights: ["3 Designstile", "Lieferung & Abholung", "Bis 300 Stück"],
  },
  {
    id: "7",
    name: "Fotobox mit Prints",
    category: "Dienstleistung",
    subcategory: "Foto & Video",
    description:
      "Interaktive Fotobox mit sofortigen Ausdrucken und digitaler Galerie. Inkl. Requisiten und individuellem Branding.",
    pricePerEvent: 420,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1749016751318-e676cd01e8dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "FotoBox Party",
      email: "hallo@fotobox-party.de",
      phone: "+49 176 8901234",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-04-05",
      "2026-04-12",
      "2026-04-18",
      "2026-05-16",
      "2026-05-23",
    ],
    rating: 4.9,
    reviewCount: 203,
    highlights: [
      "Sofort-Prints",
      "Digitale Galerie",
      "Individuelle Designs",
    ],
  },
  {
    id: "8",
    name: "Sicherheitsdienst",
    category: "Dienstleistung",
    subcategory: "Sicherheit & Ordnung",
    description:
      "Professioneller Sicherheitsdienst für Ihre Veranstaltung. Geprüfte Sicherheitskräfte sorgen für einen reibungslosen Ablauf.",
    pricePerEvent: 290,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1764173038831-3ef384e6321e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "SecureEvent GmbH",
      email: "einsatz@secure-event.de",
      phone: "+49 89 34567890",
    },
    suitableFor: [
      "Firmenfeier",
      "Weihnachtsfeier",
      "Abschlussfeier",
      "Andere",
    ],
    bookedDates: ["2026-04-11", "2026-04-25", "2026-05-09"],
    rating: 4.7,
    reviewCount: 56,
    highlights: ["Zertifizierte Kräfte", "Einlass-Management", "24/7 erreichbar"],
  },
  {
    id: "9",
    name: "Hochzeitsdekoration Komplett",
    category: "Ausstattung",
    subcategory: "Dekoration",
    description:
      "Komplettes Hochzeitsdekorationspaket: Tischdekorationen, Raumschmuck, Lichterketten, Kernen und individuelle Aufsteller.",
    pricePerEvent: 980,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1760669348993-54637f59b59e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Wedding Dreams",
      email: "info@wedding-dreams.de",
      phone: "+49 172 2345678",
    },
    suitableFor: ["Hochzeit", "Jubiläum", "Taufe / Kommunion"],
    bookedDates: [
      "2026-03-29",
      "2026-04-05",
      "2026-04-18",
      "2026-04-25",
      "2026-05-02",
      "2026-05-16",
      "2026-05-23",
      "2026-05-30",
    ],
    rating: 5.0,
    reviewCount: 91,
    highlights: [
      "Komplettpaket",
      "Individuelle Gestaltung",
      "Aufbau & Abbau inklusive",
    ],
  },
  {
    id: "10",
    name: "Moderation & Entertainment",
    category: "Dienstleistung",
    subcategory: "Musik & Entertainment",
    description:
      "Erfahrener Moderator und Entertainer für Ihre Feier. Animationen, Spiele, Showeinlagen und professionelle Moderation.",
    pricePerEvent: 580,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1764726354430-1b85fa37234f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "ShowTime Events",
      email: "kontakt@showtime-events.de",
      phone: "+49 160 6789012",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Weihnachtsfeier",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-04",
      "2026-04-18",
      "2026-05-09",
      "2026-05-30",
    ],
    rating: 4.8,
    reviewCount: 72,
    highlights: ["Individuelle Show", "Spiele & Animationen", "Profi-Moderator"],
  },
  {
    id: "11",
    name: "Kinderbetreuung & Spielecke",
    category: "Dienstleistung",
    subcategory: "Kinderbetreuung",
    description:
      "Professionelle Kinderbetreuung mit geschultem Personal, Spielen, Basteln und einer sicheren Spielecke für die kleinen Gäste.",
    pricePerEvent: 390,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1553602870-e8a48bd4cd12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "KidsEvent Service",
      email: "info@kids-event.de",
      phone: "+49 171 4567890",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Taufe / Kommunion",
      "Andere",
    ],
    bookedDates: ["2026-04-05", "2026-04-25", "2026-05-23"],
    rating: 4.9,
    reviewCount: 48,
    highlights: [
      "Zertifiziertes Personal",
      "Sicherheitsgeprüfte Spielgeräte",
      "Basteln & Spielen",
    ],
  },
  {
    id: "12",
    name: "Bar & Cocktailservice",
    category: "Dienstleistung",
    subcategory: "Gastronomie",
    description:
      "Mobile Cocktailbar mit ausgebildetem Barkeeper. Alkoholfreie und alkoholische Cocktails, Longdrinks und Sekt-Empfang.",
    pricePerEvent: 520,
    priceUnit: "Event",
    image:
      "https://images.unsplash.com/photo-1768508948990-f5866f800fad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "CocktailArt Events",
      email: "info@cocktailart.de",
      phone: "+49 176 7890123",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Weihnachtsfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-11",
      "2026-05-02",
      "2026-05-16",
    ],
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      "Über 60 Cocktailrezepte",
      "Sekt-Empfang inklusive",
      "Mobile Bar",
    ],
  },
  {
    id: "13",
    name: "Slush-Ice Maschine (ohne Inhalt)",
    category: "Ausstattung",
    subcategory: "Gastronomie",
    description:
      "Slushy Maschine zur Zubereitung von leckeren Shlush-Ice. (ohne Inhalt)",
    pricePerEvent: 35,
    priceUnit: "Tag",
    image:
      "https://images.unsplash.com/photo-1698153767529-457811fa4981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Mieten Mit Schmidt",
      email: "mietenmitschmidt@gmail.com",
      phone: "+491783907558",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Weihnachtsfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-11",
      "2026-05-02",
      "2026-05-16",
    ],
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      "Mit oder ohne Alkohol"
    ],
  },
  {
    id: "14",
    name: "Slush-Ice Maschine (mit Inhalt, Alkoholfrei)",
    category: "Ausstattung",
    subcategory: "Gastronomie",
    description:
      "Slushy Maschine zur Zubereitung von leckeren Shlush-Ice. Inklusive 12L Inhalt. Diverse Geschmacksrichtungen Alkoholfrei: Mandel, Blue curacao, Erdbeere,Karamell,Cocos,Mango, Maracuja, Pfirsich",
    pricePerEvent: 85,
    priceUnit: "Tag",
    image:
      "https://images.unsplash.com/photo-1698153767529-457811fa4981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Mieten Mit Schmidt",
      email: "mietenmitschmidt@gmail.com",
      phone: "+491783907558",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Weihnachtsfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-11",
      "2026-05-02",
      "2026-05-16",
    ],
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      "Mit 12L alkholofreien Inhalt"
    ],
  },
  {
    id: "15",
    name: "Slush-Ice Maschine (mit Alkohol)",
    category: "Ausstattung",
    subcategory: "Gastronomie",
    description:
      "Slushy Maschine zur Zubereitung von leckeren Shlush-Ice. Diverse Geschmacksrichtungen: Frouso (roter Ouzo von Gia Mas Freunde), Aperol Spritz Slush, Diverse Longdring Slushs",
    pricePerEvent: 135,
    priceUnit: "Tag",
    image:
      "https://images.unsplash.com/photo-1698153767529-457811fa4981?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    provider: {
      name: "Mieten Mit Schmidt",
      email: "mietenmitschmidt@gmail.com",
      phone: "+491783907558",
    },
    suitableFor: [
      "Hochzeit",
      "Geburtstag",
      "Firmenfeier",
      "Jubiläum",
      "Abschlussfeier",
      "Weihnachtsfeier",
      "Andere",
    ],
    bookedDates: [
      "2026-03-28",
      "2026-04-11",
      "2026-05-02",
      "2026-05-16",
    ],
    rating: 4.8,
    reviewCount: 119,
    highlights: [
      "Mit 12L alkohol Inhalt"
    ],
  },
];

export function getAvailableItems(dateFrom: string, dateTo = dateFrom): EventItem[] {
  const [rangeStart, rangeEnd] =
    dateFrom <= dateTo ? [dateFrom, dateTo] : [dateTo, dateFrom];

  return MOCK_ITEMS.filter(
    (item) =>
      !item.bookedDates.some(
        (bookedDate) => bookedDate >= rangeStart && bookedDate <= rangeEnd
      )
  );
}

export function formatDateDE(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}.${month}.${year}`;
}
