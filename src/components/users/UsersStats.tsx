"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Shield, User, CheckCircle } from "lucide-react"

interface UsersStatsProps {
  total: number
  active: number
  inactive: number
  admins: number
  users: number
  selected: number
}

export const UsersStats = ({ 
  total, 
  active, 
  inactive, 
  admins, 
  users: users_count, 
  selected 
}: UsersStatsProps) => {
  const stats = [
    {
      title: "Total Usuarios",
      value: total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      title: "Usuarios Activos",
      value: active,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      title: "Usuarios Inactivos",
      value: inactive,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    },
    {
      title: "Administradores",
      value: admins,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      title: "Usuarios Regulares",
      value: users_count,
      icon: User,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.borderColor} border-l-4`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant={stat.title === "Usuarios Inactivos" ? "destructive" : "secondary"}
                className="text-xs"
              >
                {stat.title === "Total Usuarios" ? "Total" : 
                 stat.title === "Usuarios Activos" ? "Activos" :
                 stat.title === "Usuarios Inactivos" ? "Inactivos" :
                 stat.title === "Administradores" ? "Admin" : "Regulares"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {selected > 0 && (
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Seleccionados
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {selected}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="default" className="text-xs bg-blue-600">
                Seleccionados
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
