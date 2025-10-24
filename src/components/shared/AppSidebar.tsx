'use client'

import { LayoutDashboard, UserCog, Users, LogOut, Moon, Sun } from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTheme } from "@/contexts/ThemeContext"

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const { theme, toggleTheme } = useTheme()
  
  const mainItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      description: "Vista general"
    },
    {
      title: "Prospectos",
      url: "/prospects",
      icon: Users,
      description: "Gestionar prospectos"
    },
  ]

  const adminItems = isAdmin ? [
    {
      title: "Usuarios",
      url: "/users",
      icon: UserCog,
      description: "Gestión de usuarios"
    },
  ] : []

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <SidebarHeader className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">NextProspect</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sistema de gestión</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className="w-full justify-start gap-3 px-5 py-5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{item.description}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navegación de administración */}
        {adminItems.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className="w-full justify-start gap-3 px-5 py-5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{item.description}</p>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-3">
          {/* Información del usuario */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-900">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-500 dark:bg-blue-600 text-white text-xs">
                {isAdmin ? 'AD' : 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Usuario Actual
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isAdmin ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </div>

          {/* Botón de cerrar sesión */}
          <SignOutButton>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </SignOutButton>

          {/* Botón de cambio de tema */}
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-200"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4" />
                <span>Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                <span>Modo Oscuro</span>
              </>
            )}
          </Button>

          {/* Versión */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              NextProspect v2.1.0
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
