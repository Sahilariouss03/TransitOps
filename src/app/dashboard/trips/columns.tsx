"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/ui/status-badge"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { toast } from "sonner"
import { cancelTrip } from "./actions"

export type TripRow = {
  id: string
  source: string
  destination: string
  vehicleReg: string
  driverName: string
  status: string
  createdAt: Date
}

export const columns: ColumnDef<TripRow>[] = [
  {
    accessorKey: "id",
    header: "Trip ID",
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground w-16 truncate" title={row.original.id}>
        {row.original.id.split("-")[0]}
      </div>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => (
      <div className="font-medium text-primary">
        <Link href={`/dashboard/trips/${row.original.id}`}>
          {row.original.source} → {row.original.destination}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "vehicleReg",
    header: "Vehicle",
  },
  {
    accessorKey: "driverName",
    header: "Driver",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Dispatched On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-muted-foreground text-sm">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return <StatusBadge status={status} />
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const trip = row.original
      const isDispatched = trip.status === "DISPATCHED"

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
            <DropdownMenuItem>
              <Link href={`/dashboard/trips/${trip.id}`} className="w-full">View Details</Link>
            </DropdownMenuItem>
            
            {isDispatched && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
                  onClick={async () => {
                    if (confirm("Are you sure you want to cancel this trip? This will release the vehicle and driver.")) {
                      const res = await cancelTrip(trip.id)
                      if (res.error) toast.error(res.error)
                      else toast.success("Trip cancelled successfully")
                    }
                  }}
                >
                  Cancel Trip
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
