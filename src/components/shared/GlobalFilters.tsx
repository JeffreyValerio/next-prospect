"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  Filter, 
  RefreshCw,
  TrendingUp,
  Users,
  Target
} from "lucide-react"

interface GlobalFiltersProps {
  timeRange: string
  onTimeRangeChange: (value: string) => void
  userFilter: string
  onUserFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onResetFilters: () => void
  isAdmin?: boolean
  users?: string[]
}

export const GlobalFilters = ({
  timeRange,
  onTimeRangeChange,
  userFilter,
  onUserFilterChange,
  statusFilter,
  onStatusFilterChange,
  onResetFilters,
  isAdmin = false,
  users = []
}: GlobalFiltersProps) => {
  const activeFiltersCount = [
    timeRange !== "currentMonth",
    userFilter !== "all",
    statusFilter !== "all"
  ].filter(Boolean).length

  return (
    <Card className="sticky top-4 z-40 bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg dark:text-gray-100">
          <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Filtros Globales
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtro de tiempo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período</span>
          </div>
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="currentMonth">Mes actual</SelectItem>
              <SelectItem value="last30Days">Últimos 30 días</SelectItem>
              <SelectItem value="last7Days">Últimos 7 días</SelectItem>
              <SelectItem value="all">Todo el tiempo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de usuario (solo para admins) */}
        {isAdmin && users.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Usuario</span>
            </div>
            <Select value={userFilter} onValueChange={onUserFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user} value={user}>
                    {user.split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Filtro de estado */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estado</span>
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="Venta realizada">Venta realizada</SelectItem>
              <SelectItem value="Interesado en información">Interesado en información</SelectItem>
              <SelectItem value="No interesado">No interesado</SelectItem>
              <SelectItem value="Llamar más tarde">Llamar más tarde</SelectItem>
              <SelectItem value="Sin tipificar">Sin tipificar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Botón de reset */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        )}

        {/* Indicadores de filtros activos */}
        {activeFiltersCount > 0 && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <TrendingUp className="h-3 w-3" />
              <span>Filtros aplicados: {activeFiltersCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
