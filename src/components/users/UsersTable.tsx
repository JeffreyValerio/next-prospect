"use client"

import * as React from "react"
import { IUser } from "@/interfaces/user.interface"
import { useUsersTable } from "@/hooks/useUsersTable"
import { UsersStats } from "./UsersStats"
import { UsersFilters } from "./UsersFilters"
import { TableSkeleton } from "@/components/ui/loading"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
  TableRow 
} from "@/components/ui/table"
import { 
  FiChevronUp, 
  FiChevronDown, 
  FiDownload, 
  FiEdit, 
  FiEye,
  FiMoreHorizontal,
  FiUser,
  FiCalendar,
  FiClock,
  FiShield,
  FiUserCheck,
  FiUserX
} from "react-icons/fi"
import { cn } from "@/lib/utils"

interface UsersTableProps {
  users: IUser[]
  isAdmin?: boolean
}

export const UsersTable = ({ users, isAdmin = false }: UsersTableProps) => {

  const {
    // Estados
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    sortField,
    sortDirection,
    selectedUsers,
    currentPage,
    setCurrentPage,
    isInitialLoading,

    // Datos procesados
    filteredAndSortedUsers,
    paginatedUsers,
    totalPages,
    itemsPerPage,
    stats,

    // Funciones
    handleSort,
    handleSelectUser,
    handleSelectAll,
    handleClearFilters,
    handleExportData,
    isUserActive,
    formatDate,
    formatRelativeDate
  } = useUsersTable({ users, isAdmin })

  // Componente para mostrar el estado del usuario
  const UserStatusBadge = ({ user }: { user: IUser }) => {
    const active = isUserActive(user)
    return (
      <Badge 
        variant={active ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1",
          active ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
        )}
      >
        {active ? (
          <>
            <FiUserCheck className="h-3 w-3" />
            Activo
          </>
        ) : (
          <>
            <FiUserX className="h-3 w-3" />
            Inactivo
          </>
        )}
      </Badge>
    )
  }

  // Componente para mostrar el rol del usuario
  const UserRoleBadge = ({ role }: { role: string }) => {
    const isAdminRole = role === 'admin'
    return (
      <Badge 
        variant={isAdminRole ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1",
          isAdminRole ? "bg-purple-100 text-purple-800 border-purple-200" : "bg-blue-100 text-blue-800 border-blue-200"
        )}
      >
        {isAdminRole ? (
          <>
            <FiShield className="h-3 w-3" />
            Admin
          </>
        ) : (
          <>
            <FiUser className="h-3 w-3" />
            Usuario
          </>
        )}
      </Badge>
    )
  }

  // Componente para mostrar el avatar del usuario
  const UserAvatar = ({ user }: { user: IUser }) => {
    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.imageUrl || ''} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback className="bg-blue-500 text-white text-xs">
            {initials || <FiUser className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-gray-500 truncate max-w-[200px]">
            {user.email}
          </span>
        </div>
      </div>
    )
  }

  // Componente para mostrar la fecha de último ingreso
  const LastSignInCell = ({ user }: { user: IUser }) => {
    if (!user.lastSignInAt) {
      return (
        <div className="flex items-center gap-2">
          <FiClock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-500 text-sm">Nunca</span>
        </div>
      )
    }

    const active = isUserActive(user)
    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-900">
          {formatDate(user.lastSignInAt)}
        </span>
        <span className={cn(
          "text-xs",
          active ? "text-green-600" : "text-orange-600"
        )}>
          {formatRelativeDate(user.lastSignInAt)}
        </span>
      </div>
    )
  }

  // Componente para mostrar la fecha de creación
  const CreatedAtCell = ({ user }: { user: IUser }) => {
                                return (
      <div className="flex items-center gap-2">
        <FiCalendar className="h-4 w-4 text-gray-400" />
        <div className="flex flex-col">
          <span className="text-sm text-gray-900">
            {formatDate(user.createdAt)}
          </span>
          <span className="text-xs text-gray-500">
            {formatRelativeDate(user.createdAt)}
          </span>
        </div>
      </div>
    )
  }

  // Componente para las acciones del usuario
  const UserActions = ({ user }: { user: IUser }) => {
    const canEdit = isAdmin || user.role !== 'admin'
    
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Aquí puedes implementar la lógica para ver detalles del usuario
            console.log('Ver detalles del usuario:', user.id)
          }}
          className="h-8 w-8 p-0"
        >
          <FiEye className="h-4 w-4" />
        </Button>
        
        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Aquí puedes implementar la lógica para editar el usuario
              console.log('Editar usuario:', user.id)
            }}
            className="h-8 w-8 p-0"
          >
            <FiEdit className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <FiMoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Estadísticas */}
      <UsersStats {...stats} />

      {/* Filtros */}
      <div className="mb-4 flex-shrink-0">
        <UsersFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClearFilters={handleClearFilters}
          isAdmin={isAdmin}
        />
      </div>

      {/* Contenedor principal que ocupa todo el espacio disponible */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 shadow-lg border rounded-lg overflow-hidden">
          {isInitialLoading ? (
            <div className="w-full p-4">
              <TableSkeleton rows={8} />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <Table className="w-full flex-1">
                    <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="Seleccionar todos los usuarios"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('firstName')}
                    >
                      <div className="flex items-center gap-2">
                        Usuario
                        {sortField === 'firstName' && (
                          sortDirection === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Rol
                        {sortField === 'role' && (
                          sortDirection === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('lastSignInAt')}
                    >
                      <div className="flex items-center gap-2">
                        Estado
                        {sortField === 'lastSignInAt' && (
                          sortDirection === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Fecha de Creación
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('lastSignInAt')}
                    >
                      <div className="flex items-center gap-2">
                        Último Ingreso
                        {sortField === 'lastSignInAt' && (
                          sortDirection === 'asc' ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />
                        )}
                      </div>
                                        </TableHead>
                    <TableHead className="w-20">Acciones</TableHead>
                            </TableRow>
                    </TableHeader>
                    <TableBody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                            aria-label={`Seleccionar ${user.firstName} ${user.lastName}`}
                          />
                        </TableCell>
                        <TableCell>
                          <UserAvatar user={user} />
                        </TableCell>
                        <TableCell>
                          <UserRoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge user={user} />
                        </TableCell>
                        <TableCell>
                          <CreatedAtCell user={user} />
                        </TableCell>
                        <TableCell>
                          <LastSignInCell user={user} />
                        </TableCell>
                        <TableCell>
                          <UserActions user={user} />
                                        </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <FiUser className="h-8 w-8 text-gray-400" />
                          <span className="text-gray-500">No se encontraron usuarios</span>
                          {searchTerm && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearFilters}
                            >
                              Limpiar filtros
                            </Button>
                          )}
                        </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
          )}
        </div>
      </div>

      {/* Paginación mejorada - fija en la parte inferior */}
      <div className="flex justify-between items-center py-4 bg-white border-t flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} de {filteredAndSortedUsers.length} usuarios
          </span>
          {selectedUsers.size > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {selectedUsers.size} seleccionado{selectedUsers.size > 1 ? 's' : ''}
            </Badge>
          )}
                </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            Primera
          </Button>
                    <Button
                        variant="outline"
                        size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>

                    <Button
                        variant="outline"
                        size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Última
          </Button>
                </div>

        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="flex items-center gap-2"
          >
            <FiDownload size={16} />
            Exportar CSV
          </Button>
        )}
            </div>
        </div>
    )
}