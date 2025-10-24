'use client'

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  const pathname = usePathname()
  
  // Generar breadcrumbs automáticamente basado en la ruta
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', href: '/dashboard' }
    ]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const isLast = index === paths.length - 1
      
      // Mapear rutas a etiquetas más amigables
      const labelMap: Record<string, string> = {
        'dashboard': 'Dashboard',
        'prospects': 'Prospectos',
        'users': 'Usuarios',
        'reports': 'Reportes',
        'settings': 'Configuración',
        'help': 'Ayuda'
      }
      
      breadcrumbs.push({
        label: labelMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        href: currentPath,
        isActive: isLast
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbs = items || generateBreadcrumbs()
  
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link 
        href="/dashboard" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((item) => (
        <div key={item.href} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.isActive ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
