import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = "https://itadmit.co.il";
const SITE_NAME = "תדמית אינטראקטיב";
const SITE_TITLE =
  "תדמית אינטראקטיב | בניית אתרים, חנויות וירטואליות ועיצוב אתרי אינטרנט";
const SITE_DESCRIPTION =
  "תדמית אינטראקטיב – בונים אתרי אינטרנט מותאמים אישית, חנויות וירטואליות Shopify, אתרי תדמית ודפי נחיתה ממירים. עיצוב UX/UI מוקפד, ביצועים גבוהים וליווי אישי. קבלו הצעת מחיר תוך 30 שניות.";

export const viewport: Viewport = {
  themeColor: "#008069",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | תדמית אינטראקטיב",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "בניית אתרים",
    "עיצוב אתרים",
    "חנות וירטואלית",
    "Shopify",
    "שופיפיי",
    "חנות אונליין",
    "אתר תדמית",
    "דף נחיתה",
    "פיתוח אתרים",
    "עיצוב UX",
    "עיצוב UI",
    "אתרי אינטרנט",
    "קידום אתרים",
    "בניית אתר ל eCommerce",
    "תדמית אינטראקטיב",
    "itadmit",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Web Design & Development",
  applicationName: SITE_NAME,
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "he-IL": SITE_URL,
    },
  },
  openGraph: {
    type: "website",
    locale: "he_IL",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/images/tadmit-logo.png",
        width: 1200,
        height: 630,
        alt: "תדמית אינטראקטיב - בניית אתרים וחנויות וירטואליות",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/tadmit-logo.png"],
    creator: "@tadmit_interactive",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/images/tadmit-logo.png", type: "image/png" },
    ],
    apple: [{ url: "/images/tadmit-logo.png" }],
    shortcut: "/images/tadmit-logo.png",
  },
  other: {
    "google-site-verification": "", // ניתן להזין אימות Google Search Console
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "itadmit",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/tadmit-logo.png`,
        width: 512,
        height: 512,
      },
      image: `${SITE_URL}/images/tadmit-logo.png`,
      description: SITE_DESCRIPTION,
      areaServed: { "@type": "Country", name: "IL" },
      sameAs: [
        "https://instagram.com/tadmit_interactive",
        "https://facebook.com/tadmitinteractive",
      ],
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+972-54-228-4283",
          contactType: "customer support",
          areaServed: "IL",
          availableLanguage: ["Hebrew", "English"],
        },
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#service`,
      name: `${SITE_NAME} — בניית אתרים וחנויות וירטואליות`,
      url: SITE_URL,
      image: `${SITE_URL}/images/tadmit-logo.png`,
      priceRange: "₪₪",
      telephone: "+972-54-228-4283",
      address: { "@type": "PostalAddress", addressCountry: "IL" },
      areaServed: { "@type": "Country", name: "IL" },
      serviceType: [
        "בניית אתרים",
        "עיצוב אתרים",
        "פיתוח חנויות וירטואליות",
        "Shopify",
        "דפי נחיתה",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "he-IL",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className="m-0 p-0">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${heebo.className} m-0 p-0 overflow-x-hidden`}>{children}</body>
    </html>
  );
}
