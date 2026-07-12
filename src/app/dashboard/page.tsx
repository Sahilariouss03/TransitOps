import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { Clock, Navigation, CheckCircle2, AlertTriangle, Truck } from "lucide-react"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"

export const metadata = {
  title: "Dashboard - TransitOps",
}

export default async function DashboardPage() {
  const [vehiclesCount, driversCount, activeTripsCount, recentActivities] = await Promise.all([
    prisma.vehicle.count({ where: { deletedAt: null } }),
    prisma.driver.count({ where: { deletedAt: null } }),
    prisma.trip.count({ where: { status: "DISPATCHED" } }),
    // Fetch mixed history for the timeline
    prisma.tripHistory.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { trip: { include: { vehicle: true } } }
    })
  ])

  // Get data for charts
  const [expenses, fuelLogs, vehicles] = await Promise.all([
    prisma.expense.findMany({
      where: { date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
      orderBy: { date: "asc" }
    }),
    prisma.fuelLog.findMany({
      where: { date: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } },
      orderBy: { date: "asc" }
    }),
    prisma.vehicle.findMany({
      where: { deletedAt: null }
    })
  ])
  
  // Format data for Recharts (simplified for demonstration)
  const expensesData = expenses.map(e => ({ name: e.date.toLocaleDateString(), value: Number(e.amount) }))
  
  const statusPieData = [
    { name: 'Available', value: vehicles.filter(v => v.status === "AVAILABLE").length },
    { name: 'On Trip', value: vehicles.filter(v => v.status === "ON_TRIP").length },
    { name: 'In Shop', value: vehicles.filter(v => v.status === "IN_SHOP").length },
  ].filter(d => d.value > 0)
  
  const utilizationData = [
    { name: 'Utilization', used: vehicles.filter(v => v.status !== "AVAILABLE").length, total: vehicles.length }
  ]

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Welcome back. Here is what's happening across your fleet today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiclesCount}</div>
            <p className="text-xs text-muted-foreground">Active in fleet</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Navigation className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTripsCount}</div>
            <p className="text-xs text-muted-foreground">Currently dispatched</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{driversCount}</div>
            <p className="text-xs text-muted-foreground">Ready for dispatch</p>
          </CardContent>
        </Card>
      </div>
      
      <DashboardCharts 
        expensesData={expensesData} 
        statusPieData={statusPieData}
        utilizationData={utilizationData}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest events and audit logs from across the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  No recent activity found. Start dispatching trips to see logs here.
                </div>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                    <div className="mt-1">
                      <StatusBadge status={activity.status} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {activity.remarks} <span className="text-muted-foreground font-normal">(Trip {activity.trip.id.split('-')[0]})</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(activity.createdAt).toLocaleString()} by {activity.updatedBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
