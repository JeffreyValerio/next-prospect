"use client"

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

const SALES_GOAL = 6

export function Objective({ prospects }: { prospects: IProspect[] }) {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentMonthName = now.toLocaleString("es-ES", { month: "long" });
    const currentYear = now.getFullYear()
    
    const salesCount = prospects.filter((prospect) => {
        const date = new Date(prospect.date)
        const isSale = prospect.customerResponse === "Venta realizada"
        const isSameMonth = date.getMonth() === currentMonth && date.getFullYear() === currentYear
        return isSale && isSameMonth
    }).length
    

    const chartData = [
        {
            name: "Meta",
            visitors: SALES_GOAL,
            fill: "hsl(var(--muted))", // fondo
        },
        {
            name: "Ventas",
            visitors: salesCount,
            fill: "hsl(var(--chart-3))", // progreso
        },
    ]

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Objetivo de Ventas</CardTitle>
                <CardDescription className="capitalize">{currentMonthName} {currentYear}</CardDescription>
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
                    Objetivo de 6 ventas para mes actual
                </div>
            </CardFooter>
        </Card>
    )
}
