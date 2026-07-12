import prisma from "@/lib/prisma"
import { columns } from "./columns"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      region: true,
    }
  })

  // Format data for table
  const formattedVehicles = vehicles.map(v => ({
    id: v.id,
    registrationNumber: v.registrationNumber,
    manufacturer: v.manufacturer,
    model: v.model,
    type: v.type,
    status: v.status,
    currentOdometer: v.currentOdometer,
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vehicles</h2>
          <p className="text-muted-foreground">
            Manage your fleet, track status, and view vehicle histories.
          </p>
        </div>
        <Link href="/dashboard/vehicles/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Link>
      </div>
      <div className="mx-auto w-full max-w-full">
        <DataTable columns={columns} data={formattedVehicles} searchKey="registrationNumber" />
      </div>
    </div>
  )
}
