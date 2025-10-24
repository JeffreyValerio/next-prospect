'use client'

import { Logo } from "../shared/Logo";
import { SignedOut, SignInButton, SignedIn, UserButton, useUser } from "@clerk/nextjs";
import { SidebarTrigger } from "../ui/sidebar";
import { Bell, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { GlobalSearch } from "../shared/GlobalSearch";
import { useGlobalData } from "@/contexts/GlobalDataContext";

export const Navbar = () => {
  const { user } = useUser();
  const { prospects, users } = useGlobalData();
  const isAdmin = user?.publicMetadata?.role === 'admin';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 w-full z-30 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Lado izquierdo */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-gray-100 transition-colors duration-200" />
          
          {/* Separador visual */}
          <div className="h-6 w-px bg-gray-300" />
          
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
            <Button
              variant="ghost"
              size="sm"
              className="relative hover:bg-gray-100 transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>

            {/* Configuración */}
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100 transition-colors duration-200"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Separador */}
            <div className="h-6 w-px bg-gray-300" />

            {/* Información del usuario */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {isAdmin ? 'Administrador' : 'Usuario'}
                </p>
              </div>
              
              {/* Avatar del usuario */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8 border-2 border-gray-200 hover:border-blue-500 transition-colors duration-200"
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