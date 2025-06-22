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

export function ProspectsByUser({ prospects }: { prospects: IProspect[] }) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const currentMonthName = now.toLocaleString("es-ES", { month: "long" })

  // Filtrar prospectos del mes actual con usuario asignado
  const monthlyProspects = prospects.filter((prospect) => {
    if (!prospect.assignedTo) return false
    const date = new Date(prospect.date)
    return (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    )
  })

  // Agrupar por vendedor y contar prospectos y ventas
  const groupedUsers = monthlyProspects.reduce((acc, prospect) => {
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
        <CardTitle>Prospectos por vendedor</CardTitle>
        <CardDescription className="capitalize">
          {currentMonthName} {currentYear}
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
                    <td className="px-4 py-2">{user}</td>
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
