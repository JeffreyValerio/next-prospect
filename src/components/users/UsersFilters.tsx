"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, RotateCcw } from "lucide-react"

interface UsersFiltersProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  roleFilter: string
  setRoleFilter: (role: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  onClearFilters: () => void
  isAdmin?: boolean
}

export const UsersFilters = ({
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onClearFilters
}: UsersFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || statusFilter !== 'all'

  const getFilterCount = () => {
    let count = 0
    if (searchTerm) count++
    if (roleFilter !== 'all') count++
    if (statusFilter !== 'all') count++
    return count
  }

  return (
    <div className="bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Búsqueda principal */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuarios por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="user">Usuarios</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {getFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {getFilterCount()}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-sm font-medium text-gray-700">
              Filtros activos:
            </div>
            
            {searchTerm && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {roleFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rol: {roleFilter === 'admin' ? 'Administrador' : 'Usuario'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setRoleFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Estado: {statusFilter === 'active' ? 'Activo' : 'Inactivo'}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => setStatusFilter('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="flex items-center gap-2 ml-auto"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
