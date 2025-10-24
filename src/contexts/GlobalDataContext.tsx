'use client'

import React, { createContext, useContext, useState } from 'react'

interface GlobalDataContextType {
  prospects: unknown[]
  users: unknown[]
  loading: boolean
  setProspects: (prospects: unknown[]) => void
  setUsers: (users: unknown[]) => void
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined)

export const GlobalDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [prospects, setProspects] = useState<unknown[]>([])
  const [users, setUsers] = useState<unknown[]>([])
  const [loading] = useState(false)

  return (
    <GlobalDataContext.Provider value={{
      prospects,
      users,
      loading,
      setProspects,
      setUsers
    }}>
      {children}
    </GlobalDataContext.Provider>
  )
}

export const useGlobalData = () => {
  const context = useContext(GlobalDataContext)
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider')
  }
  return context
}
