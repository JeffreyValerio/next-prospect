"use client"

import * as React from "react"
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
} from "@/components/ui/chart"
import { Target, DollarSign } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ChartTooltip } from "@/components/ui/chart"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

const chartConfig = {} satisfies ChartConfig

export function Sales({ isAdmin = false }: { isAdmin?: boolean }) {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects

   const now = new Date()
    const currentMonthName = now.toLocaleString("es-ES", { month: "long" });
    const currentYear = now.getFullYear()

         const salesProspects = prospects.filter((prospect) => prospect.customerResponse === "Venta realizada");

  const groupedResponses = salesProspects.reduce((acc, prospect) => {
    if (!prospect.customerResponse) return acc;

    const response = prospect.customerResponse;
    acc[response] = (acc[response] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedResponses).map(([response, count]) => ({
    name: response,
    value: count,
    fill: `hsl(var(--chart-2))`,
  }));

         // Calcular métricas adicionales
         const conversionRate = prospects.length > 0 ? (salesProspects.length / prospects.length * 100) : 0
  
  // Calcular ventas del mes anterior para comparación
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
         const salesLastMonth = prospects.filter(p => {
           const prospectDate = new Date(p.date)
           return prospectDate.getMonth() === lastMonth.getMonth() &&
                  prospectDate.getFullYear() === lastMonth.getFullYear() &&
                  p.customerResponse === "Venta realizada"
         }).length

         const salesGrowth = salesLastMonth > 0 ? ((salesProspects.length - salesLastMonth) / salesLastMonth * 100) : 0

  return (
    <Card className="flex flex-col border-l-4 border-l-green-500">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          {isAdmin ? "Ventas Realizadas" : "Mis Ventas Realizadas"}
        </CardTitle>
        <CardDescription className="capitalize">{currentMonthName} {currentYear}</CardDescription>
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
                  return (
                    <div className="rounded-md bg-white p-3 shadow-lg text-sm text-black border">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-gray-600">{data.value} {data.value > 1 ? "ventas" : "venta"}</div>
                      <div className="text-green-600 font-medium">100%</div>
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
                                 {salesProspects.length}
                               </tspan>
                               <tspan
                                 x={viewBox.cx}
                                 y={(viewBox.cy || 0) + 24}
                                 className="fill-muted-foreground"
                               >
                                 {salesProspects.length > 1 ? "Ventas" : "Venta"}
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
            <div className="text-lg font-bold text-green-600">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">Conversión</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {salesGrowth >= 0 ? '+' : ''}{salesGrowth.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Crecimiento</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {conversionRate.toFixed(1)}% tasa de conversión
          </Badge>
        </div>
        
        <div className="leading-none text-muted-foreground text-center">
          Ventas completadas este mes
        </div>
      </CardFooter>
    </Card>
  );
}