import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "KCET College Finder 2026 — Predict Colleges by Rank, Branch & 2025 Cutoffs",
    template: "%s · KCET College Finder",
  },
  description:
    "Free KCET college predictor for Karnataka CET 2026. Enter your KCET rank and category to instantly find engineering colleges you can get, with genuine KEA 2025 round-wise closing ranks (Rounds 1–3), branch explorer and side-by-side college compare.",
  keywords: [
    "KCET 2026",
    "KCET 2025 cutoff",
    "KCET cutoff 2025",
    "KCET college predictor",
    "KCET college finder",
    "KCET rank wise colleges",
    "Karnataka CET",
    "KEA cutoff 2025",
    "KCET 2025 cutoff rank",
    "engineering college predictor Karnataka",
    "KCET option entry colleges",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "kousthubha.me", url: "https://kousthubha.me" }],
  creator: "kousthubha.me",
  publisher: "kousthubha.me",
  category: "education",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "KCET College Finder 2026 — Predict Colleges by Rank & Branch",
    description:
      "Enter your KCET rank & category — instantly see which Karnataka engineering colleges and branches you can get, with genuine KEA 2025 cutoffs (Rounds 1–3).",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KCET College Finder 2026",
    description:
      "Find Karnataka engineering colleges by your KCET rank — genuine KEA 2025 cutoffs, Rounds 1–3.",
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description:
        "Predict Karnataka engineering colleges by your KCET rank with genuine KEA 2025 cutoffs.",
      inLanguage: "en-IN",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/colleges?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased flex flex-col text-foreground">
        <Navbar />
        <main className="flex-1 pb-24 sm:pb-0">{children}</main>
        <Footer />
        <JsonLd data={siteJsonLd} />
        <Analytics />
      </body>
    </html>
  );
}
