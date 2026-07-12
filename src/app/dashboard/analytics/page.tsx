import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { DollarSign, Map, Fuel, Wrench } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"

export const metadata = {
  title: "Analytics - TransitOps",
}

export default async function AnalyticsPage() {
  const [
    expenses,
    vehicles,
    tripsCount,
    fuelLogsCount,
    maintenanceLogsCount,
    totalRevenueResult,
    totalExpensesResult
  ] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
      orderBy: { date: "asc" }
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null }
    }),
    prisma.trip.count(),
    prisma.fuelLog.count(),
    prisma.maintenanceLog.count(),
    prisma.trip.aggregate({
      _sum: { revenue: true },
      where: { status: "COMPLETED" }
    }),
    prisma.expense.aggregate({
      _sum: { amount: true }
    })
  ])
  
  // Format data for charts
  const expensesData = expenses.map(e => ({ name: e.date.toLocaleDateString(), value: Number(e.amount) }))
  
  const statusPieData = [
    { name: 'Available', value: vehicles.filter(v => v.status === "AVAILABLE").length },
    { name: 'On Trip', value: vehicles.filter(v => v.status === "ON_TRIP").length },
    { name: 'In Shop', value: vehicles.filter(v => v.status === "IN_SHOP").length },
  ].filter(d => d.value > 0)
  
  const utilizationData = [
    { name: 'Utilization', used: vehicles.filter(v => v.status !== "AVAILABLE").length, total: vehicles.length }
  ]

  const totalRevenue = Number(totalRevenueResult._sum.revenue || 0)
  const totalExpense = Number(totalExpensesResult._sum.amount || 0)
  const netProfit = totalRevenue - totalExpense

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Detailed metrics and performance indicators for your fleet operations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tripsCount}</div>
            <p className="text-xs text-muted-foreground">Lifetime</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Logs</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fuelLogsCount}</div>
            <p className="text-xs text-muted-foreground">Lifetime records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Events</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maintenanceLogsCount}</div>
            <p className="text-xs text-muted-foreground">Lifetime records</p>
          </CardContent>
        </Card>
      </div>
      
      <DashboardCharts 
        expensesData={expensesData} 
        statusPieData={statusPieData}
        utilizationData={utilizationData}
      />
      
      {/* We could add more charts here easily, but reusing DashboardCharts is a fast MVP for the missing page */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Overview of all time revenue vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Gross Revenue</span>
              <span className="font-bold">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Total Operating Expenses</span>
              <span className="font-bold">${totalExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Net Profit</span>
              <span className={`font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
