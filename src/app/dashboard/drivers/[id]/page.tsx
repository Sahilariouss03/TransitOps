import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { StatusBadge } from "@/components/ui/status-badge"
import { ArrowLeft, Edit, AlertTriangle, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function DriverDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      trips: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          vehicle: true
        }
      }
    }
  })

  if (!driver) {
    notFound()
  }

  const isExpired = driver.licenseExpiry < new Date()
  let scoreColor = "text-green-600"
  if (driver.safetyScore < 70) scoreColor = "text-red-600"
  else if (driver.safetyScore < 90) scoreColor = "text-yellow-600"

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/drivers" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{driver.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={driver.status} />
              <Badge variant="outline">{driver.category}</Badge>
            </div>
          </div>
        </div>
        <Link href={`/dashboard/drivers/${id}/edit`} className={buttonVariants({ variant: "default" })}>
          <Edit className="mr-2 h-4 w-4" /> Edit Driver
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {driver.safetyScore}/100
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">License Expiry</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isExpired ? "text-destructive" : ""}`}>
              {driver.licenseExpiry.toLocaleDateString()}
            </div>
            {isExpired && (
              <p className="text-xs text-destructive mt-1">License has expired!</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Number</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {driver.contactNumber}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Latest 5 trips handled by this driver</CardDescription>
          </CardHeader>
          <CardContent>
            {driver.trips.length > 0 ? (
              <div className="space-y-4">
                {driver.trips.map(trip => (
                  <div key={trip.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{trip.source} → {trip.destination}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {trip.vehicle.registrationNumber} • {new Date(trip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No trips found for this driver.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
