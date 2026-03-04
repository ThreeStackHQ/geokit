import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GeoKit — IP Geolocation & Geo-Blocking API",
  description: "IP geolocation + geo-blocking API for indie SaaS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
