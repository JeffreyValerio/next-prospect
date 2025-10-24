"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Phone,
  CheckCircle
} from "lucide-react"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

interface DashboardStatsProps {
  isAdmin?: boolean
}

export const DashboardStats = ({ isAdmin = false }: DashboardStatsProps) => {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Memoizar cálculos pesados
  const stats = React.useMemo(() => {
    // Calcular estadísticas
    const totalProspects = prospects.length || 0
    const totalUsers = prospects.reduce((acc, prospect) => {
      if (prospect.assignedTo && !acc.includes(prospect.assignedTo)) {
        acc.push(prospect.assignedTo)
      }
      return acc
    }, [] as string[]).length

    const sales = prospects.filter(p => p.customerResponse === "Venta realizada").length
    const noAnswer = prospects.filter(p => p.customerResponse === "Sin tipificar").length
    const interested = prospects.filter(p => p.customerResponse === "Interesado en información").length

    // Calcular tasas
    const conversionRate = totalProspects > 0 ? (sales / totalProspects * 100) : 0
    const responseRate = totalProspects > 0 ? ((totalProspects - noAnswer) / totalProspects * 100) : 0

    // Calcular prospectos por día (últimos 7 días)
    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const prospectsLast7Days = prospects.filter(p => {
      const prospectDate = new Date(p.date)
      return prospectDate >= last7Days
    }).length

    // Calcular prospectos expirados (solo los que están asignados, sin tipificar y han pasado 30 minutos)
    const expiredProspects = isClient ? prospects.filter(p => {
      // Solo considerar expirados si están asignados
      if (!p.assignedTo || p.assignedTo === "Sin asignar") return false
      
      // Solo considerar expirados si tienen "Sin tipificar"
      if (p.customerResponse && p.customerResponse !== "Sin tipificar") return false
      
      // Si no tienen fecha de asignación, no están expirados todavía
      if (!p.assignedAt) return false
      
      // Solo están expirados si han pasado más de 30 minutos desde la asignación
      const assignedDate = new Date(p.assignedAt)
      const expiration = assignedDate.getTime() + 30 * 60 * 1000 // 30 minutos
      return Date.now() > expiration
    }).length : 0
    
    return {
      totalProspects,
      totalUsers,
      sales,
      noAnswer,
      interested,
      conversionRate,
      responseRate,
      prospectsLast7Days,
      expiredProspects
    }
  }, [prospects, isClient])
  
  const { totalProspects, totalUsers, sales, interested, conversionRate, responseRate, prospectsLast7Days, expiredProspects } = stats

  const statsArray = [
    {
      title: isAdmin ? "Total Prospectos" : "Mis Prospectos",
      value: totalProspects || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      change: prospectsLast7Days,
      changeLabel: "últimos 7 días"
    },
    {
      title: isAdmin ? "Ventas Realizadas" : "Mis Ventas",
      value: sales || 0,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      change: conversionRate || 0,
      changeLabel: "tasa de conversión"
    },
    {
      title: isAdmin ? "Usuarios Activos" : "Mi Rendimiento",
      value: isAdmin ? (totalUsers || 0) : (conversionRate || 0),
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      change: null,
      changeLabel: isAdmin ? "asignando prospectos" : "tasa de conversión"
    },
    {
      title: isAdmin ? "Prospectos Expirados" : "Mis Prospectos Expirados",
      value: expiredProspects || 0,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      change: null,
      changeLabel: "requieren atención"
    },
    {
      title: isAdmin ? "Tasa de Respuesta" : "Mi Tasa de Respuesta",
      value: responseRate || 0,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      change: null,
      changeLabel: "prospectos contactados"
    },
    {
      title: isAdmin ? "Prospectos Interesados" : "Mis Prospectos Interesados",
      value: interested || 0,
      icon: Target,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      change: null,
      changeLabel: "potenciales ventas"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {statsArray.map((stat, index) => (
        <Card key={index} className={`${stat.borderColor} dark:border-gray-700 border-l-4 hover:shadow-md transition-shadow duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
              {stat.title}
            </CardTitle>
            <div className={`p-1.5 rounded-full ${stat.bgColor} dark:bg-gray-800`}>
              <stat.icon className={`h-3 w-3 ${stat.color} dark:text-gray-300`} />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {stat.title.includes("Tasa de Respuesta") ? `${stat.value.toFixed(1)}%` : stat.value.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              {typeof stat.change === 'number' && (
                <Badge 
                  variant={stat.change >= 0 ? "default" : "destructive"}
                  className="text-xs px-1 py-0"
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="h-2 w-2 mr-1" />
                  ) : (
                    <TrendingDown className="h-2 w-2 mr-1" />
                  )}
                  {stat.change.toFixed(1)}
                </Badge>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {stat.changeLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
