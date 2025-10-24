"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { 
  Phone, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IProspect } from "@/interfaces/prospect.interface"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

const chartConfig = {
  calls: {
    label: "Llamadas",
    color: "hsl(var(--chart-1))",
  },
  sales: {
    label: "Ventas",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

function transformProspectsToChartData(prospects: IProspect[]) {
  const grouped: Record<string, { calls: number; sales: number }> = {};

  for (const prospect of prospects) {
    if (!prospect.customerResponse) continue;

    const rawDate = new Date(prospect.date); // asegura que tu IProspect tenga "date" como string o Date
    const date = rawDate.toISOString().split("T")[0]; // formato YYYY-MM-DD

    if (!grouped[date]) {
      grouped[date] = { calls: 0, sales: 0 };
    }

    grouped[date].calls += 1; 

    const lower = prospect.customerResponse.toLowerCase();
    const isSale = lower.includes("venta") || lower.includes("realizada");

    if (isSale) {
      grouped[date].sales += 1;
    }
  }

  return Object.entries(grouped)
    .map(([date, { calls, sales }]) => ({
      date,
      calls,
      sales,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function CallAndSales({ isAdmin = false }: { isAdmin?: boolean }) {
  const { filteredProspects } = useDashboardContext()
  const prospects = filteredProspects

  const rawData = React.useMemo(
    () => transformProspectsToChartData(prospects || []),
    [prospects]
  );

  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = rawData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  // Calcular métricas adicionales
  const totalCalls = filteredData.reduce((sum, item) => sum + item.calls, 0)
  const totalSales = filteredData.reduce((sum, item) => sum + item.sales, 0)
  const conversionRate = totalCalls > 0 ? (totalSales / totalCalls * 100) : 0
  
  // Calcular crecimiento comparado con el período anterior
  const previousPeriodData = rawData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 180
    if (timeRange === "30d") {
      daysToSubtract = 60
    } else if (timeRange === "7d") {
      daysToSubtract = 14
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    const endDate = new Date(referenceDate)
    endDate.setDate(endDate.getDate() - (timeRange === "90d" ? 90 : timeRange === "30d" ? 30 : 7))
    return date >= startDate && date < endDate
  })

  const previousCalls = previousPeriodData.reduce((sum, item) => sum + item.calls, 0)
  const previousSales = previousPeriodData.reduce((sum, item) => sum + item.sales, 0)
  
  const callsGrowth = previousCalls > 0 ? ((totalCalls - previousCalls) / previousCalls * 100) : 0
  const salesGrowth = previousSales > 0 ? ((totalSales - previousSales) / previousSales * 100) : 0


  return (
    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-600 h-full flex flex-col">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b dark:border-gray-800 py-3 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {isAdmin ? "Llamadas y Ventas" : "Mis Llamadas y Ventas"}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {isAdmin ? "Análisis de rendimiento y conversión" : "Mi análisis de rendimiento y conversión"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Seleccione un rango"
          >
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
      </CardHeader>
      
      {/* Métricas adicionales */}
      <div className="px-6 py-2 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Llamadas</span>
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalCalls}</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              {callsGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span className={callsGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {callsGrowth >= 0 ? "+" : ""}{callsGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</span>
            </div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{totalSales}</div>
            <div className="flex items-center justify-center gap-1 text-xs">
              {salesGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
              )}
              <span className={salesGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {salesGrowth >= 0 ? "+" : ""}{salesGrowth.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasa de Conversión</span>
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Llamadas a ventas</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Período</span>
            </div>
            <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
              {timeRange === "90d" ? "3 meses" : timeRange === "30d" ? "30 días" : "7 días"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Análisis</div>
          </div>
        </div>
      </div>
      <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4 flex-1 flex flex-col">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto flex-1 w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="calls"
              type="natural"
              fill="url(#fillCalls)"
              stroke="var(--color-calls)"
              stackId="a"
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillSales)"
              stroke="var(--color-sales)"
              stackId="a"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}