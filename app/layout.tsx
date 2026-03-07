import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Cook's Profile",
  description: "TCook's Profile",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
