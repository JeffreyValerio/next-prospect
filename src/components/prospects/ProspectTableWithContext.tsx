'use client'

import { useEffect, useState, useCallback } from 'react'
import { ProspectTable } from './ProspectTable'
import { useGlobalData } from '@/contexts/GlobalDataContext'
import { IProspect } from '@/interfaces/prospect.interface'
import { Button } from '@/components/ui/button'
import { FiDownload } from 'react-icons/fi'

interface Props {
  prospects: unknown[]
  isAdmin: boolean
}

export const ProspectTableWithContext = ({ prospects, isAdmin }: Props) => {
  const { setProspects } = useGlobalData()
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    // Poblar el contexto global con los datos de prospectos
    setProspects(prospects)
  }, [prospects, setProspects])

  const handleExportData = useCallback(() => {
    const csvContent = [
      ['Fecha', 'Nombre', 'Apellido', 'Cédula', 'Dirección', 'Asignado a', 'Respuesta del cliente', 'Comentarios'].join(','),
      ...(prospects as IProspect[]).map(p => [
        p.date,
        p.firstName,
        p.lastName,
        p.nId,
        `"${p.address}"`,
        p.assignedTo,
        `"${p.customerResponse}"`,
        `"${p.comments || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `prospects_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [prospects])

  return (
    <div>
      {/* Controles en el header */}
      <div className="flex justify-end items-center mb-6 -mt-16">
        <div className="flex items-center gap-2">
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
