import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Trips Management",
}

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      vehicle: true,
      driver: true,
    }
  })

  const formattedTrips = trips.map(t => ({
    id: t.id,
    source: t.source,
    destination: t.destination,
    vehicleReg: t.vehicle.registrationNumber,
    driverName: t.driver.name,
    status: t.status,
    createdAt: t.createdAt,
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trips</h2>
          <p className="text-muted-foreground">
            Manage trip dispatches, track active routes, and view histories.
          </p>
        </div>
        <Link href="/dashboard/trips/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Dispatch Trip
        </Link>
      </div>
      <div className="mx-auto w-full max-w-full">
        {/* We can search by source or destination, but let's pass a generic search on source for now */}
        <DataTable columns={columns} data={formattedTrips} searchKey="route" />
      </div>
    </div>
  )
}
