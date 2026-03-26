import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Amor Fati — Stoic Journal",
  description: "A daily practice rooted in Stoic philosophy. Morning intention. Evening reflection. Ancient wisdom for modern life.",
  keywords: ["stoicism", "journaling", "philosophy", "reflection", "mindfulness"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Anti-flash: apply saved theme before React hydration */}
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('amor-fati-theme');if(t==='dark'){document.documentElement.removeAttribute('data-theme')}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){document.documentElement.setAttribute('data-theme','light')}` }} />
      </head>
      <body className="min-h-full w-full flex flex-col antialiased">
        <ThemeProvider>
          <ServiceWorkerRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
