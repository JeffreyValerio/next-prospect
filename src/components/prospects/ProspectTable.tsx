'use client'

import Link from "next/link"
import Image from "next/image"

import { BiSearch } from "react-icons/bi"
import { CiLocationOn } from "react-icons/ci";
import { cn } from "@/lib/utils";
import { FiEdit } from "react-icons/fi";
import { GoPersonAdd } from "react-icons/go";
import { IProspect } from "@/interfaces/prospect.interface"
import { useState } from "react";

export const ProspectTable = ({ prospects, isAdmin }: { prospects: IProspect[], isAdmin: boolean }) => {

    const tipifications = Array.from(new Set(prospects.map((p) => p.customerResponse).filter(Boolean)));

    const [selectedTipification, setSelectedTipification] = useState<string>("");

    const [search, setSearch] = useState("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");

    const assignedUsers = Array.from(new Set(prospects.map((p) => p.assignedTo).filter(Boolean)));

    const filteredProspects = prospects.filter((p) => {
        const matchesSearch =
            `${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
            String(p.phone1 ?? "").includes(search) ||
            String(p.phone2 ?? "").includes(search) ||
            String(p.nId ?? "").includes(search) ||
            String(p.assignedTo ?? "").toLowerCase().includes(search.toLowerCase());

        const matchesTipification =
            selectedTipification === "" || selectedTipification === p.customerResponse;

        const matchesAssignedTo =
            selectedAssignedTo === "" || selectedAssignedTo === p.assignedTo;

        return matchesSearch && matchesTipification && matchesAssignedTo;
    });

    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <form onSubmit={(e) => e.preventDefault()} className="flex bg-white rounded overflow-hidden shadow w-full">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar prospecto"
                        className="flex-1 px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button type="submit" className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white">
                        <BiSearch />
                    </button>
                </form>


                <Link href={"/prospects/new"} className="text-xs bg-teal-600 text-white rounded px-4 py-3">
                    <GoPersonAdd size={20} className="flex-shrink-0" />
                </Link>
            </div>

            <div className="flex gap-2 items-center justify-between p-2 bg-white rounded shadow mb-2 flex-wrap">
                <div className="flex flex-wrap gap-2">
                    <select
                        id="tipification"
                        value={selectedTipification}
                        onChange={(e) => setSelectedTipification(e.target.value)}
                        className="p-2 w-full sm:w-auto text-xs text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Selecciona una tipificación</option>
                        {tipifications.map((tip) => (
                            <option key={tip} value={tip}>
                                {tip}
                            </option>
                        ))}
                    </select>

                    {isAdmin && (
                        <select
                            id="assignedTo"
                            value={selectedAssignedTo}
                            onChange={(e) => setSelectedAssignedTo(e.target.value)}
                            className="p-2 w-full sm:w-auto text-xs text-gray-700 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="">Filtrar por asignado</option>
                            {assignedUsers.map((user) => (
                                <option key={user} value={user}>
                                    {user}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setSelectedTipification("");
                        setSelectedAssignedTo(""); // Limpiar el filtro de assignedTo también
                    }}
                    className="text-xs text-teal-600 hover:text-teal-800"
                >
                    Limpiar filtros
                </button>
            </div>


            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border shadow-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cédula</th>
                            <th className={cn("px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", {
                                "hidden": !isAdmin
                            })}>Asignado a</th>
                            <th className="sr-only">Tipificar</th>
                            <th className="sr-only">Coordenadas</th>
                            <th className="sr-only">Acciones</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200 mb-8">
                        {filteredProspects.map((p: IProspect, index: number) => (
                            <tr key={index} className="hover:shadow-md hover:bg-gray-200 transition duration-300 ease-in-out">
                                <td className="flex items-center px-4 py-3">
                                    <div className="w-10 h-10 overflow-hidden rounded-md">
                                        <Image className="img-responsive" src="img/user.svg" alt="" width={80} height={80} />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-900">{p.firstName} {p.lastName}</span>
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.phone1} {p.phone2}</td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.nId}</td>
                                <td className={cn("px-4 py-3 text-xs text-gray-700", {
                                    "hidden": !isAdmin
                                })}
                                >{p.assignedTo}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">{p.customerResponse}</td>
                                <td className="px-4 py-3 text-xs text-gray-700" title={p.location}>
                                    {p.location ? (
                                        <Link href={`https://www.google.com/maps?q=${p.location}`} target="_blank" className="text-teal-600 hover:text-teal-800 transition duration-300 ease-in-out">
                                            <CiLocationOn size={20} className="flex-shrink-0" />
                                        </Link>
                                    ) : <></>}
                                </td>
                                <td className={cn("px-4 py-3 text-xs text-gray-700", {
                                    "hidden": !isAdmin
                                })}>
                                    <div className="flex items-center justify-center">
                                        <Link href={`/prospects/${p.id}`} className="px-2 py-1">
                                            <FiEdit size={18} className="flex-shrink-0" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                    {filteredProspects.length === 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan={8} className="text-center text-sm py-6">
                                    No se encontraron prospectos. Intenta modificar los filtros o la búsqueda.
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>

        </div>
    )
}
