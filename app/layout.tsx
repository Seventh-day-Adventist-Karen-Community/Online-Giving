import type { Metadata, Viewport } from "next";
import MessageProvider from "@components/toast/context";
import { Constants } from "@utils/constants";
import "../styles/globals.css";

const APP_NAME = "Karen Community SDA Giving";
const TITLE = "Give Online | Karen Community SDA";
const DESCRIPTION = "Secure online giving for Karen Community Seventh-day Adventist Church.";

export const metadata: Metadata = {
  metadataBase: new URL(Constants.SITE_URL),
  applicationName: APP_NAME,
  title: { default: TITLE, template: "%s" },
  description: DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: TITLE },
  formatDetection: { telephone: false },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: APP_NAME,
    images: [{ url: "/church.png", width: 800, height: 400 }, { url: "/global-logo.svg" }],
    locale: "en-US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      // { url: "/favicon.svg", type: "image/svg+xml" },
      // { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#800000" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="relative transition-all scroll-smooth bg-slate-50">
        <MessageProvider>{children}</MessageProvider>
      </body>
    </html>
  );
}
