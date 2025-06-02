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
  ChartContainer,
} from "@/components/ui/chart"
import { IProspect } from "@/interfaces/prospect.interface"
import { TrendingUp } from "lucide-react"

// const chartConfig = {} satisfies ChartConfig

export function Sales({ prospects }: { prospects: IProspect[] }) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString("es-ES", { month: "long" });

  // 🔴 Filtrar solo las ventas del mes y año actual
  const filteredProspects = prospects.filter((prospect) => {
    if (prospect.customerResponse !== "Venta realizada") return false;

    const date = new Date(prospect.date);
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    );
  });

  const groupedResponses = filteredProspects.reduce((acc, prospect) => {
    const response = prospect.customerResponse;
    acc[response] = (acc[response] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(groupedResponses).map(([response, count]) => ({
    name: response,
    value: count,
    fill: `hsl(var(--chart-2))`,
  }));

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ventas</CardTitle>
        <CardDescription className="capitalize">{currentMonthName} {currentYear}</CardDescription>
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
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground flex gap-1">
          Tasa de conversión{" "}
          <strong>
            {((filteredProspects.length / prospects.length) * 100).toFixed(2)}%
          </strong>{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  );
}
