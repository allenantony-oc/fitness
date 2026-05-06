import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fitstack — Free fitness calculators & tools",
    template: "%s · Fitstack",
  },
  description:
    "Fast, accurate fitness calculators: BMI, TDEE, macros, 1RM, body fat, and more. No signup. Mobile-first.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Fitstack — Free fitness calculators",
    description:
      "Fast, accurate fitness calculators. BMI, TDEE, macros, 1RM, body fat. No signup.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
