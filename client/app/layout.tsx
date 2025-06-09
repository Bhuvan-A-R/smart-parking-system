import "./globals.css";
// import Header from "./components/Header";
import HeaderMaintenance from "./components/Header-Maintenance";


export const metadata = {
  title: "Smart Parking System",
  description: "A modern smart parking management platform",
};

import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          type="image/png"
          href="/android-chrome-192x192.png"
          sizes="192x192"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="bg-[#F1F1F1] text-[#21209C]">
        <HeaderMaintenance />
          <main className="">{children}</main> {/* Render child pages */}
      </body>
    </html>
  );
}
