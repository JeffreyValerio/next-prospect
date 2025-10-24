"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Target, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Star
} from "lucide-react"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

interface GoalsAndTargetsProps {
  isAdmin?: boolean
}

export const GoalsAndTargets = ({}: GoalsAndTargetsProps) => {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects
  // Calcular métricas actuales
  const totalProspects = prospects.length || 0
  const sales = prospects.filter(p => p.customerResponse === "Venta realizada").length
  const interested = prospects.filter(p => p.customerResponse === "Está interesado").length
  // const callback = prospects.filter(p => p.customerResponse === "Llamar después").length

  // Calcular prospectos por día (últimos 30 días)
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  const prospectsLast30Days = prospects.filter(p => {
    const prospectDate = new Date(p.date)
    return prospectDate >= last30Days
  }).length

  const dailyAverage = prospectsLast30Days / 30

  // Definir objetivos (estos pueden venir de una configuración o base de datos)
  const goals = [
    {
      id: 1,
      title: "Ventas Mensuales",
      current: sales,
      target: 50,
      unit: "ventas",
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      description: "Objetivo de ventas para el mes actual"
    },
    {
      id: 2,
      title: "Prospectos por Día",
      current: dailyAverage,
      target: 5,
      unit: "prospectos",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "Meta diaria de nuevos prospectos"
    },
    {
      id: 3,
      title: "Tasa de Conversión",
      current: totalProspects > 0 ? (sales / totalProspects * 100) : 0,
      target: 15,
      unit: "%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      description: "Porcentaje de prospectos que se convierten en ventas"
    },
    {
      id: 4,
      title: "Prospectos Interesados",
      current: interested,
      target: 25,
      unit: "prospectos",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      description: "Meta de prospectos que muestran interés"
    }
  ]

  // Calcular progreso general
  const overallProgress = goals.reduce((acc, goal) => {
    const progress = goal.current / goal.target * 100
    return acc + Math.min(progress, 100)
  }, 0) / goals.length

  // Obtener el objetivo más cercano a completarse
  const closestGoal = goals.reduce((closest, goal) => {
    const currentProgress = goal.current / goal.target
    const closestProgress = closest.current / closest.target
    return currentProgress > closestProgress ? goal : closest
  })

  // Obtener el objetivo que necesita más atención
  const needsAttention = goals.reduce((lowest, goal) => {
    const currentProgress = goal.current / goal.target
    const lowestProgress = lowest.current / lowest.target
    return currentProgress < lowestProgress ? goal : lowest
  })

  return (
    <div className="grid gap-6">
      {/* Resumen general */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Progreso General de Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Progreso Total</span>
              <span className="text-2xl font-bold text-blue-600">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600">
                  {goals.filter(g => g.current >= g.target).length} objetivos completados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-gray-600">
                  {goals.filter(g => g.current < g.target).length} en progreso
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

             {/* Objetivos individuales */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100
          const isCompleted = goal.current >= goal.target
          const isClose = progress >= 80 && !isCompleted

          return (
            <Card key={goal.id} className={`${goal.borderColor} border-l-4 ${isCompleted ? 'bg-green-50' : isClose ? 'bg-orange-50' : ''}`}>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                     <CardTitle className="text-xs font-medium text-gray-600 truncate">
                       {goal.title}
                     </CardTitle>
                     <div className={`p-1.5 rounded-full ${goal.bgColor}`}>
                       <goal.icon className={`h-3 w-3 ${goal.color}`} />
                     </div>
                   </CardHeader>
                   <CardContent className="px-3 pb-3">
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-lg font-bold text-gray-900">
                           {goal.current.toFixed(goal.unit === "%" ? 1 : 0)}
                           <span className="text-xs text-gray-500 ml-1">{goal.unit}</span>
                         </span>
                         <div className="flex items-center gap-1">
                           {isCompleted && (
                             <Badge variant="default" className="bg-green-600 text-xs px-1 py-0">
                               <CheckCircle className="h-2 w-2 mr-1" />
                               ✓
                             </Badge>
                           )}
                           {isClose && !isCompleted && (
                             <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs px-1 py-0">
                               <AlertCircle className="h-2 w-2 mr-1" />
                               !
                             </Badge>
                           )}
                         </div>
                       </div>

                       <div className="space-y-1">
                         <div className="flex justify-between text-xs text-gray-500">
                           <span>Meta: {goal.target}</span>
                           <span>{progress.toFixed(1)}%</span>
                         </div>
                         <div className="w-full bg-gray-200 rounded-full h-1.5">
                           <div
                             className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                             style={{ width: `${Math.min(progress, 100)}%` }}
                           ></div>
                         </div>
                       </div>

                       <div className="text-xs text-gray-500 truncate">
                         {goal.description}
                       </div>
                     </div>
                   </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Acciones recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Acciones Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {needsAttention.current < needsAttention.target && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Enfócate en {needsAttention.title}
                  </p>
                  <p className="text-xs text-gray-600">
                    Necesitas {needsAttention.target - needsAttention.current} {needsAttention.unit} más para alcanzar tu meta
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </div>
            )}

            {closestGoal.current >= closestGoal.target && (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    ¡Excelente trabajo en {closestGoal.title}!
                  </p>
                  <p className="text-xs text-gray-600">
                    Has superado tu meta por {closestGoal.current - closestGoal.target} {closestGoal.unit}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver logros
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Revisa tus objetivos semanalmente
                </p>
                <p className="text-xs text-gray-600">
                  Mantén el seguimiento de tu progreso para alcanzar tus metas
                </p>
              </div>
              <Button size="sm" variant="outline">
                Configurar recordatorios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
