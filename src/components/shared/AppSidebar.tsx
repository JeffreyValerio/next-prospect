import { LayoutDashboard, UserCog, Users } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

// Menu items.

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const items = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Prospectos",
      url: "/prospects",
      icon: Users,
    },
    ...(isAdmin
      ? [
        {
          title: "Usuarios",
          url: "/users",
          icon: UserCog,
        },
      ]
      : []),
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <p className='text-xs absolute bottom-0 pl-4 pb-6'>&copy; NextProspect <small>v 1.1.0</small></p>
      </SidebarContent>
    </Sidebar>
  )
}
