"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Edit, MapPinned } from "lucide-react";
import { IProspect } from "@/interfaces/prospect.interface";
import { useEffect, useMemo, useState } from "react";
import { ProspectsFilter } from "../shared/Filters";
import { formatDate } from "@/utils/format-date";
import { ProspectsPagination } from "./pagination";

export const ProspectsTable = ({
  prospects,
  isAdmin,
}: {
  prospects: IProspect[];
  isAdmin: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedAssignedTo, setSelectedAssignedTo] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTipification, setSelectedTipification] = useState<string>("");

  const filteredProspects = useMemo(() => {
    return prospects
      .filter((p: IProspect) => {
        const matchesSearch =
          `${p.firstName ?? ""} ${p.lastName ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          String(p.phone1 ?? "").includes(search) ||
          String(p.phone2 ?? "").includes(search) ||
          String(p.nId ?? "").includes(search) ||
          String(p.assignedTo ?? "")
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesTipification =
          selectedTipification === "" ||
          selectedTipification === p.customerResponse;

        const matchesAssignedTo =
          selectedAssignedTo === "" || selectedAssignedTo === p.assignedTo;

        const matchesDate =
          !selectedDate || (p.date && p.date.startsWith(selectedDate));

        return (
          matchesSearch &&
          matchesTipification &&
          matchesAssignedTo &&
          matchesDate
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [
    prospects,
    search,
    selectedTipification,
    selectedAssignedTo,
    selectedDate,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);
  const paginatedProspects = filteredProspects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <ProspectsFilter
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

      <div className="rounded border overflow-hidden overflow-y-auto max-h-[calc(100vh-200px)] pb-10">
        <Table>
          <TableHeader className="sticky w-full top-0 shadow h-[20px] bg-primary-foreground">
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className={cn("", { hidden: !isAdmin })}>
                Asignado
              </TableHead>
              <TableHead></TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedProspects.map((p, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(p.date)}</TableCell>
                <TableCell className="capitalize">
                  <p className="font-medium">
                    {p.firstName} {p.lastName}
                  </p>
                  <small> {p.nId}</small>
                </TableCell>
                <TableCell>
                  {isAdmin ? <p className="font-medium">{p.assignedTo}</p> : ""}
                  <p className={cn("", { "text-xs": isAdmin })}>
                    {p.customerResponse}
                  </p>
                </TableCell>
                <TableCell title={p.location}>
                  {p.location ? (
                    <Link
                      href={`https://www.google.com/maps?q=${p.location}`}
                      target="_blank"
                    >
                      <MapPinned size={18} className="flex-shrink-0" />
                    </Link>
                  ) : (
                    <></>
                  )}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/prospects/${p.id}`}
                    title={`Editar prospecto ${p.firstName}`}
                    className="flex items-center justify-center"
                  >
                    <Edit size={18} className="flex-shrink-0 text-yellow-600" />
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <ProspectsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
        />
      )}
    </>
  );
};
