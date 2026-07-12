import { getRegions } from "@/app/dashboard/vehicles/actions"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"


export const metadata = {
  title: "Edit Vehicle",
}

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const [vehicle, regions, settings] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id }
    }),
    getRegions(),
    prisma.appSettings.findUnique({
      where: { id: "default" }
    })
  ])

  if (!vehicle) {
    notFound()
  }

  const weightUnit = settings?.weightUnit || "TONS"
  const currencyCode = settings?.currency || "INR"

  // We map the Prisma model to our form values
  const initialData = {
    id: vehicle.id,
    registrationNumber: vehicle.registrationNumber,
    manufacturer: vehicle.manufacturer,
    model: vehicle.model,
    variant: vehicle.variant || "",
    type: vehicle.type,
    maxLoadCapacity: Number(vehicle.maxLoadCapacity),
    currentOdometer: Number(vehicle.currentOdometer),
    acquisitionCost: vehicle.acquisitionCost !== null ? Number(vehicle.acquisitionCost) : null,
    status: vehicle.status,
    regionId: vehicle.regionId,
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/vehicles/${id}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Vehicle</h2>
          <p className="text-muted-foreground">
            Update information for vehicle {vehicle.registrationNumber}.
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <VehicleForm 
          regions={regions} 
          initialData={initialData} 
          weightUnit={weightUnit} 
          currencyCode={currencyCode} 
        />
      </div>
    </div>
  )
}
