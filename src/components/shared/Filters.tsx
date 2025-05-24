"use client";

import Link from "next/link";
import { Input } from "../ui/input";
import { IProspect } from "@/interfaces/prospect.interface";
import {
  Brush,
  UserPlus,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";

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

export const ProspectsFilter = ({
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
  const isAdmin = user?.user?.publicMetadata?.role === "admin";

  const filteredByDate = selectedDate
    ? prospects.filter((p) => p.date?.toString().startsWith(selectedDate))
    : prospects;

  const filteredByTipification = selectedTipification
    ? filteredByDate.filter((p) => p.customerResponse === selectedTipification)
    : filteredByDate;

  const filteredByAssignedTo = selectedAssignedTo
    ? filteredByDate.filter((p) => p.assignedTo === selectedAssignedTo)
    : filteredByDate;

  const tipificationCounts = filteredByAssignedTo.reduce(
    (acc: Record<string, number>, prospect) => {
      if (prospect.customerResponse) {
        acc[prospect.customerResponse] =
          (acc[prospect.customerResponse] || 0) + 1;
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
    <div className="z-10 rounded p-2 shadow bg-white">
      {/* Input de búsqueda */}
      <div className="grid grid-cols-[1fr_auto] w-full gap-2 mb-2">
        <Input
          value={search}
          placeholder="Buscar prospecto"
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-sm"
        />
        {isAdmin && (
          <Link
            href="/prospects/new"
            className="text-xs bg-primary text-secondary rounded px-3 py-2 flex items-center justify-center"
          >
            <UserPlus size={16} />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        {/* Fecha */}
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full min-w-[150px]"
        />

        {/* Asignado (si es admin) */}
        {isAdmin && (
          <Select onValueChange={onAssignedToChange} value={selectedAssignedTo}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar asignado" />
            </SelectTrigger>
            <SelectContent>
              {assignedUsers.map((user, idx) => (
                <SelectItem key={idx} value={user}>
                  {user} ({assignedUserCounts[user]})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Tipificación */}
        <Select
          value={selectedTipification}
          onValueChange={onTipificationChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccione tipificación" />
          </SelectTrigger>
          <SelectContent>
            {tipifications.map((tip, idx) => (
              <SelectItem key={idx} value={tip}>
                {tip} ({tipificationCounts[tip]})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={() => {
            onTipificationChange("");
            onAssignedToChange("");
            onDateChange("");
          }}
          className="text-xs rounded flex items-center gap-1"
        >
          <Brush size={16} />
          Limpiar filtros
        </Button>
      </div>

      {/* Botones */}
    </div>
  );
};
