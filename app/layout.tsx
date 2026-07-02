import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexaEstate CRM",
  description: "AI-powered real estate CRM for lead tracking, agent workflows, and n8n webhooks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}