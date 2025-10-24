'use client'

import { useMemo } from 'react'
import { IProspect } from '@/interfaces/prospect.interface'
import { cn } from '@/lib/utils'

interface ProspectStatsProps {
  prospects: IProspect[]
  filteredProspects: IProspect[]
  isAdmin: boolean
}

export const ProspectStats = ({ prospects, filteredProspects }: ProspectStatsProps) => {
  const stats = useMemo(() => {
    const total = prospects.length
    const filtered = filteredProspects.length
    
    // Estadísticas por estado
    const byStatus = prospects.reduce((acc, prospect) => {
      const status = prospect.customerResponse || 'Sin tipificar'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Estadísticas por asignación
    const byAssignment = prospects.reduce((acc, prospect) => {
      const assigned = prospect.assignedTo || 'Sin asignar'
      acc[assigned] = (acc[assigned] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Prospectos sin tipificar
    const untipified = byStatus['Sin tipificar'] || 0
    
    // Prospectos asignados
    const assigned = Object.entries(byAssignment).reduce((acc, [key, value]) => {
      return key !== 'Sin asignar' ? acc + value : acc
    }, 0)
    
    // Ventas realizadas
    const sales = byStatus['Venta realizada'] || 0
    
    return {
      total,
      filtered,
      untipified,
      assigned,
      sales,
      byStatus,
      byAssignment
    }
  }, [prospects, filteredProspects])

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case 'Venta realizada':
  //       return 'text-green-600 bg-green-50 border-green-200'
  //     case 'Sin tipificar':
  //       return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  //     case 'No interesado':
  //       return 'text-red-600 bg-red-50 border-red-200'
  //     case 'Llamar más tarde':
  //       return 'text-blue-600 bg-blue-50 border-blue-200'
  //     default:
  //       return 'text-gray-600 bg-gray-50 border-gray-200'
  //   }
  // }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total de prospectos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Prospectos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">📊</span>
          </div>
        </div>
        {stats.filtered !== stats.total && (
          <p className="text-xs text-gray-500 mt-1">
            {stats.filtered} mostrados
          </p>
        )}
      </div>

      {/* Sin tipificar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Sin Tipificar</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.untipified}</p>
          </div>
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-yellow-600 font-bold text-lg">⏰</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {((stats.untipified / stats.total) * 100).toFixed(1)}% del total
        </p>
      </div>

      {/* Asignados */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Asignados</p>
            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-lg">👥</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {((stats.assigned / stats.total) * 100).toFixed(1)}% del total
        </p>
      </div>

      {/* Ventas */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Ventas Realizadas</p>
            <p className="text-2xl font-bold text-green-600">{stats.sales}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-bold text-lg">✅</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {((stats.sales / stats.total) * 100).toFixed(1)}% del total
        </p>
      </div>
    </div>
  )
}

// Componente para mostrar distribución por estado
export const StatusDistribution = ({ prospects }: { prospects: IProspect[] }) => {
  const distribution = useMemo(() => {
    return prospects.reduce((acc, prospect) => {
      const status = prospect.customerResponse || 'Sin tipificar'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [prospects])

  const total = prospects.length

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Distribución por Estado</h3>
      <div className="space-y-3">
        {Object.entries(distribution)
          .sort(([,a], [,b]) => b - a)
          .map(([status, count]) => {
            const percentage = ((count / total) * 100).toFixed(1)
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    status === 'Venta realizada' && "bg-green-500",
                    status === 'Sin tipificar' && "bg-yellow-500",
                    status === 'No interesado' && "bg-red-500",
                    status === 'Llamar más tarde' && "bg-blue-500",
                    !['Venta realizada', 'Sin tipificar', 'No interesado', 'Llamar más tarde'].includes(status) && "bg-gray-500"
                  )} />
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{count}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
