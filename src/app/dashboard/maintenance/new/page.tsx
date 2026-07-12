import { getVehiclesForMaintenance } from "@/app/dashboard/maintenance/actions"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Log Maintenance",
}

export default async function NewMaintenanceLogPage() {
  const [vehicles, settings] = await Promise.all([
    getVehiclesForMaintenance(),
    prisma.appSettings.findUnique({
      where: { id: "default" }
    })
  ])

  const currencyCode = settings?.currency || "INR"

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/maintenance" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Log Maintenance</h2>
          <p className="text-muted-foreground">
            Record a new service or repair for a vehicle.
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <MaintenanceForm vehicles={vehicles} currencyCode={currencyCode} />
      </div>
    </div>
  )
}
