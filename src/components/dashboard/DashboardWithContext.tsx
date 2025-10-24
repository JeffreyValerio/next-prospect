'use client'

import { useEffect } from 'react'
import { useGlobalData } from '@/contexts/GlobalDataContext'
import { getClerkUsers } from '@/actions/users/get-clerk-users'

interface Props {
  children: React.ReactNode
  prospects: unknown[]
  isAdmin: boolean
}

export const DashboardWithContext = ({ children, prospects, isAdmin }: Props) => {
  const { setProspects, setUsers } = useGlobalData()

  useEffect(() => {
    // Poblar el contexto global con los datos de prospectos
    setProspects(prospects)

    // Obtener usuarios si es admin
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const users = await getClerkUsers()
          setUsers(users)
        } catch (error) {
          console.error('Error fetching users:', error)
        }
      }
      fetchUsers()
    }
  }, [prospects, isAdmin, setProspects, setUsers])

  return <>{children}</>
}
