"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowUpDown, CheckCircle, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { completeMaintenance } from "./actions"

export type MaintenanceRow = {
  id: string
  vehicleReg: string
  issue: string
  type: string
  priority: string
  date: Date
  status: string
  estimatedCost: number
}

export const columns: ColumnDef<MaintenanceRow>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Scheduled Date
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
    accessorKey: "vehicleReg",
    header: "Vehicle",
    cell: ({ row }) => <div className="font-semibold">{row.original.vehicleReg}</div>
  },
  {
    accessorKey: "issue",
    header: "Issue / Service",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.issue}>
        {row.original.issue}
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="secondary" className="capitalize">
        {row.original.type.replace("_", " ").toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const p = row.original.priority
      let colorClass = "text-muted-foreground"
      if (p === "HIGH") colorClass = "text-orange-500 font-bold"
      if (p === "CRITICAL") colorClass = "text-red-500 font-bold"
      return <div className={colorClass}>{p}</div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const log = row.original
      const isOpen = log.status !== "COMPLETED"

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            
            {isOpen && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-green-600 focus:bg-green-50 focus:text-green-700 cursor-pointer"
                  onClick={async () => {
                    const costStr = prompt(`Enter actual cost to complete maintenance for ${log.vehicleReg}:`, log.estimatedCost.toString())
                    if (costStr !== null) {
                      const cost = parseFloat(costStr)
                      if (isNaN(cost)) {
                        toast.error("Invalid cost entered.")
                        return
                      }
                      const res = await completeMaintenance(log.id, cost)
                      if (res.error) toast.error(res.error)
                      else toast.success("Maintenance marked as completed!")
                    }
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" /> Mark Completed
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
