"use client"

import { useState, useMemo, useCallback } from 'react'
import { IUser } from '@/interfaces/user.interface'

type SortField = 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'lastSignInAt'
type SortDirection = 'asc' | 'desc'

interface UseUsersTableProps {
  users: IUser[]
  isAdmin?: boolean
}

export const useUsersTable = ({ users }: UseUsersTableProps) => {
  // Estados principales
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [isInitialLoading, setIsInitialLoading] = useState(false)

  const itemsPerPage = 10

  // Función para verificar si un usuario está activo
  const isUserActive = useCallback((user: IUser) => {
    if (!user.lastSignInAt) return false
    const lastSignIn = new Date(user.lastSignInAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return lastSignIn > thirtyDaysAgo
  }, [])

  // Función para formatear fechas
  const formatDate = useCallback((timestamp: number | null) => {
    if (!timestamp) return 'Nunca'
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Función para formatear fecha relativa
  const formatRelativeDate = useCallback((timestamp: number | null) => {
    if (!timestamp) return 'Nunca'
    const now = new Date()
    const date = new Date(timestamp)
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Hoy'
    if (diffInDays === 1) return 'Ayer'
    if (diffInDays < 7) return `Hace ${diffInDays} días`
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`
    return `Hace ${Math.floor(diffInDays / 30)} meses`
  }, [])

  // Filtrado y ordenamiento optimizado
  const filteredAndSortedUsers = useMemo(() => {
    const filtered = users.filter(user => {
      // Filtro de búsqueda
      const searchMatch = searchTerm === '' || 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de rol
      const roleMatch = roleFilter === 'all' || user.role === roleFilter

      // Filtro de estado
      const statusMatch = statusFilter === 'all' || 
        (statusFilter === 'active' && isUserActive(user)) ||
        (statusFilter === 'inactive' && !isUserActive(user))

      return searchMatch && roleMatch && statusMatch
    })

    // Ordenamiento
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case 'firstName':
          aValue = a.firstName.toLowerCase()
          bValue = b.firstName.toLowerCase()
          break
        case 'lastName':
          aValue = a.lastName.toLowerCase()
          bValue = b.lastName.toLowerCase()
          break
        case 'email':
          aValue = a.email.toLowerCase()
          bValue = b.email.toLowerCase()
          break
        case 'role':
          aValue = a.role.toLowerCase()
          bValue = b.role.toLowerCase()
          break
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'lastSignInAt':
          aValue = a.lastSignInAt || 0
          bValue = b.lastSignInAt || 0
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return sorted
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection, isUserActive])

  // Paginación optimizada
  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() =>
    filteredAndSortedUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredAndSortedUsers, currentPage, itemsPerPage]
  )

  // Funciones de utilidad
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }, [sortField, sortDirection])

  const handleSelectUser = useCallback((userId: string) => {
    const newSelection = new Set(selectedUsers)
    if (newSelection.has(userId)) {
      newSelection.delete(userId)
    } else {
      newSelection.add(userId)
    }
    setSelectedUsers(newSelection)
  }, [selectedUsers])

  const handleSelectAll = useCallback(() => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)))
    }
  }, [selectedUsers.size, paginatedUsers])

  const handleClearFilters = useCallback(() => {
    setSearchTerm('')
    setRoleFilter('all')
    setStatusFilter('all')
    setSortField('createdAt')
    setSortDirection('desc')
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(() => {
    const csvData = filteredAndSortedUsers.map(user => ({
      'Nombre': user.firstName,
      'Apellidos': user.lastName,
      'Email': user.email,
      'Rol': user.role,
      'Fecha de Creación': formatDate(user.createdAt),
      'Último Ingreso': formatDate(user.lastSignInAt),
      'Estado': isUserActive(user) ? 'Activo' : 'Inactivo'
    }))

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredAndSortedUsers, formatDate, isUserActive])

  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  // Estadísticas
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter(isUserActive).length
    const inactive = total - active
    const admins = users.filter(u => u.role === 'admin').length
    const users_count = users.filter(u => u.role === 'user').length

    return {
      total,
      active,
      inactive,
      admins,
      users: users_count,
      selected: selectedUsers.size
    }
  }, [users, isUserActive, selectedUsers.size])

  return {
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
    setIsInitialLoading,

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
    resetPage,
    isUserActive,
    formatDate,
    formatRelativeDate
  }
}
