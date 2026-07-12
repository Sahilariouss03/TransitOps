import { getAvailableResources } from "@/app/dashboard/trips/actions"
import { DispatchForm } from "@/components/trips/dispatch-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import prisma from "@/lib/prisma"

export const metadata = {
  title: "Dispatch Trip",
}

export default async function DispatchTripPage() {
  const [{ vehicles, drivers }, settings] = await Promise.all([
    getAvailableResources(),
    prisma.appSettings.findUnique({
      where: { id: "default" }
    })
  ])

  const weightUnit = settings?.weightUnit || "TONS"

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/trips" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dispatch New Trip</h2>
          <p className="text-muted-foreground">
            Assign an available vehicle and driver to a new route.
          </p>
        </div>
      </div>
      
      <div className="max-w-4xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <DispatchForm 
          vehicles={vehicles} 
          drivers={drivers} 
          weightUnit={weightUnit} 
        />
      </div>
    </div>
  )
}
