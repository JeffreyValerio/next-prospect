import "./globals.css";

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
        </body>
      </html>
    </ClerkProvider>
  ); 
}
