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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { IProspect } from "@/interfaces/prospect.interface"

const chartConfig = {} satisfies ChartConfig

export function UsersReport({ prospects }: { prospects: IProspect[] }) {
  // Generar lista de meses disponibles en los datos
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

  // Filtrar prospectos por mes seleccionado
  const monthlyProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (!p.date) return false
      const createdAt = new Date(p.date)
      return (
        createdAt.getMonth() === selectedMonthIndex &&
        createdAt.getFullYear() === selectedYear
      )
    })
  }, [prospects, selectedMonthIndex, selectedYear])

  const groupedResponses = monthlyProspects.reduce((acc, prospect) => {
    if (!prospect.customerResponse) return acc
    const response = prospect.customerResponse
    acc[response] = (acc[response] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(groupedResponses).map(
    ([response, count], index) => ({
      name: response,
      value: count,
      fill: `hsl(var(--chart-${(index % 5) + 1}))`,
    })
  )

  const totalResponses = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Prospectos</CardTitle>
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
        {monthlyProspects.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No hay prospectos registrados este mes.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const percent = ((data.value / totalResponses) * 100).toFixed(1)

                    return (
                      <div className="rounded-md bg-white p-2 shadow text-sm text-black">
                        <div><strong>{data.name}</strong></div>
                        <div>{data.value} {data.value > 1 ? "prospectos" : "prospecto"}</div>
                        <div>{percent}%</div>
                      </div>
                    )
                  }
                  return null
                }}
              />

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
                            {monthlyProspects.length}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {monthlyProspects.length > 1 ? "prospectos" : "prospecto"}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total de prospectos del mes
        </div>
      </CardFooter>
    </Card>
  )
}
