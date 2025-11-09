'use client'

import { useEffect, useState } from 'react'
import { ProspectTable } from './ProspectTable'
import { useGlobalData } from '@/contexts/GlobalDataContext'
import { IProspect } from '@/interfaces/prospect.interface'
import { IUser } from '@/interfaces/user.interface'

interface Props {
  prospects: unknown[]
  isAdmin: boolean
  users?: IUser[]
}

export const ProspectTableWithContext = ({ prospects, isAdmin, users = [] }: Props) => {
  const { setProspects, setUsers } = useGlobalData()
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    // Poblar el contexto global con los datos de prospectos
    setProspects(prospects)
  }, [prospects, setProspects])

  useEffect(() => {
    if (!isAdmin) return
    setUsers(users)
  }, [isAdmin, setUsers, users])

  return (
    <div>
      {/* Controles en el header */}
      <div className="flex justify-end items-center mb-6 -mt-16">
        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-1 border dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      </div>
      
      <ProspectTable 
        prospects={prospects as IProspect[]} 
        isAdmin={isAdmin}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
