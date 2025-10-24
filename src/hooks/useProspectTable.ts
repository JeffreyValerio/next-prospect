import { useState, useCallback, useMemo } from 'react'
import { IProspect } from '@/interfaces/prospect.interface'

type SortField = 'date' | 'firstName' | 'lastName' | 'nId' | 'assignedTo' | 'customerResponse'
type SortDirection = 'asc' | 'desc'

interface UseProspectTableProps {
  prospects: IProspect[]
  initialItemsPerPage?: number
}

export const useProspectTable = ({ prospects, initialItemsPerPage = 10 }: UseProspectTableProps) => {
  // Estados de filtrado y búsqueda
  const [search, setSearch] = useState("")
  const [selectedTipification, setSelectedTipification] = useState<string>("")
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  
  // Estados de ordenamiento
  const [sortField, setSortField] = useState<SortField>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  
  // Estados de selección
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set())
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  
  // Estados de UI
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Función de ordenamiento optimizada
  const sortProspects = useCallback((prospects: IProspect[], field: SortField, direction: SortDirection) => {
    return [...prospects].sort((a, b) => {
      let aValue: string | number, bValue: string | number
      
      switch (field) {
        case 'date':
          aValue = new Date(a.date).getTime()
          bValue = new Date(b.date).getTime()
          break
        case 'firstName':
        case 'lastName':
          aValue = (a[field] ?? "").toLowerCase()
          bValue = (b[field] ?? "").toLowerCase()
          break
        case 'nId':
        case 'assignedTo':
        case 'customerResponse':
          aValue = (a[field] ?? "").toString().toLowerCase()
          bValue = (b[field] ?? "").toString().toLowerCase()
          break
        default:
          return 0
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1
      if (aValue > bValue) return direction === 'asc' ? 1 : -1
      return 0
    })
  }, [])

  // Filtrado y ordenamiento optimizado
  const filteredAndSortedProspects = useMemo(() => {
    const filtered = prospects.filter((p) => {
      const matchesSearch = search === "" || 
        `${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
        String(p.phone1 ?? "").includes(search) ||
        String(p.phone2 ?? "").includes(search) ||
        String(p.nId ?? "").includes(search) ||
        String(p.assignedTo ?? "").toLowerCase().includes(search.toLowerCase())
        
      const matchesTipification = selectedTipification === "" || selectedTipification === p.customerResponse
      const matchesAssignedTo = selectedAssignedTo === "" || selectedAssignedTo === p.assignedTo
      const matchesDate = !selectedDate || (p.date && p.date.startsWith(selectedDate))
      
      return matchesSearch && matchesTipification && matchesAssignedTo && matchesDate
    })
    
    return sortProspects(filtered, sortField, sortDirection)
  }, [prospects, search, selectedTipification, selectedAssignedTo, selectedDate, sortField, sortDirection, sortProspects])

  // Paginación optimizada
  const totalPages = Math.ceil(filteredAndSortedProspects.length / itemsPerPage)
  const paginatedProspects = useMemo(() => 
    filteredAndSortedProspects.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredAndSortedProspects, currentPage, itemsPerPage]
  )

  // Funciones de utilidad
  const handleSort = useCallback((field: SortField) => {
    setSortDirection(prev => 
      sortField === field && prev === 'asc' ? 'desc' : 'asc'
    )
    setSortField(field)
  }, [sortField])

  const handleSelectProspect = useCallback((prospectId: string) => {
    setSelectedProspects(prev => {
      const newSet = new Set(prev)
      if (newSet.has(prospectId)) {
        newSet.delete(prospectId)
      } else {
        newSet.add(prospectId)
      }
      return newSet
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedProspects.size === paginatedProspects.length) {
      setSelectedProspects(new Set())
    } else {
      setSelectedProspects(new Set(paginatedProspects.map(p => p.id)))
    }
  }, [selectedProspects.size, paginatedProspects])

  const handleClearFilters = useCallback(() => {
    setSearch("")
    setSelectedTipification("")
    setSelectedAssignedTo("")
    setSelectedDate("")
    setCurrentPage(1)
  }, [])

  const handleExportData = useCallback(() => {
    const csvContent = [
      ['Fecha', 'Nombre', 'Apellido', 'Cédula', 'Teléfono 1', 'Teléfono 2', 'Dirección', 'Asignado a', 'Respuesta del cliente', 'Comentarios'].join(','),
      ...filteredAndSortedProspects.map(p => [
        p.date,
        p.firstName,
        p.lastName,
        p.nId,
        p.phone1,
        p.phone2 || '',
        `"${p.address}"`,
        p.assignedTo,
        `"${p.customerResponse}"`,
        `"${p.comments || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `prospects_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filteredAndSortedProspects])

  // Resetear página cuando cambien los filtros
  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  return {
    // Estados
    search,
    selectedTipification,
    selectedAssignedTo,
    selectedDate,
    sortField,
    sortDirection,
    selectedProspects,
    currentPage,
    itemsPerPage,
    loadingId,
    isInitialLoading,
    
    // Datos procesados
    filteredAndSortedProspects,
    paginatedProspects,
    totalPages,
    
    // Setters
    setSearch,
    setSelectedTipification,
    setSelectedAssignedTo,
    setSelectedDate,
    setCurrentPage,
    setItemsPerPage,
    setLoadingId,
    setIsInitialLoading,
    
    // Funciones
    handleSort,
    handleSelectProspect,
    handleSelectAll,
    handleClearFilters,
    handleExportData,
    resetPage
  }
}
