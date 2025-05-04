'use client'

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Filters } from "../shared/Filters";
import { IProspect } from "@/interfaces/prospect.interface";
import { cn } from "@/lib/utils";
import { FiEdit } from "react-icons/fi";
import { CiLocationOn } from "react-icons/ci";

export const ProspectTable = ({ prospects, isAdmin }: { prospects: IProspect[], isAdmin: boolean }) => {
    const [search, setSearch] = useState("");
    const [selectedTipification, setSelectedTipification] = useState<string>("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");

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
        <div className="">

            <Filters
                prospects={prospects}
                isAdmin={isAdmin}
                search={search}
                onSearchChange={setSearch}
                selectedTipification={selectedTipification}
                onTipificationChange={setSelectedTipification}
                selectedAssignedTo={selectedAssignedTo}
                onAssignedToChange={setSelectedAssignedTo}
            />

            <div className="overflow-x-auto mt-2">
                <Table>
                    {filteredProspects.length === 0 && (
                        <TableCaption>No se encontraron prospectos. Intenta modificar los filtros o la búsqueda.</TableCaption>
                    )}
                    <TableHeader className="w-full">
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead className={cn("", { "hidden": !isAdmin })}>Asignado a</TableHead>
                            <TableHead className="sr-only">Tipificar</TableHead>
                            <TableHead className="sr-only">Coordenadas</TableHead>
                            <TableHead className="sr-only">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="">
                        {filteredProspects.map((p, index) => (
                            <TableRow key={index} className="hover:shadow-md hover:bg-gray-200 transition duration-300 ease-in-out">
                                <TableCell className="flex items-center gap-4">
                                    <Image src="img/user.svg" alt="" width={40} height={40} />
                                    {p.firstName} {p.lastName}
                                </TableCell>
                                <TableCell>{p.phone1} {p.phone2}</TableCell>
                                <TableCell>{p.nId}</TableCell>
                                <TableCell className={cn("", { "hidden": !isAdmin })}>{p.assignedTo}</TableCell>
                                <TableCell>{p.customerResponse}</TableCell>
                                <TableCell title={p.location}>
                                    {p.location && (
                                        <Link href={`https://www.google.com/maps?q=${p.location}`} target="_blank" className="flex justify-end text-teal-600 hover:text-teal-800 transition duration-300 ease-in-out">
                                            <CiLocationOn size={20} className="flex-shrink-0" />
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell className={cn("", { "hidden": !isAdmin })}>
                                    <Link href={`/prospects/${p.id}`} className="flex items-center justify-end">
                                        <FiEdit size={18} className="flex-shrink-0" />
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
