import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { NextAuthProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "Cook's Profile",
  description: "Cook's Profile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <NextAuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
