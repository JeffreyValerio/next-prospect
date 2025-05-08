'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "../ui/button";
import { CiLocationOn } from "react-icons/ci";
import { cn } from "@/lib/utils";
import { FiEdit } from "react-icons/fi";
import { Filters } from "../shared/Filters";
import { IProspect } from "@/interfaces/prospect.interface";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export const ProspectTable = ({ prospects, isAdmin }: { prospects: IProspect[], isAdmin: boolean }) => {

    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedTipification, setSelectedTipification] = useState<string>("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;


    const router = useRouter();

    useEffect(() => {
        prospects.forEach((p) => {
            router.prefetch(`/prospects/${p.id}`);
        });
    }, [prospects, router]);

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

        const matchesDate =
            !selectedDate ||
            (p.date && p.date.startsWith(selectedDate)); // si p.date es '2025-05-06, 15:00'

        return matchesSearch && matchesTipification && matchesAssignedTo && matchesDate;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedTipification, selectedAssignedTo, selectedDate]);

    const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
    const paginatedProspects = filteredProspects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="">
            <Filters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                prospects={prospects}
                search={search}
                onSearchChange={setSearch}
                selectedTipification={selectedTipification}
                onTipificationChange={setSelectedTipification}
                selectedAssignedTo={selectedAssignedTo}
                onAssignedToChange={setSelectedAssignedTo}
            />

            <div className="max-h-[450px] shadow flex overflow-y-auto relative mt-2 rounded">
                <Table className="w-full">
                    {filteredProspects.length === 0 && (
                        <TableCaption className="mb-3">No se encontraron prospectos. Intenta modificar los filtros o la búsqueda.</TableCaption>
                    )}

                    <TableHeader className="sticky bg-white w-full top-0 shadow h-[20px]">
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Cédula</TableHead>
                            <TableHead className={cn("", { hidden: !isAdmin })}>Asignado</TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {paginatedProspects.map((p, index) => (
                            <TableRow key={index} className="hover:shadow-md transition duration-300 ease-in-out">
                                <TableCell className="flex items-center gap-4">
                                    <Image src="/img/user.svg" alt="" width={40} height={40} />
                                    {p.firstName} {p.lastName}
                                </TableCell>
                                <TableCell> {p.phone1}{p.phone2 ? `, ${p.phone2}` : ""}</TableCell>
                                <TableCell>{p.nId}</TableCell>
                                <TableCell className={cn("", { hidden: !isAdmin })}>{p.assignedTo}</TableCell>
                                <TableCell>{p.customerResponse}</TableCell>
                                <TableCell title={p.location}>
                                    {p.location && (
                                        <Link href={`https://www.google.com/maps?q=${p.location}`} target="_blank" className="flex justify-end text-teal-600 hover:text-teal-800 transition duration-300 ease-in-out">
                                            <CiLocationOn size={20} className="flex-shrink-0" />
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => {
                                            setLoadingId(p.id);
                                            router.push(`/prospects/${p.id}`);
                                        }}
                                        variant={'outline'}
                                        className="flex items-center justify-center"
                                        size={"icon"}
                                    >
                                        {loadingId === p.id ? (
                                            <span className="animate-spin border-2 border-t-transparent rounded-full w-4 h-4 border-gray-500"></span>
                                        ) : (
                                            <FiEdit size={18} className="flex-shrink-0" color="gray" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>


            </div>
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-1 py-4 flex-wrap">

                    {/* Botón anterior */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        &laquo;
                    </Button>

                    {/* Página 1 siempre visible */}
                    {currentPage > 3 && (
                        <>
                            <Button
                                size="sm"
                                variant={currentPage === 1 ? "default" : "outline"}
                                onClick={() => setCurrentPage(1)}
                                className="w-8 h-8 p-0"
                            >
                                1
                            </Button>
                            <span className="text-muted-foreground px-1">...</span>
                        </>
                    )}

                    {/* Ventana de páginas centradas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                            (page) =>
                                page === currentPage ||
                                page === currentPage - 1 ||
                                page === currentPage + 1
                        )
                        .map((page) => (
                            <Button
                                key={page}
                                variant={page === currentPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                            >
                                {page}
                            </Button>
                        ))}

                    {/* Última página siempre visible */}
                    {currentPage < totalPages - 2 && (
                        <>
                            <span className="text-muted-foreground px-1">...</span>
                            <Button
                                size="sm"
                                variant={currentPage === totalPages ? "default" : "outline"}
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-8 h-8 p-0"
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}

                    {/* Botón siguiente */}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </Button>
                </div>
            )}


        </div>
    )
}
