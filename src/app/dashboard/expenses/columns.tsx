"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown } from "lucide-react"

export type ExpenseRow = {
  id: string
  category: string
  amount: number
  date: Date
  tripId: string | null
}

export const columns: ColumnDef<ExpenseRow>[] = [
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
      <div className="font-medium text-muted-foreground">
        {new Date(row.original.date).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.category}
      </Badge>
    ),
  },
  {
    accessorKey: "tripId",
    header: "Trip Reference",
    cell: ({ row }) => (
      <div className="text-sm font-mono text-muted-foreground">
        {row.original.tripId ? row.original.tripId.split("-")[0] : "-"}
      </div>
    )
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)
      return <div className="text-right font-bold text-destructive">{formatted}</div>
    },
  },
]
