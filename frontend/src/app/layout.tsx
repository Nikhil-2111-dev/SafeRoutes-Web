import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConfigureAmplifyClientSide from '@/components/ConfigureAmplifyClientSide';
import Navigation from "@/components/Navigation";
import { AuthProvider } from "@/context/AuthContext";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "SafeRoute",
  description: "Navigate Your City with Confidence",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ConfigureAmplifyClientSide />
        <AuthProvider>
          <GoogleMapsProvider>
            <Navigation />
            {children}
          </GoogleMapsProvider>
        </AuthProvider>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#050B14',
              color: '#00F2FE',
              border: '1px solid rgba(0, 242, 254, 0.2)',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.1)',
              fontFamily: 'monospace',
              fontSize: '14px',
              letterSpacing: '1px'
            },
            success: {
              iconTheme: {
                primary: '#00F2FE',
                secondary: '#050B14',
              },
            },
            error: {
              style: {
                background: '#050B14',
                color: '#FF2A5F',
                border: '1px solid rgba(255, 42, 95, 0.3)',
                boxShadow: '0 0 20px rgba(255, 42, 95, 0.15)',
                fontFamily: 'monospace',
                fontSize: '14px',
                letterSpacing: '1px'
              },
              iconTheme: {
                primary: '#FF2A5F',
                secondary: '#050B14',
              },
            }
          }}
        />
      </body>
    </html>
  );
}
