import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Backdrop } from "@/components/layout/backdrop";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InsurePlus — Enterprise Insurance Platform",
    template: "%s · InsurePlus",
  },
  description:
    "Protect what matters most. Health, Life, Motor, Travel and Home insurance with instant quotes, digital policies and 99% claim settlement.",
  keywords: ["insurance", "health insurance", "life insurance", "motor", "travel", "home"],
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Backdrop />
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
