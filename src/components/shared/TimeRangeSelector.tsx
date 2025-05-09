"use client";
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const TimeRangeSelector = ({
  timeRange,
  setTimeRange,
}: {
  timeRange: "90d" | "30d" | "7d";
  setTimeRange: React.Dispatch<React.SetStateAction<"90d" | "30d" | "7d">>;
}) => {
  return (
    <Select value={timeRange} onValueChange={(value: "90d" | "30d" | "7d") => setTimeRange(value)}>
      <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Seleccione un rango">
        <SelectValue placeholder="Últimos 3 meses" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="90d" className="rounded-lg">
          Últimos 3 meses
        </SelectItem>
        <SelectItem value="30d" className="rounded-lg">
          Últimos 30 días
        </SelectItem>
        <SelectItem value="7d" className="rounded-lg">
          Últimos 7 días
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
