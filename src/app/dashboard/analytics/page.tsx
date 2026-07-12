import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { DollarSign, Map, Fuel, Wrench } from "lucide-react"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { AnalyticsTable } from "@/components/analytics/analytics-table"

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
    totalExpensesResult,
    settings
  ] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
      orderBy: { date: "asc" }
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        trips: { where: { deletedAt: null } },
        fuelLogs: { where: { deletedAt: null } },
        maintenanceLogs: { where: { deletedAt: null } }
      }
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
    }),
    prisma.appSettings.findUnique({
      where: { id: "default" }
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

  const currencyCode = settings?.currency || "INR"
  const isINR = currencyCode.includes("INR")

  const totalRevenue = Number(totalRevenueResult._sum.revenue || 0)
  const totalAcquisitionCost = vehicles.reduce((sum, v) => sum + Number(v.acquisitionCost || 0), 0)
  const totalExpense = Number(totalExpensesResult._sum.amount || 0) + totalAcquisitionCost
  const netProfit = totalRevenue - totalExpense

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
      style: "currency",
      currency: isINR ? "INR" : "USD",
    }).format(val)
  }
  // Calculate per-vehicle metrics
  const vehicleMetrics = vehicles.map(vehicle => {
    const completedTrips = vehicle.trips.filter(t => t.status === "COMPLETED")
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.actualDistance || t.plannedDistance || 0), 0)
    const totalFuelFromTrips = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0)
    
    const fuelEfficiency = totalFuelFromTrips > 0 ? (totalDistance / totalFuelFromTrips) : 0
    const totalFuelCost = vehicle.fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0)
    const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, m) => sum + Number(m.actualCost || m.estimatedCost || 0), 0)
    const operationalCost = totalFuelCost + totalMaintenanceCost
    const vehicleRevenue = completedTrips.reduce((sum, t) => sum + Number(t.revenue), 0)
    const acquisitionCost = Number(vehicle.acquisitionCost)
    const roi = acquisitionCost > 0 ? ((vehicleRevenue - operationalCost) / acquisitionCost) * 100 : 0
    
    return {
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      totalDistance,
      totalFuelFromTrips,
      fuelEfficiency,
      totalFuelCost,
      totalMaintenanceCost,
      operationalCost,
      totalRevenue: vehicleRevenue,
      roi
    }
  })

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
              {formatCurrency(netProfit)}
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
      
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold tracking-tight">Fleet Vehicle Performance</h3>
        <p className="text-sm text-muted-foreground">
          Detailed metrics for each vehicle including efficiency, operational cost, and ROI.
        </p>
      </div>

      <AnalyticsTable data={vehicleMetrics} currencyCode={currencyCode} />
      
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>Overview of all time revenue vs expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Gross Revenue</span>
              <span className="font-bold">{formatCurrency(totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Total Operating Expenses</span>
              <span className="font-bold">{formatCurrency(totalExpense)}</span>
            </div>
            <div className="h-px w-full bg-border" />
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Net Profit</span>
              <span className={`font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
