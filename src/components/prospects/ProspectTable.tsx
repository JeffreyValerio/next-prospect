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
import { IUser } from "@/interfaces/user.interface";
import { useGlobalData } from "@/contexts/GlobalDataContext";
import { bulkUpdateProspects } from "@/actions/prospects/bulk-update";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ButtonLoading, TableSkeleton } from "../ui/loading";
import { Checkbox } from "../ui/checkbox";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { useUser } from "@clerk/nextjs";
import { parseDateString, formatDateForDisplay } from "@/lib/date-utils";

// Tipos para ordenamiento
type SortField = 'date' | 'firstName' | 'lastName' | 'nId' | 'assignedTo' | 'customerResponse';
type SortDirection = 'asc' | 'desc';

const TIPIFICATION_OPTIONS = [
    "Sin tipificar",
    "Alquila con los servicios incluidos",
    "Venta realizada",
    "No interesado",
    "Llamar más tarde",
    "Sin respuesta",
    "Número equivocado",
    "Dejó en visto",
    "Reprogramar cita",
    "No volver a llamar",
    "Interesado en información",
    "Cliente existente",
    "Referido",
    "Permanencia",
    "Seguimiento",
    "Buzón de voz",
    "Se envía información por WhatsApp",
    "Corta la llamada",
    "No red",
    "Trabajando",
    "El número no existe",
    "Incobrable",
    "Pendiente datos de venta",
    "Mala experiencia",
    "Contrata competencia",
] as const;

const getProspectMonthKey = (dateValue?: string) => {
    if (!dateValue) return "";

    // Usar el parser de fechas que maneja múltiples formatos
    const parsed = parseDateString(dateValue);
    if (parsed && !Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 7);
    }

    return "";
};

