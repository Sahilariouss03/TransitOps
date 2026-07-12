import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Activity, Gauge, MapPin, Wrench } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { VehicleDocuments } from "@/components/vehicles/vehicle-documents"

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      region: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      odometerHistory: {
        orderBy: { updatedAt: "desc" },
        take: 10
      },
      documents: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" }
      }
    }
  })

  if (!vehicle) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/vehicles" className={buttonVariants({ variant: "outline", size: "icon" })}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{vehicle.registrationNumber}</h2>
            <p className="text-muted-foreground">
              {vehicle.manufacturer} {vehicle.model} • {vehicle.type}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={vehicle.status} className="mr-4 text-base px-4 py-1" />
          <Link href={`/dashboard/vehicles/${vehicle.id}/edit`} className={buttonVariants({ variant: "default" })}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Odometer
            </CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("en-US").format(vehicle.currentOdometer)} km
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Max Load Capacity
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.maxLoadCapacity} kg
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Region
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vehicle.region.name}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList>
          <TabsTrigger value="history">Status History</TabsTrigger>
          <TabsTrigger value="odometer">Odometer Logs</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status History Timeline</CardTitle>
              <CardDescription>Recent changes to the vehicle&apos;s operational status.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {vehicle.statusHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No history available.</p>
                ) : (
                  vehicle.statusHistory.map((history) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="w-px h-full bg-border my-2"></div>
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">
                          Changed to <StatusBadge status={history.newStatus} className="ml-1" />
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(history.createdAt).toLocaleString()}
                        </p>
                        {history.reason && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded-md">{history.reason}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="odometer" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Odometer Updates</CardTitle>
              <CardDescription>Track mileage logged over time.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Similar timeline UI for Odometer */}
              <div className="space-y-4">
                {vehicle.odometerHistory.map(log => (
                  <div key={log.id} className="flex justify-between items-center border-b pb-4 last:border-0">
                    <div>
                      <p className="font-medium">{log.current} km</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(log.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-emerald-600">
                      +{log.current - log.previous} km
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <VehicleDocuments vehicleId={vehicle.id} documents={vehicle.documents} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
