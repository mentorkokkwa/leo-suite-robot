import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusBot AI",
  description: "School service robot navigation simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
