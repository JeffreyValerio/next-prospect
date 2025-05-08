"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis
} from "recharts"

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

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig

export function ProspectsByUser({ prospects }: { prospects: IProspect[] }) {
  const groupedUsers = prospects.reduce((acc, prospect) => {
    if (!prospect.assignedTo) return acc
    const user = prospect.assignedTo
    acc[user] = (acc[user] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(groupedUsers).map(([user, count]) => ({
    user,
    value: count,
    fill: `hsl(var(--chart-3))`,
  }))
  const total = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prospectos por vendedor</CardTitle>
        <CardDescription>2025</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ right: 16 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="user"
              type="category"
              axisLine={false}
              tickLine={false}
              hide
            />
            <XAxis dataKey="value" type="number" hide />
             <ChartTooltip
                          cursor={false}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percent = ((data.value / total) * 100).toFixed(1);
            
                              return (
                                <div className="rounded-md bg-white p-2 shadow text-sm text-black">
                                  <div><strong>{data.name}</strong></div>
                                  <div>{data.value} prospectos</div>
                                  <div>{percent}%</div>
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
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
              <LabelList
                dataKey="user"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {/* <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div> */}
        <div className="leading-none text-muted-foreground">
          Total de prospectos asignados por vendedor
        </div>
      </CardFooter>
    </Card>
  )
}
