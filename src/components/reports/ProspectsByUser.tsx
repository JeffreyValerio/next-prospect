"use client"

import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from "recharts"
import { 
  Users, 
  TrendingUp, 
  Award,
  Target
} from "lucide-react"

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
  ChartTooltip
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDashboardContext } from "@/components/dashboard/DashboardWithFilters"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

export function ProspectsByUser() {
  const { filteredProspects, isAdmin } = useDashboardContext()
  const prospects = filteredProspects
  const [timeRange, setTimeRange] = React.useState("currentMonth")

  // Filtrar prospectos por rango de tiempo
  const timeFilteredProspects = React.useMemo(() => {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeRange) {
      case "currentMonth":
        startDate.setMonth(now.getMonth(), 1) // Primer día del mes actual
        break
      case "last30Days":
        startDate.setDate(now.getDate() - 30)
        break
      case "last7Days":
        startDate.setDate(now.getDate() - 7)
        break
      case "all":
        return prospects
    }
    
    return prospects.filter(prospect => {
      const prospectDate = new Date(prospect.date)
      return prospectDate >= startDate
    })
  }, [prospects, timeRange])

  // Agrupar prospectos por usuario con métricas adicionales
  const groupedUsers = (timeFilteredProspects || []).reduce((acc, prospect) => {
    if (!prospect.assignedTo) return acc
    const user = prospect.assignedTo
    
    if (!acc[user]) {
      acc[user] = {
        total: 0,
        sales: 0,
        interested: 0,
        notInterested: 0,
        callback: 0,
        noAnswer: 0
      }
    }
    
    acc[user].total += 1
    
    switch (prospect.customerResponse) {
      case "Venta realizada":
        acc[user].sales += 1
        break
      case "Está interesado":
        acc[user].interested += 1
        break
      case "No está interesado":
        acc[user].notInterested += 1
        break
      case "Llamar después":
        acc[user].callback += 1
        break
      case "Sin tipificar":
        acc[user].noAnswer += 1
        break
    }
    
    return acc
  }, {} as Record<string, {
    total: number
    sales: number
    interested: number
    notInterested: number
    callback: number
    noAnswer: number
  }>)

  const chartData = Object.entries(groupedUsers).map(([user, data]) => ({
    user: user.split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' '),
    value: data.total,
    sales: data.sales,
    interested: data.interested,
    conversionRate: data.total > 0 ? (data.sales / data.total * 100) : 0,
    fill: `hsl(var(--chart-3))`,
  })).sort((a, b) => b.value - a.value) // Ordenar por cantidad descendente

  const total = chartData.reduce((sum, d) => sum + d.value, 0)
  const totalSales = chartData.reduce((sum, d) => sum + d.sales, 0)
  const avgConversionRate = chartData.length > 0 ? 
    chartData.reduce((sum, d) => sum + (d.conversionRate || 0), 0) / chartData.length : 0
  
  // Encontrar el mejor vendedor
  const topPerformer = chartData.reduce((top, current) => 
    current.sales > top.sales ? current : top, chartData[0] || { user: "N/A", sales: 0 })

  return (
    <Card className="border-l-4 border-l-purple-500 dark:border-l-purple-600">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b dark:border-gray-800 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            Prospectos por Vendedor
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            Distribución y rendimiento del equipo de ventas
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Seleccione un rango"
          >
            <SelectValue placeholder="Mes actual" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="currentMonth" className="rounded-lg">
              Mes actual
            </SelectItem>
            <SelectItem value="last30Days" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="last7Days" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
            <SelectItem value="all" className="rounded-lg">
              Todo el tiempo
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      
      {/* Métricas adicionales */}
      <div className="px-6 py-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vendedores</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{chartData.length}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Activos</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prospectos</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Asignados</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ventas</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalSales}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Realizadas</div>
          </div>
          
          {isAdmin ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Award className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mejor Vendedor</span>
              </div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
                {topPerformer.user.split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{topPerformer.sales} ventas</div>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mi Rendimiento</span>
              </div>
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
                {chartData.length > 0 ? chartData[0].user : "Sin datos"}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Mis prospectos</div>
            </div>
          )}
        </div>
      </div>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full flex justify-center">
          <BarChart
            data={chartData}
            layout="vertical"
            width={400}
            height={320}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="value" 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis 
              dataKey="user" 
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              interval={0}
              width={160}
              tickMargin={12}
            />
             <ChartTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percent = ((data.value / total) * 100).toFixed(1);
            
                              return (
                                <div className="rounded-md bg-white dark:bg-gray-900 p-3 shadow-lg text-sm text-black dark:text-white border dark:border-gray-700">
                                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                                    {data.user.split(' ').map((name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()).join(' ')}
                                  </div>
                                  <div className="text-gray-600 dark:text-gray-400 mt-1">
                                    <div>Total: {data.value} prospectos</div>
                                    <div>Ventas: {data.sales}</div>
                                    <div>Interesados: {data.interested}</div>
                                    <div>Conversión: {(data.conversionRate || 0).toFixed(1)}%</div>
                                  </div>
                                  <div className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                                    {percent}% del total
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
            {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            /> */}
            <Bar
              dataKey="value"
              fill="var(--color-desktop)"
              radius={[0, 4, 4, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="value"
                position="right"
                className="fill-foreground"
                fontSize={11}
                fontWeight="bold"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{(avgConversionRate || 0).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Conversión Promedio</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{(chartData.length > 0 ? total / chartData.length : 0).toFixed(1)}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Promedio por Vendedor</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">{(topPerformer.conversionRate || 0).toFixed(1)}%</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Mejor Conversión</div>
          </div>
        </div>
        <div className="leading-none text-muted-foreground dark:text-gray-400 text-center w-full">
          Distribución de prospectos y rendimiento del equipo de ventas
        </div>
      </CardFooter>
    </Card>
  )
}
