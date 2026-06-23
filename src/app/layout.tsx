import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EA Calendar — School Notice Calendar",
  description:
    "Upload school notices and convert them into organised calendar events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-dim font-[family-name:var(--font-inter)] text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