// Componente optimizado para el timer
const CountdownTimer = ({ assignedAt, customerResponse }: { assignedAt?: string; customerResponse?: string }) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [hasExpired, setHasExpired] = useState(false);
    const [isExpired, setIsExpired] = useState(false);

    const router = useRouter();

    useEffect(() => {
        // Si no hay assignedAt, no hay tiempo para mostrar
        if (!assignedAt) {
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

    // Si no hay assignedAt, no mostrar nada
    if (!assignedAt) {
        return <span className="text-gray-400 text-sm">-</span>;
    }

    // Si ya expiró, mostrar "Expirado"
    if (isExpired || timeLeft === 0) {
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

    const { user } = useUser();
    const { users } = useGlobalData();
    const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
    const [isBulkTipifyOpen, setIsBulkTipifyOpen] = useState(false);
    const [bulkAssignee, setBulkAssignee] = useState<string>("");
    const [bulkTipification, setBulkTipification] = useState<string>("");
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const router = useRouter(); 

    const assigneeOptions = useMemo(() => {
        const typedUsers = Array.isArray(users) ? (users as IUser[]) : [];
        const names = typedUsers
            .map((user) => user.fullName?.trim())
            .filter((name): name is string => Boolean(name));
        const uniqueNames = Array.from(new Set(names));
        return ["Sin asignar", ...uniqueNames];
    }, [users]);

    const selectedProspectsList = useMemo(
        () => prospects.filter((prospect) => selectedProspects.has(prospect.id)),
        [prospects, selectedProspects]
    );

    type BulkActionResult = Awaited<ReturnType<typeof bulkUpdateProspects>>;

    const canManageBulkActions = useMemo(() => {
        if (!isAdmin || !user) return false;
        const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase();
        return primaryEmail === "cvalerioa24@gmail.com";
    }, [isAdmin, user]);

    const handleBulkActionResult = useCallback(
        (result: BulkActionResult, onSuccess?: () => void) => {
            if (result.ok) {
                const successCount = result.successes.length;
                toast.success(
                    successCount === 1
                        ? "Se actualizó 1 prospecto correctamente."
                        : `Se actualizaron ${successCount} prospectos correctamente.`,
                    {
                        position: "bottom-right",
                        autoClose: 4000,
                        theme: "dark",
                    }
                );
                onSuccess?.();
                setSelectedProspects(new Set());
                router.refresh();
                return;
            }

            if (result.successes.length > 0) {
                toast.warning(
                    `Se actualizaron ${result.successes.length} prospectos, pero ${result.failures.length} no se pudieron actualizar.`,
                    {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "dark",
                    }
                );
                router.refresh();
            } else {
                toast.error(
                    "No fue posible completar la acción masiva. Intenta nuevamente.",
                    {
                        position: "bottom-right",
                        autoClose: 5000,
                        theme: "dark",
                    }
                );
            }

            const failedIds = new Set(
                result.failures
                    .map((failure) => failure.id)
                    .filter((id) => selectedProspectsList.some((prospect) => prospect.id === id))
            );

            if (failedIds.size > 0) {
                setSelectedProspects(new Set(failedIds));
            }
        },
        [router, selectedProspectsList]
    );

    const handleBulkAssign = useCallback(async () => {
        if (!canManageBulkActions) {
            toast.error("No tienes permisos para reasignar prospectos masivamente.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        if (!bulkAssignee) {
            toast.error("Selecciona un usuario para reasignar los prospectos.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        if (selectedProspectsList.length === 0) {
            toast.error("No hay prospectos seleccionados para reasignar.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        const timestamp = new Date().toLocaleString("es-CR", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

        setIsBulkProcessing(true);
        try {
            const updates = selectedProspectsList.map((prospect) => {
                const isChangingAssignee = prospect.assignedTo !== bulkAssignee;
                return {
                    ...prospect,
                    assignedTo: bulkAssignee,
                    assignedAt:
                        bulkAssignee === "Sin asignar"
                            ? ""
                            : isChangingAssignee
                                ? timestamp
                                : prospect.assignedAt,
                };
            });

            const result = await bulkUpdateProspects(updates);
            handleBulkActionResult(result, () => {
                setIsBulkAssignOpen(false);
                setBulkAssignee("");
            });
        } catch (error) {
            console.error("Error al reasignar prospectos:", error);
            toast.error("Ocurrió un error al reasignar los prospectos.", {
                position: "bottom-right",
                autoClose: 5000,
                theme: "dark",
            });
        } finally {
            setIsBulkProcessing(false);
        }
    }, [bulkAssignee, handleBulkActionResult, selectedProspectsList, canManageBulkActions]);

    const handleBulkTipify = useCallback(async () => {
        if (!canManageBulkActions) {
            toast.error("No tienes permisos para tipificar prospectos masivamente.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        if (!bulkTipification) {
            toast.error("Selecciona una tipificación para actualizar los prospectos.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        if (selectedProspectsList.length === 0) {
            toast.error("No hay prospectos seleccionados para tipificar.", {
                position: "bottom-right",
                autoClose: 4000,
                theme: "dark",
            });
            return;
        }

        setIsBulkProcessing(true);
        try {
            const updates = selectedProspectsList.map((prospect) => ({
                ...prospect,
                customerResponse: bulkTipification,
            }));

            const result = await bulkUpdateProspects(updates);
            handleBulkActionResult(result, () => {
                setIsBulkTipifyOpen(false);
                setBulkTipification("");
            });
        } catch (error) {
            console.error("Error al tipificar prospectos:", error);
            toast.error("Ocurrió un error al tipificar los prospectos.", {
                position: "bottom-right",
                autoClose: 5000,
                theme: "dark",
            });
        } finally {
            setIsBulkProcessing(false);
        }
    }, [bulkTipification, handleBulkActionResult, selectedProspectsList, canManageBulkActions]);
    
    // Función para verificar si un prospecto está expirado
    const isProspectExpired = useCallback((prospect: IProspect) => {
        // Solo considerar expirados si están asignados
        if (!prospect.assignedTo || prospect.assignedTo === "Sin asignar") {
            return false;
        }
        
        // Solo considerar expirados si tienen "Sin tipificar"
        if (prospect.customerResponse && prospect.customerResponse !== "Sin tipificar") {
            return false;
        }
        
        // Si no tienen fecha de asignación, no están expirados todavía
        if (!prospect.assignedAt) {
            return false;
        }

        // Solo están expirados si han pasado más de 30 minutos desde la asignación
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
                    const aDate = parseDateString(a.date);
                    const bDate = parseDateString(b.date);
                    aValue = aDate ? aDate.getTime() : 0;
                    bValue = bDate ? bDate.getTime() : 0;
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
            const matchesDate = !selectedDate || getProspectMonthKey(p.date) === selectedDate;
            
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
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                            {selectedProspects.size} seleccionados
                        </span>

                        {canManageBulkActions && (
                            <Dialog
                                open={isBulkAssignOpen}
                                onOpenChange={(open) => {
                                    setIsBulkAssignOpen(open);
                                    if (!open) {
                                        setBulkAssignee("");
                                    }
                                }}
                            >
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                                        Reasignar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reasignar prospectos</DialogTitle>
                                        <DialogDescription>
                                            Selecciona el usuario al que deseas reasignar los prospectos seleccionados.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                                Usuario asignado
                                            </Label>
                                            <Select value={bulkAssignee} onValueChange={setBulkAssignee}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecciona un usuario" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {assigneeOptions.map((option) => (
                                                        <SelectItem key={option} value={option}>
                                                            {option}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Se actualizarán {selectedProspects.size} prospectos.
                                        </p>
                                    </div>
                                    <DialogFooter className="gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsBulkAssignOpen(false);
                                                setBulkAssignee("");
                                            }}
                                            disabled={isBulkProcessing}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleBulkAssign}
                                            disabled={!bulkAssignee || isBulkProcessing}
                                            className="flex items-center gap-2"
                                        >
                                            {isBulkProcessing ? (
                                                <>
                                                    <ButtonLoading size="sm" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                "Confirmar"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {canManageBulkActions && (
                        <Dialog
                            open={isBulkTipifyOpen}
                            onOpenChange={(open) => {
                                setIsBulkTipifyOpen(open);
                                if (!open) {
                                    setBulkTipification("");
                                }
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                    Tipificar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tipificar prospectos</DialogTitle>
                                    <DialogDescription>
                                        Define la respuesta del cliente para los prospectos seleccionados.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                            Tipificación
                                        </Label>
                                        <Select value={bulkTipification} onValueChange={setBulkTipification}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona un estado" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-72 overflow-y-auto">
                                                {TIPIFICATION_OPTIONS.map((option) => (
                                                    <SelectItem key={option} value={option}>
                                                        {option}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Se actualizarán {selectedProspects.size} prospectos.
                                    </p>
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsBulkTipifyOpen(false);
                                            setBulkTipification("");
                                        }}
                                        disabled={isBulkProcessing}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleBulkTipify}
                                        disabled={!bulkTipification || isBulkProcessing}
                                        className="flex items-center gap-2"
                                    >
                                        {isBulkProcessing ? (
                                            <>
                                                <ButtonLoading size="sm" />
                                                Procesando...
                                            </>
                                        ) : (
                                            "Confirmar"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        )}
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
                                    {formatDateForDisplay(p.date)}
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
