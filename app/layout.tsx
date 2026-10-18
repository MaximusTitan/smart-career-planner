import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Header } from "@/components/Header";
import { ChatWidget } from "@/components/ChatWidget";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Dream Jobs: find what you could become",
  description:
    "A friendly AI career explorer for kids in Grades 4 to 6. Answer fun questions, meet your career matches and chat with Ollie the owl.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <StoreProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
