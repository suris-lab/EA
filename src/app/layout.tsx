import type { Metadata } from "next";
import "./globals.css";
import NavMenu from "@/components/NavMenu";

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
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NavMenu />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
