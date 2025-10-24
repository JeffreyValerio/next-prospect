'use client'

import { IProspect } from '@/interfaces/prospect.interface';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { BiSearch } from 'react-icons/bi';
import { GoPersonAdd } from 'react-icons/go';

interface FiltersProps {
  prospects: IProspect[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedTipification: string;
  onTipificationChange: (value: string) => void;
  selectedAssignedTo: string;
  onAssignedToChange: (value: string) => void;
  selectedDate: string;
  onDateChange: (value: string) => void;
}

export const Filters = ({
  prospects,
  search,
  onSearchChange,
  selectedTipification,
  onTipificationChange,
  selectedAssignedTo,
  onAssignedToChange,
  selectedDate,
  onDateChange,
}: FiltersProps) => {
  const user = useUser();
  const isAdmin = user?.user?.publicMetadata?.role === 'admin';

  const filteredByDate = selectedDate
    ? prospects.filter(p => p.date?.toString().startsWith(selectedDate))
    : prospects;

  const filteredByTipification = selectedTipification
    ? filteredByDate.filter(p => p.customerResponse === selectedTipification)
    : filteredByDate;

  const filteredByAssignedTo = selectedAssignedTo
    ? filteredByDate.filter(p => p.assignedTo === selectedAssignedTo)
    : filteredByDate;

  const tipificationCounts = filteredByAssignedTo.reduce(
    (acc: Record<string, number>, prospect) => {
      if (prospect.customerResponse) {
        acc[prospect.customerResponse] = (acc[prospect.customerResponse] || 0) + 1;
      }
      return acc;
    },
    {}
  );
  const tipifications = Object.keys(tipificationCounts);

  const assignedUserCounts = filteredByTipification.reduce(
    (acc: Record<string, number>, prospect) => {
      if (prospect.assignedTo) {
        acc[prospect.assignedTo] = (acc[prospect.assignedTo] || 0) + 1;
      }
      return acc;
    },
    {}
  );
  const assignedUsers = Object.keys(assignedUserCounts);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 mb-4 flex-shrink-0">
      {/* Barra de búsqueda y botón agregar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar prospecto por nombre, cédula o número..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        {isAdmin && (
          <Link
            href="/prospects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <GoPersonAdd size={18} />
            Agregar
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Estado</label>
            <select
              value={selectedTipification}
              onChange={(e) => onTipificationChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent min-w-[180px]"
            >
              <option value="">Todos los estados</option>
              {tipifications.map((tip) => (
                <option key={tip} value={tip}>
                  {tip} ({tipificationCounts[tip]})
                </option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Asignado a</label>
              <select
                value={selectedAssignedTo}
                onChange={(e) => onAssignedToChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent min-w-[180px]"
              >
                <option value="">Todos los usuarios</option>
                {assignedUsers.map((user) => (
                  <option key={user} value={user}>
                    {user} ({assignedUserCounts[user]})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onTipificationChange('');
              onAssignedToChange('');
              onDateChange('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};
