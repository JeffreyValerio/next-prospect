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
        <body className={`${poppins.className} antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
