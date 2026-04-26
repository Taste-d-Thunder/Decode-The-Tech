import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { TeamProvider } from "@/context/TeamContext";
import { SocketProvider } from "@/context/SocketContext";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Decode The Tech",
  description: "A production-ready platform for hosting automated multi-round tech competitions.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} page-wrapper`}>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <TeamProvider>
                <SocketProvider>
                  {children}
                </SocketProvider>
              </TeamProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
