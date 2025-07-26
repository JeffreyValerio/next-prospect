"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IProspect } from "@/interfaces/prospect.interface"
import { useMemo, useState } from "react"

interface Props {
  prospects: IProspect[]
}

export function ProspectsByUser({ prospects }: Props) {
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

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (!p.assignedTo) return false
      const date = new Date(p.date)
      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonthIndex
      )
    })
  }, [prospects, selectedMonth])

  const groupedUsers = filteredProspects.reduce((acc, prospect) => {
    const user = prospect.assignedTo.trim()
    if (!acc[user]) {
      acc[user] = { prospects: 0, sales: 0 }
    }
    acc[user].prospects += 1
    if (prospect.customerResponse === "Venta realizada") {
      acc[user].sales += 1
    }
    return acc
  }, {} as Record<string, { prospects: number; sales: number }>)

  const tableData = Object.entries(groupedUsers).map(([user, data]) => {
    const { prospects, sales } = data
    const effectiveness = prospects > 0 ? ((sales / prospects) * 100).toFixed(1) : "0.0"
    return { user, prospects, sales, effectiveness }
  })

  const totalProspects = tableData.reduce((sum, d) => sum + d.prospects, 0)
  const totalSales = tableData.reduce((sum, d) => sum + d.sales, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Prospectos por vendedor</CardTitle>
            <CardDescription>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="mt-1 border rounded px-2 py-1 text-sm capitalize"
              >
                {monthsAvailable.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border rounded-md">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Vendedor</th>
                <th className="px-4 py-2 text-right">Prospectos</th>
                <th className="px-4 py-2 text-right">Ventas</th>
                <th className="px-4 py-2 text-right">Efectividad</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map(({ user, prospects, sales, effectiveness }) => {
                const salesClass = sales >= 6
                  ? "bg-green-600 font-semibold"
                  : "bg-red-600 font-semibold"

                return (
                  <tr key={user} className="border-t">
                    <td className="px-4 py-2 capitalize">{user}</td>
                    <td className="px-4 py-2 text-right">{prospects}</td>
                    <td className={`px-4 py-2 text-right ${salesClass}`}>
                      {sales}
                    </td>
                    <td className="px-4 py-2 text-right">{effectiveness}%</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        Total: {totalProspects} prospectos, {totalSales} ventas
      </CardFooter>
    </Card>
  )
}
