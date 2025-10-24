'use client'

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "../ui/button";
import { CiLocationOn } from "react-icons/ci";
import { cn } from "@/lib/utils";
import { FiEdit, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { Filters } from "../shared/Filters";
import { IProspect } from "@/interfaces/prospect.interface";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ButtonLoading, TableSkeleton } from "../ui/loading";
import { Checkbox } from "../ui/checkbox";

// Tipos para ordenamiento
type SortField = 'date' | 'firstName' | 'lastName' | 'nId' | 'assignedTo' | 'customerResponse';
type SortDirection = 'asc' | 'desc';

// Componente optimizado para el timer
const CountdownTimer = ({ assignedAt, customerResponse }: { assignedAt?: string; customerResponse?: string }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [hasExpired, setHasExpired] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!assignedAt) {
            setIsExpired(true);
            return;
        }

        const assignedDate = new Date(assignedAt);
        const expiration = assignedDate.getTime() + 30 * 60 * 1000; // 30 minutos
        const now = Date.now();
        
        // Verificar si ya expiró desde el inicio
        if (now > expiration) {
            setIsExpired(true);
            return;
        }

        // Calcular tiempo inicial
        const initialTimeLeft = expiration - now;
        setTimeLeft(initialTimeLeft);

        const interval = setInterval(() => {
            const currentTime = Date.now();
            const diff = expiration - currentTime;
            
            if (diff <= 0) {
                setTimeLeft(0);
                setIsExpired(true);
                if (!hasExpired) {
                    setHasExpired(true);
                    // Solo refrescar si el prospecto sigue siendo "Sin tipificar"
                    if (customerResponse === "Sin tipificar") {
                        router.refresh();
                    }
                }
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [assignedAt, hasExpired, customerResponse, router]);

    // Si no hay assignedAt o ya expiró, mostrar "Expirado"
    if (!assignedAt || isExpired || timeLeft === 0) {
        return <span className="text-red-600 font-medium px-2 py-1 rounded bg-red-50">Expirado</span>;
    }

    const minutes = Math.floor(timeLeft / (60 * 1000));
    const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
    const isWarning = timeLeft < 5 * 60 * 1000; // Menos de 5 minutos

    return (
        <span className={cn(
            "font-mono text-sm font-medium px-2 py-1 rounded",
            isWarning ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50"
        )}>
            {minutes}:{seconds.toString().padStart(2, "0")}
        </span>
    );
};

interface ProspectTableProps {
    prospects: IProspect[];
    isAdmin: boolean;
    itemsPerPage?: number;
}

export const ProspectTable = ({ prospects, isAdmin, itemsPerPage: externalItemsPerPage }: ProspectTableProps) => {
    // Estados principales
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTipification, setSelectedTipification] = useState<string>("");
    const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>("");

    // Estados para nuevas funcionalidades
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [selectedProspects, setSelectedProspects] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const [internalItemsPerPage] = useState(10);
    
    // Usar itemsPerPage externo si está disponible
    const itemsPerPage = externalItemsPerPage !== undefined ? externalItemsPerPage : internalItemsPerPage;

    const router = useRouter(); 
    
    // Función para verificar si un prospecto está expirado
    const isProspectExpired = useCallback((prospect: IProspect) => {
        // Solo considerar expirados si no tienen tipificación
        if (prospect.customerResponse && prospect.customerResponse !== "Sin tipificar") {
            return false;
        }
        
        // Si no tienen fecha de asignación, considerar expirados
        if (!prospect.assignedAt) {
            return true;
        }

        const assignedDate = new Date(prospect.assignedAt);
        const expiration = assignedDate.getTime() + 30 * 60 * 1000; // 30 minutos
        return Date.now() > expiration;
    }, []);
    
    // Función de ordenamiento optimizada
    const sortProspects = useCallback((prospects: IProspect[], field: SortField, direction: SortDirection) => {
        return [...prospects].sort((a, b) => {
            let aValue: string | number, bValue: string | number;
            
            switch (field) {
                case 'date':
                    aValue = new Date(a.date).getTime();
                    bValue = new Date(b.date).getTime();
                    break;
                case 'firstName':
                case 'lastName':
                    aValue = (a[field] ?? "").toLowerCase();
                    bValue = (b[field] ?? "").toLowerCase();
                    break;
                case 'nId':
                case 'assignedTo':
                case 'customerResponse':
                    aValue = (a[field] ?? "").toString().toLowerCase();
                    bValue = (b[field] ?? "").toString().toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, []);

    // Filtrado y ordenamiento optimizado con useMemo
    const filteredAndSortedProspects = useMemo(() => {
        const filtered = prospects.filter((p) => {
            // Filtros básicos
            const matchesSearch = search === "" || 
                `${p.firstName ?? ""} ${p.lastName ?? ""}`.toLowerCase().includes(search.toLowerCase()) ||
                String(p.nId ?? "").includes(search) ||
                String(p.assignedTo ?? "").toLowerCase().includes(search.toLowerCase());
                
            const matchesTipification = selectedTipification === "" || selectedTipification === p.customerResponse;
            const matchesAssignedTo = selectedAssignedTo === "" || selectedAssignedTo === p.assignedTo;
            const matchesDate = !selectedDate || (p.date && p.date.startsWith(selectedDate));
            
            // Verificar que el prospecto no esté expirado para usuarios no admin
            // Los admin pueden ver todos los prospectos, incluidos los expirados
            const isExpired = isProspectExpired(p);
            const shouldShowExpired = isAdmin || !isExpired;
            
            return matchesSearch && matchesTipification && matchesAssignedTo && matchesDate && shouldShowExpired;
        });
        
        return sortProspects(filtered, sortField, sortDirection);
    }, [prospects, search, selectedTipification, selectedAssignedTo, selectedDate, sortField, sortDirection, sortProspects, isAdmin, isProspectExpired]);

    // Funciones de utilidad optimizadas
    const handleSort = useCallback((field: SortField) => {
        setSortDirection(prev => 
            sortField === field && prev === 'asc' ? 'desc' : 'asc'
        );
        setSortField(field);
    }, [sortField]);

    const handleSelectProspect = useCallback((prospectId: string) => {
        setSelectedProspects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(prospectId)) {
                newSet.delete(prospectId);
            } else {
                newSet.add(prospectId);
            }
            return newSet;
        });
    }, []);

    // Paginación optimizada - debe ir antes de handleSelectAll
    const totalPages = Math.ceil(filteredAndSortedProspects.length / itemsPerPage);
    const paginatedProspects = useMemo(() => 
        filteredAndSortedProspects.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        ), [filteredAndSortedProspects, currentPage, itemsPerPage]
    );

    const handleSelectAll = useCallback(() => {
        if (selectedProspects.size === paginatedProspects.length) {
            setSelectedProspects(new Set());
        } else {
            setSelectedProspects(new Set(paginatedProspects.map(p => p.id)));
        }
    }, [selectedProspects.size, paginatedProspects]);
        
    // Efectos optimizados
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedTipification, selectedAssignedTo, selectedDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);
    
    return (
        <div className="h-[calc(100vh-120px)] flex flex-col">
            {/* Header con controles adicionales */}
            <div className="mb-4 flex-shrink-0">
                {selectedProspects.size > 0 && (
                    <div className="mb-2">
                        <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                            {selectedProspects.size} seleccionados
                        </span>
                    </div>
                )}
            </div>

            <div className="mb-4 flex-shrink-0">
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
            </div>

            {/* Contenedor principal que ocupa todo el espacio disponible */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 shadow-lg border rounded-lg overflow-hidden">
                {isInitialLoading ? (
                    <div className="w-full p-4">
                        <TableSkeleton rows={8} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <Table className="w-full flex-1">
                            {filteredAndSortedProspects.length === 0 && (
                                <TableCaption className="py-8 text-gray-500">
                                    No se encontraron prospectos. Intenta modificar los filtros o la búsqueda.
                                </TableCaption>
                            )}

                            <TableHeader className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-10">
                        <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={selectedProspects.size === paginatedProspects.length && paginatedProspects.length > 0}
                                            onCheckedChange={handleSelectAll}
                                        />
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            Fecha
                                            {sortField === 'date' && (
                                                sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('firstName')}>
                                        <div className="flex items-center gap-1">
                                            Nombre
                                            {sortField === 'firstName' && (
                                                sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('nId')}>
                                        <div className="flex items-center gap-1">
                                            Cédula
                                            {sortField === 'nId' && (
                                                sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className={cn("cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800", { hidden: !isAdmin })} onClick={() => handleSort('assignedTo')}>
                                        <div className="flex items-center gap-1">
                                            Asignado
                                            {sortField === 'assignedTo' && (
                                                sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleSort('customerResponse')}>
                                        <div className="flex items-center gap-1">
                                            Respuesta
                                            {sortField === 'customerResponse' && (
                                                sortDirection === 'asc' ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />
                                            )}
                                        </div>
                                    </TableHead>
                                    <TableHead>Tiempo</TableHead>
                                    <TableHead>Ubicación</TableHead>
                                    <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>

                            <TableBody className="overflow-y-auto">
                        {paginatedProspects.map((p, index) => (
                                <TableRow 
                                    key={p.id || index} 
                                    className={cn(
                                        "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200",
                                        selectedProspects.has(p.id) && "bg-blue-50 dark:bg-blue-950",
                                        isProspectExpired(p) && "bg-red-50 dark:bg-red-950 border-l-4 border-red-400 dark:border-red-600"
                                    )}
                                >
                                <TableCell>
                                            <Checkbox
                                                checked={selectedProspects.has(p.id)}
                                                onCheckedChange={() => handleSelectProspect(p.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                    {new Date(p.date).toLocaleString("es-CR", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                        {p.firstName?.[0]}{p.lastName?.[0]}
                                                    </span>
                                                </div>
                                                <div className="font-medium dark:text-gray-100">{p.firstName} {p.lastName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm dark:text-gray-300">{p.nId}</TableCell>
                                        <TableCell className={cn("text-sm", { hidden: !isAdmin })}>
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                p.assignedTo === "Sin asignar" 
                                                    ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400" 
                                                    : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                                            )}>
                                                {p.assignedTo === "Sin asignar" 
                                                    ? "Sin asignar" 
                                                    : p.assignedTo?.split(' ').slice(0, 2).map((name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                p.customerResponse === "Sin tipificar" 
                                                    ? "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                                                    : p.customerResponse === "Venta realizada"
                                                    ? "bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300"
                                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                            )}>
                                                {p.customerResponse}
                                            </span>
                                </TableCell>
                                <TableCell>
                                            {p.customerResponse === "Sin tipificar" && p.assignedTo !== "Sin asignar" ? (
                                                <CountdownTimer assignedAt={p.assignedAt} customerResponse={p.customerResponse} />
                                    ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </TableCell>
                                        <TableCell>
                                    {p.location && (
                                                <Link 
                                                    href={`https://www.google.com/maps?q=${p.location}`} 
                                                    target="_blank" 
                                                    className="inline-flex items-center justify-center w-8 h-8 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-full transition-colors duration-200"
                                                    title="Ver ubicación"
                                                >
                                                    <CiLocationOn size={18} />
                                        </Link>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        onClick={() => {
                                            setLoadingId(p.id);
                                            router.push(`/prospects/${p.id}`);
                                        }}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-2"
                                                disabled={!isAdmin && isProspectExpired(p)}
                                                title={!isAdmin && isProspectExpired(p) ? "Prospecto expirado" : ""}
                                    >
                                        {loadingId === p.id ? (
                                                    <ButtonLoading size="sm" />
                                        ) : (
                                                    <>
                                                        <FiEdit size={14} />
                                                        Editar
                                                    </>
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                    </div>
                )}
                </div>
            </div>
            
            {/* Paginación mejorada - fija en la parte inferior */}
            <div className="flex justify-between items-center py-4 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex-shrink-0">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedProspects.length)} de {filteredAndSortedProspects.length} prospectos
                </div>
                
            {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1"
                        >
                            Primera
                        </Button>
                    <Button
                        size="sm"
                            variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                    >
                        &laquo;
                    </Button>

                        {/* Ventana de páginas */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let page;
                            if (totalPages <= 5) {
                                page = i + 1;
                            } else if (currentPage <= 3) {
                                page = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                page = totalPages - 4 + i;
                            } else {
                                page = currentPage - 2 + i;
                            }
                            
                            return (
                            <Button
                                key={page}
                                    size="sm"
                                variant={page === currentPage ? "default" : "outline"}
                                onClick={() => setCurrentPage(page)}
                                className="w-8 h-8 p-0"
                            >
                                {page}
                            </Button>
                            );
                        })}

                            <Button
                                size="sm"
                            variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1"
                        >
                            Última
                    </Button>
                </div>
            )}
            </div>
        </div>
    )
}
