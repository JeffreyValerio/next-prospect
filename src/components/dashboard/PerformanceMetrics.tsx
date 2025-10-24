"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Target,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  BarChart3
} from "lucide-react"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

interface PerformanceMetricsProps {
  isAdmin?: boolean
}

export const PerformanceMetrics = ({ }: PerformanceMetricsProps) => {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Memoizar cálculos pesados
  const metrics = React.useMemo(() => {
    // Calcular métricas de rendimiento
    const totalProspects = prospects.length || 0
    const sales = prospects.filter(p => p.customerResponse === "Venta realizada").length
    const noAnswer = prospects.filter(p => p.customerResponse === "Sin tipificar").length
    const interested = prospects.filter(p => p.customerResponse === "Está interesado").length
    const callback = prospects.filter(p => p.customerResponse === "Llamar después").length

    // Calcular tasas
    const conversionRate = totalProspects > 0 ? (sales / totalProspects * 100) : 0
    const responseRate = totalProspects > 0 ? ((totalProspects - noAnswer) / totalProspects * 100) : 0
    const interestRate = totalProspects > 0 ? (interested / totalProspects * 100) : 0
    const callbackRate = totalProspects > 0 ? (callback / totalProspects * 100) : 0

    // Calcular prospectos por día (últimos 30 días)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)
    const prospectsLast30Days = prospects.filter(p => {
      const prospectDate = new Date(p.date)
      return prospectDate >= last30Days
    }).length

    // Calcular prospectos por día promedio
    const dailyAverage = prospectsLast30Days / 30

    // Calcular prospectos expirados (solo los que no tienen tipificación y han pasado 30 minutos)
    const expiredProspects = isClient ? prospects.filter(p => {
      // Solo considerar expirados si no tienen tipificación
      if (p.customerResponse && p.customerResponse !== "Sin tipificar") return false
      
      // Si no tienen fecha de asignación, considerar expirados
      if (!p.assignedAt) return true
      
      const assignedDate = new Date(p.assignedAt)
      const expiration = assignedDate.getTime() + 30 * 60 * 1000 // 30 minutos
      return Date.now() > expiration
    }).length : 0

    // Calcular tiempo promedio de respuesta
    const respondedProspects = prospects.filter(p => p.customerResponse && p.customerResponse !== "Sin tipificar")
    const avgResponseTime = respondedProspects.length > 0 ? 
      respondedProspects.reduce((acc, prospect) => {
        if (prospect.assignedAt) {
          const assignedDate = new Date(prospect.assignedAt)
          const responseDate = new Date(prospect.date)
          const diffInMinutes = (responseDate.getTime() - assignedDate.getTime()) / (1000 * 60)
          return acc + diffInMinutes
        }
        return acc
      }, 0) / respondedProspects.length : 0
    
    return {
      conversionRate,
      responseRate,
      interestRate,
      callbackRate,
      dailyAverage,
      expiredProspects,
      avgResponseTime
    }
  }, [prospects, isClient])
  
  const { conversionRate, responseRate, interestRate, callbackRate, dailyAverage, expiredProspects, avgResponseTime } = metrics

  const metricsArray = [
    {
      title: "Tasa de Conversión",
      value: conversionRate,
      target: 15, // 15% objetivo
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Prospectos que se convierten en ventas"
    },
    {
      title: "Tasa de Respuesta",
      value: responseRate,
      target: 80, // 80% objetivo
      icon: Phone,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Prospectos que responden a las llamadas"
    },
    {
      title: "Tasa de Interés",
      value: interestRate,
      target: 25, // 25% objetivo
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Prospectos que muestran interés"
    },
    {
      title: "Tasa de Callback",
      value: callbackRate,
      target: 10, // 10% objetivo
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "Prospectos que requieren seguimiento"
    }
  ]

  const performanceMetrics = [
    {
      title: "Prospectos por Día",
      value: dailyAverage.toFixed(1),
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      description: "Promedio de los últimos 30 días"
    },
    {
      title: "Tiempo Promedio de Respuesta",
      value: `${avgResponseTime.toFixed(0)} min`,
      icon: Clock,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      borderColor: "border-teal-200",
      description: "Tiempo promedio para responder"
    },
    {
      title: "Prospectos Expirados",
      value: expiredProspects,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      description: "Requieren atención inmediata"
    }
  ]

  return (
    <div className="grid gap-6">
             {/* Métricas principales */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
               {metricsArray.map((metric, index) => (
                 <Card key={index} className={`${metric.borderColor} dark:border-gray-700 border-l-4`}>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                     <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                       {metric.title}
                     </CardTitle>
                     <div className={`p-1.5 rounded-full ${metric.bgColor} dark:bg-gray-800`}>
                       <metric.icon className={`h-3 w-3 ${metric.color} dark:text-gray-300`} />
                     </div>
                   </CardHeader>
                   <CardContent className="px-3 pb-3">
                     <div className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                       {metric.value.toFixed(1)}%
                     </div>
                     <div className="space-y-1">
                       <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                         <span>Objetivo: {metric.target}%</span>
                         <span>{metric.value >= metric.target ? "✅" : "⚠️"}</span>
                       </div>
                       <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                         <div
                           className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                           style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                         ></div>
                       </div>
                       <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                         {metric.description}
                       </div>
                     </div>
                   </CardContent>
                 </Card>
               ))}
             </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className={`${metric.borderColor} dark:border-gray-700 border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${metric.bgColor} dark:bg-gray-800`}>
                <metric.icon className={`h-4 w-4 ${metric.color} dark:text-gray-300`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {metric.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {metric.description}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
