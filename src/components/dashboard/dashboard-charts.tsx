"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueChart } from "./revenue-chart"
import { StatusChart } from "./status-chart"

interface DashboardChartsProps {
  expensesData: { name: string; value: number }[]
  statusPieData: { name: string; value: number }[]
  utilizationData: { name: string; used: number; total: number }[]
}

export function DashboardCharts({ statusPieData }: DashboardChartsProps) {
  // Extract values for status chart
  const available = statusPieData.find(d => d.name === "Available")?.value || 0
  const onTrip = statusPieData.find(d => d.name === "On Trip")?.value || 0
  const inShop = statusPieData.find(d => d.name === "In Shop")?.value || 0

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Revenue & Expenses Trend</CardTitle>
          <CardDescription>Monthly operational costs and financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization & Status</CardTitle>
          <CardDescription>Current status breakdown of all vehicles</CardDescription>
        </CardHeader>
        <CardContent>
          {statusPieData.length > 0 ? (
            <StatusChart available={available} onTrip={onTrip} inShop={inShop} />
          ) : (
            <div className="flex h-[350px] items-center justify-center text-sm text-muted-foreground">
              No vehicle status data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
