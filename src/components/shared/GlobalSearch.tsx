'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, Clock, Users, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  title: string
  subtitle: string
  type: 'prospect' | 'user' | 'report'
  href: string
  icon: React.ComponentType<Record<string, unknown>>
}

interface GlobalSearchProps {
  className?: string
  prospects?: unknown[]
  users?: unknown[]
}

export const GlobalSearch = ({ className, prospects = [], users = [] }: GlobalSearchProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Función para buscar prospectos reales
  const searchProspects = useCallback((searchQuery: string) => {
    const filteredProspects = prospects.filter((prospect: unknown) => {
      const p = prospect as Record<string, unknown>
      return (
        (p.firstName as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.lastName as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.nId as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${p.firstName as string} ${p.lastName as string}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

    return filteredProspects.slice(0, 5).map((prospect: unknown) => {
      const p = prospect as Record<string, unknown>
      return {
        id: p.id as string,
        title: `${p.firstName as string} ${p.lastName as string}`,
        subtitle: `Prospecto - ${(p.customerResponse as string) || 'Sin tipificar'}`,
        type: 'prospect' as const,
        href: `/prospects/${p.id as string}`,
        icon: Users
      }
    })
  }, [prospects])

  // Función para buscar usuarios reales
  const searchUsers = useCallback((searchQuery: string) => {
    const filteredUsers = users.filter((user: unknown) => {
      const u = user as Record<string, unknown>
      return (
        (u.fullName as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.firstName as string)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.lastName as string)?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })

    return filteredUsers.slice(0, 3).map((user: unknown) => {
      const u = user as Record<string, unknown>
      return {
        id: u.id as string,
        title: (u.fullName as string) || `${u.firstName as string} ${u.lastName as string}`,
        subtitle: `Usuario - ${(u.role as string) || 'Vendedor'}`,
        type: 'user' as const,
        href: `/users/${u.id as string}`,
        icon: User
      }
    })
  }, [users])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true)
      // Búsqueda real con debounce
      const timeoutId = setTimeout(() => {
        const prospectResults = searchProspects(query)
        const userResults = searchUsers(query)
        const allResults = [...prospectResults, ...userResults]
        
        setResults(allResults)
        setIsLoading(false)
        setIsOpen(true)
      }, 300)

      return () => clearTimeout(timeoutId)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, prospects, users, searchProspects, searchUsers])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setQuery("")
    }
  }

  const clearSearch = () => {
    setQuery("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      {/* Campo de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar prospectos, usuarios..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <Clock className="h-4 w-4 animate-spin mx-auto mb-2" />
              Buscando...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors duration-200 text-left"
                  onClick={() => {
                    setIsOpen(false)
                    setQuery("")
                    router.push(result.href)
                  }}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    result.type === 'prospect' && "bg-blue-100 text-blue-600",
                    result.type === 'user' && "bg-green-100 text-green-600",
                    result.type === 'report' && "bg-purple-100 text-purple-600"
                  )}>
                    <result.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron resultados para &quot;{query}&quot;
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
