"use client"

import * as React from "react"
import { Label, Legend, Pie, PieChart } from "recharts"
import { Badge } from "@/components/ui/badge"
import { Users, Target } from "lucide-react"

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
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

const chartConfig = {} satisfies ChartConfig

export function UsersReport({ isAdmin = false }: { isAdmin?: boolean }) {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects
  const groupedResponses = (prospects || []).reduce((acc, prospect) => {
    if (!prospect.customerResponse) return acc;

    const response = prospect.customerResponse;
    acc[response] = (acc[response] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedResponses).map(([response, count], index) => ({
    name: response,
    value: count,
    fill: `hsl(var(--chart-${(index % 5) + 1}))`,
  }));

  const totalResponses = chartData.reduce((sum, d) => sum + d.value, 0)
  
  // Calcular métricas adicionales
  const sales = prospects.filter(p => p.customerResponse === "Venta realizada").length
  const conversionRate = totalResponses > 0 ? (sales / totalResponses * 100) : 0
  
  // Calcular prospectos por usuario
  const usersCount = prospects.reduce((acc, prospect) => {
    if (prospect.assignedTo && !acc.includes(prospect.assignedTo)) {
      acc.push(prospect.assignedTo)
    }
    return acc
  }, [] as string[]).length

  return (
    <Card className="flex flex-col border-l-4 border-l-blue-500">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          {isAdmin ? "Prospectos por Usuario" : "Mis Prospectos"}
        </CardTitle>
        <CardDescription>
          {isAdmin ? "Distribución de prospectos asignados" : "Distribución de mis prospectos asignados"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percent = ((data.value / totalResponses) * 100).toFixed(1);

                  return (
                    <div className="rounded-md bg-white p-3 shadow-lg text-sm text-black border">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-gray-600">{data.value} {data.value > 1 ? "prospectos" : "prospecto"}</div>
                      <div className="text-blue-600 font-medium">{percent}%</div>
                    </div>
                  );
                }
                return null;
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
                          {prospects.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {prospects.length > 1 ? "prospectos" : "prospecto"}
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
      <CardFooter className="flex-col gap-3 text-sm">
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{sales}</div>
            <div className="text-xs text-gray-500">Ventas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{usersCount}</div>
            <div className="text-xs text-gray-500">Usuarios</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {conversionRate.toFixed(1)}% conversión
          </Badge>
        </div>
        
        <div className="leading-none text-muted-foreground text-center">
          {isAdmin ? "Total de prospectos asignados" : "Total de mis prospectos asignados"}
        </div>
      </CardFooter>
    </Card>
  )
}
