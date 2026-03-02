import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "TRIPLE PLANCK — Quest List",
  description: "Pixel art todo list. Log in and conquer your quests.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
