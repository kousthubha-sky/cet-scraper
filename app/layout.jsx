import "./globals.css";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  metadataBase: new URL("https://kcet-college-finder.vercel.app"),
  title: {
    default: "KCET College Finder 2026 — Predict colleges by rank & branch",
    template: "%s · KCET College Finder",
  },
  description:
    "Enter your KCET rank and category to instantly find Karnataka engineering colleges you can get. Explore branches, compare colleges, and check last-year cutoffs.",
  keywords: [
    "KCET 2026",
    "KCET college predictor",
    "KCET cutoff",
    "Karnataka CET",
    "engineering college predictor",
    "KEA cutoff",
  ],
  openGraph: {
    title: "KCET College Finder 2026",
    description:
      "Enter your KCET rank & category — instantly see which Karnataka engineering colleges and branches you can get.",
    type: "website",
  },
  icons: { icon: "/favicon.svg" },
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
        <Analytics />
      </body>
    </html>
  );
}
