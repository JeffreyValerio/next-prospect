'use client'

import { useEffect } from 'react'
import { ProspectTable } from './ProspectTable'
import { useGlobalData } from '@/contexts/GlobalDataContext'
import { IProspect } from '@/interfaces/prospect.interface'

interface Props {
  prospects: unknown[]
  isAdmin: boolean
}

export const ProspectTableWithContext = ({ prospects, isAdmin }: Props) => {
  const { setProspects } = useGlobalData()

  useEffect(() => {
    // Poblar el contexto global con los datos de prospectos
    setProspects(prospects)
  }, [prospects, setProspects])

  return <ProspectTable prospects={prospects as IProspect[]} isAdmin={isAdmin} />
}
