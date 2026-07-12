"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export type FuelLogRow = {
  id: string
  vehicleReg: string
  fuelType: string
  litres: number
  cost: number
  date: Date
}

export const getColumns = (currencyCode: string): ColumnDef<FuelLogRow>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {new Date(row.original.date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "vehicleReg",
    header: "Vehicle",
  },
  {
    accessorKey: "fuelType",
    header: "Fuel Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.fuelType.toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "litres",
    header: () => <div className="text-right">Volume</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.original.litres} L
      </div>
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"))
      const isINR = currencyCode.includes("INR")
      const formatted = new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
        style: "currency",
        currency: isINR ? "INR" : "USD",
      }).format(amount)
      return <div className="text-right font-bold text-destructive">{formatted}</div>
    },
  },
]
