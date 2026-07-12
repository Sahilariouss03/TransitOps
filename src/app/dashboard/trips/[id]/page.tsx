import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, CheckCircle2, Clock, MapPin, Navigation, Truck, User } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompleteForm } from "@/components/trips/complete-form"

export default async function TripDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params
  
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      history: {
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!trip) {
    notFound()
  }

  const isDispatched = trip.status === "DISPATCHED"

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/trips" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Trip Details</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={trip.status} />
              <span className="text-muted-foreground text-sm font-mono">{trip.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-border">
              <div className="relative">
                <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 ring-4 ring-background">
                  <MapPin className="h-3 w-3 text-primary" />
                </span>
                <h3 className="font-semibold">Source</h3>
                <p className="text-muted-foreground">{trip.source}</p>
                {trip.tripStart && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Dispatched: {trip.tripStart.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="relative">
                <span className="absolute -left-8 flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 ring-4 ring-background">
                  <Navigation className="h-3 w-3 text-primary" />
                </span>
                <h3 className="font-semibold">Destination</h3>
                <p className="text-muted-foreground">{trip.destination}</p>
                {trip.tripEnd && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed: {trip.tripEnd.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cargo Weight</p>
                <p className="text-lg font-bold">{trip.cargoWeight} Tons</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Planned Dist.</p>
                <p className="text-lg font-bold">{trip.plannedDistance} km</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actual Dist.</p>
                <p className="text-lg font-bold">{trip.actualDistance || "-"} km</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Revenue</p>
                <p className="text-lg font-bold">${trip.revenue.toString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <Truck className="h-4 w-4" /> Assigned Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/vehicles/${trip.vehicle.id}`} className="hover:underline font-semibold text-lg text-primary">
                {trip.vehicle.registrationNumber}
              </Link>
              <p className="text-sm text-muted-foreground">{trip.vehicle.manufacturer} {trip.vehicle.model}</p>
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Current Odo: </span>
                {trip.vehicle.currentOdometer} km
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center gap-2">
                <User className="h-4 w-4" /> Assigned Driver
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/dashboard/drivers/${trip.driver.id}`} className="hover:underline font-semibold text-lg text-primary">
                {trip.driver.name}
              </Link>
              <p className="text-sm text-muted-foreground">License: {trip.driver.licenseNumber}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {isDispatched && (
          <Card className="border-primary/50 shadow-sm">
            <CardHeader>
              <CardTitle>Complete Trip</CardTitle>
              <CardDescription>Enter actual trip details to complete and release resources.</CardDescription>
            </CardHeader>
            <CardContent>
              <CompleteForm 
                tripId={trip.id} 
                vehicleCurrentOdometer={trip.vehicle.currentOdometer} 
                plannedDistance={trip.plannedDistance} 
              />
            </CardContent>
          </Card>
        )}
        
        <Card className={!isDispatched ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>Trip History Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trip.history.map((log) => (
                <div key={log.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                  <div className="mt-1">
                    <StatusBadge status={log.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{log.remarks || `Status updated to ${log.status}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.createdAt).toLocaleString()} by {log.updatedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
