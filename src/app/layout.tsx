import type { Metadata } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AccessibilityProvider } from "@/components/AccessibilityProvider";

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
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('amor-fati-theme');var r=t;if(!t||t==='system'){r=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}if(r==='dark'){document.documentElement.removeAttribute('data-theme')}else{document.documentElement.setAttribute('data-theme','light')}}catch(e){}` }} />
      </head>
      <body className="min-h-full w-full flex flex-col antialiased">
        <ThemeProvider>
          <AccessibilityProvider>
            <ServiceWorkerRegister />
            {children}
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
