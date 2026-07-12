"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, FileText, Search, TrendingUp, TrendingDown } from "lucide-react"

interface VehicleMetric {
  id: string
  registrationNumber: string
  manufacturer: string
  model: string
  totalDistance: number
  totalFuelFromTrips: number
  fuelEfficiency: number
  totalFuelCost: number
  totalMaintenanceCost: number
  operationalCost: number
  totalRevenue: number
  roi: number
}

interface AnalyticsTableProps {
  data: VehicleMetric[]
  currencyCode: string
}

export function AnalyticsTable({ data, currencyCode }: AnalyticsTableProps) {
  const [search, setSearch] = useState("")

  const filteredData = data.filter(
    (item) =>
      item.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(search.toLowerCase()) ||
      item.model.toLowerCase().includes(search.toLowerCase())
  )

  const handleExportCSV = () => {
    const headers = [
      "Registration Number",
      "Manufacturer",
      "Model",
      "Total Distance (km)",
      "Total Fuel (L)",
      "Fuel Efficiency (km/L)",
      `Fuel Cost (${currencyCode})`,
      `Maintenance Cost (${currencyCode})`,
      `Operational Cost (${currencyCode})`,
      `Total Revenue (${currencyCode})`,
      "ROI (%)",
    ]

    const rows = filteredData.map((v) => [
      v.registrationNumber,
      v.manufacturer,
      v.model,
      v.totalDistance,
      v.totalFuelFromTrips,
      v.fuelEfficiency.toFixed(2),
      v.totalFuelCost.toFixed(2),
      v.totalMaintenanceCost.toFixed(2),
      v.operationalCost.toFixed(2),
      v.totalRevenue.toFixed(2),
      v.roi.toFixed(2),
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `transitops_fleet_report_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = () => {
    // Open a new tab for printing
    const printWindow = window.open("/dashboard/analytics/print", "_blank")
    if (!printWindow) {
      alert("Please allow popups to export PDF reports.")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vehicle registration or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="flex-1 md:flex-none">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={handleExportPDF} className="flex-1 md:flex-none">
            <FileText className="h-4 w-4 mr-2" /> Export PDF (Print)
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Fuel Consumed</TableHead>
                <TableHead>Efficiency</TableHead>
                <TableHead>Operating Cost</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead className="text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    No matching vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row) => {
                  const roiPositive = row.roi >= 0
                  const isINR = currencyCode.includes("INR")
                  const formatCurrency = (val: number) => {
                    return new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
                      style: "currency",
                      currency: isINR ? "INR" : "USD",
                    }).format(val)
                  }

                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-semibold">{row.registrationNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.manufacturer} {row.model}
                        </div>
                      </TableCell>
                      <TableCell>{row.totalDistance.toLocaleString()} km</TableCell>
                      <TableCell>{row.totalFuelFromTrips.toLocaleString()} L</TableCell>
                      <TableCell>
                        {row.fuelEfficiency > 0
                          ? `${row.fuelEfficiency.toFixed(2)} km/L`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatCurrency(row.operationalCost)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Fuel: {formatCurrency(row.totalFuelCost)} | Maint: {formatCurrency(row.totalMaintenanceCost)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatCurrency(row.totalRevenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-sm ${
                            roiPositive ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {roiPositive ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {row.roi.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
