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
  const [selectedSeller, setSelectedSeller] = useState<string>("")

  const [selectedYear, selectedMonthIndex] = selectedMonth.split("-").map(Number)

  // Vendedores únicos
  const sellersAvailable = useMemo(() => {
    const set = new Set<string>()
    prospects.forEach((p) => {
      if (p.assignedTo) {
        set.add(p.assignedTo.trim())
      }
    })
    return Array.from(set).sort()
  }, [prospects])

  // Filtrar por mes y año
  const monthlyProspects = useMemo(() => {
    return prospects.filter((p) => {
      if (!p.assignedTo) return false
      const date = new Date(p.date)
      return (
        date.getFullYear() === selectedYear &&
        date.getMonth() === selectedMonthIndex
      )
    })
  }, [prospects, selectedYear, selectedMonthIndex])

  // Filtrar por vendedor
  const filteredProspects = useMemo(() => {
    return monthlyProspects.filter((p) => {
      if (!selectedSeller) return true
      return p.assignedTo.trim() === selectedSeller
    })
  }, [monthlyProspects, selectedSeller])

  // Agrupación por vendedor
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
  const totalEffectiveness = totalProspects > 0
    ? ((totalSales / totalProspects) * 100).toFixed(1)
    : "0.0"

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Prospectos por vendedor</CardTitle>
        <CardDescription className="capitalize">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-2 py-1 text-sm capitalize"
            >
              {monthsAvailable.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>

            <select
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="border rounded px-2 py-1 text-sm capitalize"
            >
              <option value="">Todos los vendedores</option>
              {sellersAvailable.map((seller) => (
                <option key={seller} value={seller}>
                  {seller}
                </option>
              ))}
            </select>
          </div>
        </CardDescription>
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

      <CardFooter className="text-sm text-muted-foreground flex flex-wrap gap-4">
        <span>Total: {totalProspects} prospectos</span>
        <span>{totalSales} ventas</span>
        <span>Efectividad general: {totalEffectiveness}%</span>
      </CardFooter>
    </Card>
  )
}
