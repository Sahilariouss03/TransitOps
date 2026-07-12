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
import { deleteDriver } from "./actions"

export type Driver = {
  id: string
  name: string
  licenseNumber: string
  category: string
  safetyScore: number
  status: string
}

export const columns: ColumnDef<Driver>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4"
        >
          Driver Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium text-primary">
        <Link href={`/dashboard/drivers/${row.original.id}`}>
          {row.getValue("name")}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: "licenseNumber",
    header: "License Number",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "safetyScore",
    header: () => <div className="text-right">Safety Score</div>,
    cell: ({ row }) => {
      const score = row.getValue("safetyScore") as number
      let scoreColor = "text-green-600"
      if (score < 70) scoreColor = "text-red-600"
      else if (score < 90) scoreColor = "text-yellow-600"
      
      return (
        <div className={`text-right font-medium ${scoreColor}`}>
          {score}/100
        </div>
      )
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
      const driver = row.original

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
              onClick={() => navigator.clipboard.writeText(driver.licenseNumber)}
            >
              Copy license
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/dashboard/drivers/${driver.id}`} className="w-full">View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/dashboard/drivers/${driver.id}/edit`} className="w-full">Edit Driver</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive focus:text-destructive-foreground cursor-pointer"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this driver?")) {
                  const res = await deleteDriver(driver.id)
                  if (res.error) toast.error(res.error)
                  else toast.success("Driver deleted successfully")
                }
              }}
            >
              Delete Driver
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
