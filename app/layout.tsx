import type { Metadata } from "next";
import { Suspense } from "react";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthGate } from "@/components/AuthGate";
import { Loading } from "@/components/Loading";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Smart Career Planner: find what you could become",
  description:
    "A friendly AI career explorer for students in Grades 1 to 12. Answer fun questions, meet your career matches and chat with Ollie the owl.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <StoreProvider>
            <Header />
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
              {/* AuthGate reads the URL, so it streams in behind Suspense */}
              <Suspense fallback={<Loading />}>
                <AuthGate>{children}</AuthGate>
              </Suspense>
            </main>
            <Footer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
