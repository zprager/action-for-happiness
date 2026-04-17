import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Action for Happiness",
  description: "Join the movement for a happier, kinder world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
