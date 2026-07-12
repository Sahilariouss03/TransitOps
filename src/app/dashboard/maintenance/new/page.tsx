import { getVehiclesForMaintenance } from "@/app/dashboard/maintenance/actions"
import { MaintenanceForm } from "@/components/maintenance/maintenance-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: "Log Maintenance",
}

export default async function NewMaintenanceLogPage() {
  const vehicles = await getVehiclesForMaintenance()

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
        <MaintenanceForm vehicles={vehicles} />
      </div>
    </div>
  )
}
