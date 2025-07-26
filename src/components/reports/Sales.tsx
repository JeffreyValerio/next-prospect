"use client"

import * as React from "react"
import { useMemo, useState } from "react"
import { Label, Legend, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
} from "@/components/ui/chart"
import { IProspect } from "@/interfaces/prospect.interface"
import { TrendingUp } from "lucide-react"

export function Sales({ prospects }: { prospects: IProspect[] }) {
  // Obtener meses únicos de los prospectos
  const monthsAvailable = useMemo(() => {
    const unique: Record<string, { label: string; value: string }> = {}

    prospects.forEach((p) => {
      if (!p.date) return
      const date = new Date(p.date)
      const key = `${date.getFullYear()}-${date.getMonth()}`
      if (!unique[key]) {
        const label = `${date.toLocaleString("es-ES", { month: "long" })} ${date.getFullYear()}`
        unique[key] = {
          label: label.charAt(0).toUpperCase() + label.slice(1),
          value: key,
        }
      }
    })

    return Object.values(unique).sort((a, b) => a.value > b.value ? -1 : 1)
  }, [prospects])

  const [selectedMonth, setSelectedMonth] = useState<string>(monthsAvailable[0]?.value ?? "")
  const [selectedYear, selectedMonthIndex] = selectedMonth.split("-").map(Number)

  // Filtrar prospectos del mes seleccionado
  const monthlyProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (!p.date) return false
      const date = new Date(p.date)
      return (
        date.getMonth() === selectedMonthIndex &&
        date.getFullYear() === selectedYear
      )
    })
  }, [prospects, selectedMonthIndex, selectedYear])

  // Filtrar ventas realizadas
  const filteredProspects = monthlyProspects.filter(
    (prospect) => prospect.customerResponse === "Venta realizada"
  )

  const groupedResponses = filteredProspects.reduce((acc, prospect) => {
    const response = prospect.customerResponse
    acc[response] = (acc[response] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(groupedResponses).map(([response, count]) => ({
    name: response,
    value: count,
    fill: `hsl(var(--chart-2))`,
  }))

  const conversionRate =
    monthlyProspects.length > 0
      ? ((filteredProspects.length / monthlyProspects.length) * 100).toFixed(2)
      : "0.00"

  const selectedLabel = monthsAvailable.find((m) => m.value === selectedMonth)?.label ?? ""

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ventas</CardTitle>
        <CardDescription className="capitalize">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-2 border rounded px-2 py-1 text-sm capitalize"
          >
            {monthsAvailable.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={{}}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Legend />
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {filteredProspects.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {filteredProspects.length === 1 ? "Venta" : "Ventas"}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground flex gap-1 items-center">
          Tasa de conversión mensual{" "}
          <strong>{conversionRate}%</strong>
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}
