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
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-blue-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Progreso General de Objetivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progreso Total</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  {goals.filter(g => g.current >= g.target).length} objetivos completados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-gray-600 dark:text-gray-400">
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
            <Card key={goal.id} className={`${goal.borderColor} dark:border-gray-700 border-l-4 ${isCompleted ? 'bg-green-50 dark:bg-green-950' : isClose ? 'bg-orange-50 dark:bg-orange-950' : ''}`}>
                   <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                     <CardTitle className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                       {goal.title}
                     </CardTitle>
                     <div className={`p-1.5 rounded-full ${goal.bgColor} dark:bg-gray-800`}>
                       <goal.icon className={`h-3 w-3 ${goal.color} dark:text-gray-300`} />
                     </div>
                   </CardHeader>
                   <CardContent className="px-3 pb-3">
                     <div className="space-y-2">
                       <div className="flex items-center justify-between">
                         <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                           {goal.current.toFixed(goal.unit === "%" ? 1 : 0)}
                           <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{goal.unit}</span>
                         </span>
                         <div className="flex items-center gap-1">
                           {isCompleted && (
                             <Badge variant="default" className="bg-green-600 dark:bg-green-700 text-xs px-1 py-0">
                               <CheckCircle className="h-2 w-2 mr-1" />
                               ✓
                             </Badge>
                           )}
                           {isClose && !isCompleted && (
                             <Badge variant="secondary" className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-xs px-1 py-0">
                               <AlertCircle className="h-2 w-2 mr-1" />
                               !
                             </Badge>
                           )}
                         </div>
                       </div>

                       <div className="space-y-1">
                         <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                           <span>Meta: {goal.target}</span>
                           <span>{progress.toFixed(1)}%</span>
                         </div>
                         <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                           <div
                             className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                             style={{ width: `${Math.min(progress, 100)}%` }}
                           ></div>
                         </div>
                       </div>

                       <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
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
              <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Enfócate en {needsAttention.title}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Necesitas {needsAttention.target - needsAttention.current} {needsAttention.unit} más para alcanzar tu meta
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver detalles
                </Button>
              </div>
            )}

            {closestGoal.current >= closestGoal.target && (
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    ¡Excelente trabajo en {closestGoal.title}!
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Has superado tu meta por {closestGoal.current - closestGoal.target} {closestGoal.unit}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver logros
                </Button>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Revisa tus objetivos semanalmente
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
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
