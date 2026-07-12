import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Fuel Logs",
}

export default async function FuelPage() {
  const fuelLogs = await prisma.fuelLog.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      vehicle: true,
    }
  })

  const formattedLogs = fuelLogs.map(log => ({
    id: log.id,
    vehicleReg: log.vehicle.registrationNumber,
    fuelType: log.fuelType,
    litres: log.litres,
    cost: Number(log.cost),
    date: log.date,
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fuel Logs</h2>
          <p className="text-muted-foreground">
            Track fuel consumption, costs, and refueling history across the fleet.
          </p>
        </div>
        <Link href="/dashboard/fuel/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Log Fuel
        </Link>
      </div>
      <div className="mx-auto w-full max-w-full">
        <DataTable columns={columns} data={formattedLogs} searchKey="vehicleReg" />
      </div>
    </div>
  )
}
