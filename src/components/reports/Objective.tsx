"use client"

import { useMemo, useState } from "react"
import { TrendingUp } from "lucide-react"
import {
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  Label,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"
import { IProspect } from "@/interfaces/prospect.interface"

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
} satisfies ChartConfig

export function Objective({ prospects, isAdmin }: { prospects: IProspect[], isAdmin: boolean }) {
  // Generar meses disponibles
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

  const assignedUsers = prospects
    .filter((p) => {
      const date = new Date(p.date)
      const isSameMonth = date.getMonth() === selectedMonthIndex && date.getFullYear() === selectedYear
      return isSameMonth && p.assignedTo?.trim()
    })
    .map((p) => p.assignedTo?.trim())

  const uniqueSellers = Array.from(new Set(assignedUsers))

  const SALES_GOAL = isAdmin ? uniqueSellers.length * 6 : 6

  const salesCount = prospects.filter((prospect) => {
    const date = new Date(prospect.date)
    const isSale = prospect.customerResponse === "Venta realizada"
    const isSameMonth = date.getMonth() === selectedMonthIndex && date.getFullYear() === selectedYear
    return isSale && isSameMonth
  }).length

  const progress = salesCount / SALES_GOAL
  let progressColor = "hsl(var(--chart-2))"

  if (progress >= 1) {
    progressColor = "hsl(var(--chart-2))"
  } else if (progress >= 0.5) {
    progressColor = "hsl(var(--chart-4))"
  } else {
    progressColor = "hsl(var(--destructive))"
  }

  const chartData = [
    {
      name: "Meta",
      visitors: SALES_GOAL,
      fill: "hsl(var(--muted))",
    },
    {
      name: "Ventas",
      visitors: salesCount,
      fill: progressColor,
    },
  ]

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Objetivo de Ventas</CardTitle>
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
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={90}
            endAngle={450}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              polarRadius={[86, 74]}
            />
            <RadialBar
              dataKey="visitors"
              background={false}
              cornerRadius={10}
            />
            <PolarRadiusAxis
              domain={[0, SALES_GOAL]}
              tick={false}
              tickLine={false}
              axisLine={false}
            >
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
                          className="fill-foreground text-4xl font-bold"
                        >
                          {salesCount}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm"
                        >
                          de {SALES_GOAL} ventas
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Progreso mensual <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Objetivo para el mes seleccionado
        </div>
      </CardFooter>
    </Card>
  )
}
