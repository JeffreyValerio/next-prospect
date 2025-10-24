"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Calendar
} from "lucide-react"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

export const RecentActivity = () => {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects
  // Obtener los últimos 5 prospectos creados o actualizados
  const recentProspects = [...(prospects || [])]
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateB.getTime() - dateA.getTime()
    })
    .slice(0, 7)


  // Función para obtener el color del badge según la respuesta
  const getResponseColor = (response: string) => {
    switch (response) {
      case "Venta realizada":
        return "bg-green-100 text-green-800 border-green-200"
      case "No está interesado":
        return "bg-red-100 text-red-800 border-red-200"
      case "Está interesado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Llamar después":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Sin tipificar":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Función para formatear la fecha relativa
  const formatRelativeTime = (date: string | number) => {
    const now = new Date()
    const prospectDate = new Date(date)
    const diffInMs = now.getTime() - prospectDate.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return "Hace un momento"
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`
    if (diffInHours < 24) return `Hace ${diffInHours} h`
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    return prospectDate.toLocaleDateString('es-ES')
  }

  // Función para obtener las iniciales del usuario
  const getUserInitials = (assignedTo: string) => {
    if (!assignedTo) return "NA"
    const parts = assignedTo.split(" ")
    return parts.map(part => part[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <Card className="h-full flex flex-col border-l-4 border-l-gray-300 dark:border-l-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Calendar className="h-5 w-5 dark:text-gray-300" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {recentProspects.length > 0 ? (
            recentProspects.map((prospect) => (
              <div key={prospect.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                {/* Avatar del usuario asignado */}
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-blue-500 dark:bg-blue-600 text-white text-xs">
                    {getUserInitials(prospect.assignedTo || "")}
                  </AvatarFallback>
                </Avatar>

                {/* Contenido de la actividad */}
                <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                             {prospect.firstName.charAt(0).toUpperCase() + prospect.firstName.slice(1).toLowerCase()} {prospect.lastName.charAt(0).toUpperCase() + prospect.lastName.slice(1).toLowerCase()}
                           </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-1 py-0 ${getResponseColor(prospect.customerResponse || "Sin tipificar")}`}
                    >
                      {prospect.customerResponse === "Venta realizada" ? "Venta" :
                       prospect.customerResponse === "No está interesado" ? "No interesado" :
                       prospect.customerResponse === "Está interesado" ? "Interesado" :
                       prospect.customerResponse === "Llamar después" ? "Callback" :
                       "Sin respuesta"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatRelativeTime(prospect.date)}</span>
                    <span>•</span>
                           <span className="truncate">
                             {prospect.assignedTo ? 
                               prospect.assignedTo.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ') : 
                               "Sin asignar"
                             }
                           </span>
                  </div>
                </div>

                {/* Indicador de estado */}
                <div className="flex-shrink-0">
                  {prospect.customerResponse === "Venta realizada" && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {prospect.customerResponse === "No está interesado" && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                  {prospect.customerResponse === "Está interesado" && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  {prospect.customerResponse === "Llamar después" && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                  {(!prospect.customerResponse || prospect.customerResponse === "Sin tipificar") && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm">No hay actividad reciente</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
