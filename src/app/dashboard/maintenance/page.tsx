import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Maintenance Logs",
}

export default async function MaintenancePage() {
  const logs = await prisma.maintenanceLog.findMany({
    where: { deletedAt: null },
    orderBy: { date: "desc" },
    include: {
      vehicle: true,
    }
  })

  const formattedLogs = logs.map(log => ({
    id: log.id,
    vehicleReg: log.vehicle.registrationNumber,
    issue: log.issue,
    type: log.type,
    priority: log.priority,
    date: log.date,
    status: log.status,
    estimatedCost: Number(log.estimatedCost),
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">
            Schedule services, track repairs, and monitor vehicle health.
          </p>
        </div>
        <Link href="/dashboard/maintenance/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Log Maintenance
        </Link>
      </div>
      <div className="mx-auto w-full max-w-full">
        <DataTable columns={columns} data={formattedLogs} searchKey="vehicleReg" />
      </div>
    </div>
  )
}
