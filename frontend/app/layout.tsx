import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Travel Agency",
  description: "Sistema de gestion para agencia de viajes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
