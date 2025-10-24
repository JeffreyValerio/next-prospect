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
  const interested = prospects.filter(p => p.customerResponse === "Está interesado").length

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

         // Calcular prospectos expirados (solo los que no tienen tipificación y han pasado 20 minutos)
         const expiredProspects = isClient ? prospects.filter(p => {
           // Solo considerar expirados si no tienen tipificación
           if (p.customerResponse && p.customerResponse !== "Sin tipificar") return false
           
           // Si no tienen fecha de asignación, considerar expirados
           if (!p.assignedAt) return true
           
           const assignedDate = new Date(p.assignedAt)
           const expiration = assignedDate.getTime() + 20 * 60 * 1000 // 20 minutos
           return Date.now() > expiration
         }).length : 0

  const stats = [
    {
      title: isAdmin ? "Total Prospectos" : "Mis Prospectos",
      value: totalProspects,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      change: prospectsLast7Days,
      changeLabel: "últimos 7 días"
    },
    {
      title: isAdmin ? "Ventas Realizadas" : "Mis Ventas",
      value: sales,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      change: conversionRate || 0,
      changeLabel: "tasa de conversión"
    },
    {
      title: isAdmin ? "Usuarios Activos" : "Mi Rendimiento",
      value: isAdmin ? totalUsers : (conversionRate || 0),
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      change: null,
      changeLabel: isAdmin ? "asignando prospectos" : "tasa de conversión"
    },
    {
      title: isAdmin ? "Prospectos Expirados" : "Mis Prospectos Expirados",
      value: expiredProspects,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      change: null,
      changeLabel: "requieren atención"
    },
    {
      title: isAdmin ? "Tasa de Respuesta" : "Mi Tasa de Respuesta",
      value: responseRate,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      change: null,
      changeLabel: "prospectos contactados"
    },
    {
      title: isAdmin ? "Prospectos Interesados" : "Mis Prospectos Interesados",
      value: interested,
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
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.borderColor} border-l-4 hover:shadow-md transition-shadow duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
            <CardTitle className="text-xs font-medium text-gray-600 truncate">
              {stat.title}
            </CardTitle>
            <div className={`p-1.5 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-3 w-3 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-gray-900 mb-1">
              {stat.value.toLocaleString()}
              {stat.title === "Tasa de Respuesta" && "%"}
            </div>
            <div className="flex items-center gap-1">
              {stat.change !== null && (
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
              <span className="text-xs text-gray-500 truncate">
                {stat.changeLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
