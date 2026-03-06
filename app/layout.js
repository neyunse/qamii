import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "QAmii - Ask Creators Anything",
  description: "A platform for creators to receive paid anonymous questions from their audience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        <Script
          defer={true}
          src="https://analytics.unsetsoft.com/script.js"
          data-website-id="04684cee-f545-42d1-97c9-cfe5632ad47d"
        />
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}
