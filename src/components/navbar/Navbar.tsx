'use client'

import { Logo } from "../shared/Logo";
import { SignedOut, SignInButton, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { GlobalSearch } from "../shared/GlobalSearch";
import { DailyMotivation } from "../shared/DailyMotivation";
import { useGlobalData } from "@/contexts/GlobalDataContext";

export const Navbar = () => {
  const { user } = useUser();
  const { prospects, users } = useGlobalData();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 w-full z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200" />
          
          {/* Separador visual */}
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
          
          {/* Logo */}
          <Logo />
        </div>

        {/* Centro - Búsqueda global */}
        <div className="flex-1 max-w-md mx-8">
          <GlobalSearch prospects={prospects} users={users} />
        </div>

        {/* Lado derecho */}
        <nav className="flex items-center gap-3">
          {/* Notificaciones */}
          <SignedIn>
            <DailyMotivation />
            {/* Separador */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

            {/* Información del usuario */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              
              {/* Avatar del usuario */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-600 transition-colors duration-200"
                  }
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <SignInButton>
              <Button variant="default" size="sm">
                Iniciar Sesión
              </Button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </div>
  );
};