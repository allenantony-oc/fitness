import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
            <div className="container flex max-w-6xl items-center justify-between py-3">
              <span className="text-sm font-semibold tracking-tight">
                Fitstack
              </span>
              <ThemeToggle />
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
