'use client'

import { ProspectTable } from './ProspectTable'
import { ProspectStats, StatusDistribution } from './ProspectStats'
import { IProspect } from '@/interfaces/prospect.interface'

interface ProspectTableExampleProps {
  prospects: IProspect[]
  isAdmin: boolean
}

/**
 * Ejemplo de uso de la tabla optimizada de prospectos
 * Este componente muestra cómo integrar todas las mejoras implementadas
 */
export const ProspectTableExample = ({ prospects, isAdmin }: ProspectTableExampleProps) => {
  return (
    <div className="space-y-6">
      {/* Estadísticas de la tabla */}
      <ProspectStats 
        prospects={prospects} 
        filteredProspects={prospects} 
        isAdmin={isAdmin} 
      />
      
      {/* Distribución por estado */}
      <StatusDistribution prospects={prospects} />
      
      {/* Tabla optimizada */}
      <ProspectTable prospects={prospects} isAdmin={isAdmin} />
    </div>
  )
}

/**
 * Ejemplo de uso con hook personalizado
 */
export const ProspectTableWithHook = ({ prospects, isAdmin }: ProspectTableExampleProps) => {
  // Aquí podrías usar el hook personalizado si quisieras más control
  // const tableState = useProspectTable({ prospects })
  
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          🚀 Tabla Optimizada
        </h3>
        <p className="text-blue-700 text-sm">
          Esta tabla incluye todas las mejoras implementadas: ordenamiento, selección múltiple, 
          exportación CSV, paginación avanzada y optimizaciones de rendimiento.
        </p>
      </div>
      
      <ProspectTableExample prospects={prospects} isAdmin={isAdmin} />
    </div>
  )
}
