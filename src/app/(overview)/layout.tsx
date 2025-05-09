import type { Metadata } from "next";
import { Navbar } from "@/components";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { validateUser } from "@/utils/auth";

export const metadata: Metadata = {
  title: "NextProspect",
  description: "NextProspect project",
};

export const revalidate = 300

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { isAdmin } = await validateUser()

  return (
    <SidebarProvider className="flex h-screen">
      <AppSidebar isAdmin={isAdmin} />

      <div className="flex flex-col w-full">
        <div className="sticky top-0 z-50 flex items-center p-2">
          <Navbar />
        </div>

        <main className="px-2">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
