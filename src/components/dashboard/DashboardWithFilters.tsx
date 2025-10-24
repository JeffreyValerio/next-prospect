"use client"

import * as React from "react"
import { GlobalFiltersModal } from "@/components/shared/GlobalFiltersModal"
import { IProspect } from "@/interfaces/prospect.interface"

interface DashboardWithFiltersProps {
  prospects: IProspect[]
  isAdmin: boolean
  children: React.ReactNode
}

// Crear contexto para los datos filtrados
const DashboardContext = React.createContext<{
  filteredProspects: IProspect[]
  isAdmin: boolean
}>({
  filteredProspects: [],
  isAdmin: false
})

export const DashboardWithFilters = ({ prospects, isAdmin, children }: DashboardWithFiltersProps) => {
  const [timeRange, setTimeRange] = React.useState("currentMonth")
  const [userFilter, setUserFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")

  // Obtener lista de usuarios únicos
  const users = React.useMemo(() => {
    const uniqueUsers = new Set<string>()
    prospects.forEach(prospect => {
      if (prospect.assignedTo) {
        uniqueUsers.add(prospect.assignedTo)
      }
    })
    return Array.from(uniqueUsers).sort()
  }, [prospects])

  // Filtrar prospectos según los filtros globales
  const filteredProspects = React.useMemo(() => {
    let filtered = prospects

    // Filtro de tiempo
    if (timeRange !== "all") {
      const now = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case "currentMonth":
          startDate.setMonth(now.getMonth(), 1)
          break
        case "last30Days":
          startDate.setDate(now.getDate() - 30)
          break
        case "last7Days":
          startDate.setDate(now.getDate() - 7)
          break
      }
      
      filtered = filtered.filter(prospect => {
        const prospectDate = new Date(prospect.date)
        return prospectDate >= startDate
      })
    }

    // Filtro de usuario
    if (userFilter !== "all") {
      filtered = filtered.filter(prospect => prospect.assignedTo === userFilter)
    }

    // Filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(prospect => prospect.customerResponse === statusFilter)
    }

    return filtered
  }, [prospects, timeRange, userFilter, statusFilter])

  const handleResetFilters = () => {
    setTimeRange("currentMonth")
    setUserFilter("all")
    setStatusFilter("all")
  }

  return (
    <DashboardContext.Provider value={{ filteredProspects, isAdmin }}>
      {/* Botón de filtros flotante */}
      <GlobalFiltersModal
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onResetFilters={handleResetFilters}
        isAdmin={isAdmin}
        users={users}
      />

      {/* Contenido del dashboard */}
      <div className="w-full">
        {children}
      </div>
    </DashboardContext.Provider>
  )
}

// Hook para usar el contexto del dashboard
export const useDashboardContext = () => {
  const context = React.useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardWithFilters')
  }
  return context
}
