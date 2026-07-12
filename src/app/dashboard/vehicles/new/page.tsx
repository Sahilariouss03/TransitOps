import { getRegions } from "@/app/dashboard/vehicles/actions"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Add New Vehicle",
}

export default async function NewVehiclePage() {
  const [regions, settings] = await Promise.all([
    getRegions(),
    prisma.appSettings.findUnique({
      where: { id: "default" }
    })
  ])

  const weightUnit = settings?.weightUnit || "TONS"
  const currencyCode = settings?.currency || "INR"

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vehicles" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Register New Vehicle</h2>
          <p className="text-muted-foreground">
            Add a new vehicle to your fleet inventory.
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <VehicleForm 
          regions={regions} 
          weightUnit={weightUnit} 
          currencyCode={currencyCode} 
        />
      </div>
    </div>
  )
}
