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
import { deleteVehicle } from "./actions"

export type Vehicle = {
  id: string
  registrationNumber: string
  manufacturer: string
  model: string
  type: string
  status: string
  currentOdometer: number
}

export const columns: ColumnDef<Vehicle>[] = [
  {
    accessorKey: "registrationNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Registration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-primary">
        <Link href={`/dashboard/vehicles/${row.original.id}`}>
          {row.getValue("registrationNumber")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "manufacturer",
    header: "Make & Model",
    cell: ({ row }) => (
      <div>
        {row.original.manufacturer} <span className="text-muted-foreground">{row.original.model}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {(row.getValue("type") as string).toLowerCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "currentOdometer",
    header: () => <div className="text-right">Odometer</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("currentOdometer"))
      const formatted = new Intl.NumberFormat("en-US").format(amount)
      return <div className="text-right font-medium">{formatted} km</div>
    },
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
      const vehicle = row.original

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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(vehicle.registrationNumber)}
            >
              Copy registration
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/vehicles/${vehicle.id}`} className="w-full">View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className="w-full">Edit Vehicle</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this vehicle?")) {
                  const res = await deleteVehicle(vehicle.id)
                  if (res.error) toast.error(res.error)
                  else toast.success("Vehicle deleted successfully")
                }
              }}
            >
              Delete Vehicle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
