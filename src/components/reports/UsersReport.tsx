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
  ChartTooltip,
} from "@/components/ui/chart"
import { IProspect } from "@/interfaces/prospect.interface"

const chartConfig = {} satisfies ChartConfig

export function UsersReport({ prospects }: { prospects: IProspect[] }) {

  const groupedResponses = prospects.reduce((acc, prospect) => {
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

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Prospectos</CardTitle>
        <CardDescription>2025</CardDescription>
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
                    <div className="rounded-md bg-white p-2 shadow text-sm text-black">
                      <div><strong>{data.name}</strong></div>
                      <div>{data.value} {data.value > 1 ? "prospectos" : "prospecto"}</div>
                      <div>{percent}%</div>
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
      <CardFooter className="flex-col gap-2 text-sm">
        {/* <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="leading-none text-muted-foreground">
          Total de prospectos
        </div>
      </CardFooter>
    </Card>
  )
}
