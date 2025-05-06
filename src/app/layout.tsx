import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ClerkProvider } from '@clerk/nextjs'
import { poppins } from "@/config/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        /> 
        <body className={`${poppins.className} antialiased`}>
          {children}
          <SpeedInsights/>
        </body>
      </html>
    </ClerkProvider>
  ); 
}
