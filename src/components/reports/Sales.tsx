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
import { IProspect } from "@/interfaces/prospect.interface"

const chartConfig = {} satisfies ChartConfig

export function Sales({ prospects }: { prospects: IProspect[] }) {

  const filteredProspects = prospects.filter((prospect) => prospect.customerResponse === "Venta realizada");

  const groupedResponses = filteredProspects.reduce((acc, prospect) => {
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

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ventas</CardTitle>
        <CardDescription>2025</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
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
                          {filteredProspects.length > 1 ? "Ventas" : "Venta"}
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
        <div className="leading-none text-muted-foreground">
          Total de ventas realizadas
        </div>
      </CardFooter>
    </Card>
  );
}
