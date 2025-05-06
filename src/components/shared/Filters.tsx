'use client'

import { IProspect } from '@/interfaces/prospect.interface';
import Link from 'next/link';
import { BiSearch } from 'react-icons/bi';
import { GoPersonAdd } from 'react-icons/go';

interface FiltersProps {
    prospects: IProspect[];
    isAdmin: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    selectedTipification: string;
    onTipificationChange: (value: string) => void;
    selectedAssignedTo: string;
    onAssignedToChange: (value: string) => void;
}

export const Filters = ({
    prospects,
    isAdmin,
    search,
    onSearchChange,
    selectedTipification,
    onTipificationChange,
    selectedAssignedTo,
    onAssignedToChange,
}: FiltersProps) => {
    const tipificationCounts = prospects.reduce((acc: Record<string, number>, prospect) => {
        if (prospect.customerResponse) {
            acc[prospect.customerResponse] = (acc[prospect.customerResponse] || 0) + 1;
        }
        return acc;
    }, {});
    const tipifications = Object.keys(tipificationCounts);

    const assignedUserCounts = prospects.reduce((acc: Record<string, number>, prospect) => {
        if (prospect.assignedTo) {
            acc[prospect.assignedTo] = (acc[prospect.assignedTo] || 0) + 1;
        }
        return acc;
    }, {});
    const assignedUsers = Object.keys(assignedUserCounts);

    return (
        <div className="sticky top-16 z-40 bg-primary rounded p-2">
            <div className="flex items-center gap-2 mb-2">
                <form onSubmit={(e) => e.preventDefault()} className="flex bg-white rounded overflow-hidden shadow w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Buscar prospecto"
                        className="w-full flex-1 px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center">
                        <BiSearch size={18} />
                    </div>
                </form>
                {isAdmin && (
                    <Link href={"/prospects/new"} className="text-xs bg-teal-600 text-white rounded px-4 py-3">
                        <GoPersonAdd size={20} />
                    </Link>
                )}
            </div>

            <div className="flex gap-2 items-center justify-between p-2 bg-white rounded shadow flex-wrap">
                <div className="flex flex-wrap gap-2">
                    <select
                        value={selectedTipification}
                        onChange={(e) => onTipificationChange(e.target.value)}
                        className="p-2 w-full sm:w-auto text-xs text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Selecciona una tipificación</option>
                        {tipifications.map((tip) => (
                            <option key={tip} value={tip}>
                                {tip} ({tipificationCounts[tip]})
                            </option>
                        ))}
                    </select>

                    {isAdmin && (
                        <select
                            value={selectedAssignedTo}
                            onChange={(e) => onAssignedToChange(e.target.value)}
                            className="p-2 w-full sm:w-auto text-xs text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Filtrar por asignado</option>
                            {assignedUsers.map((user) => (
                                <option key={user} value={user}>
                                    {user} ({assignedUserCounts[user]})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        onTipificationChange("");
                        onAssignedToChange("");
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800"
                >
                    Limpiar filtros
                </button>
            </div>
        </div>
    );
};
