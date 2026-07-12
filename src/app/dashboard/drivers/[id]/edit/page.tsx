import { DriverForm } from "@/components/drivers/driver-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const metadata = {
  title: "Edit Driver",
}

export default async function EditDriverPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const driver = await prisma.driver.findUnique({
    where: { id }
  })

  if (!driver) {
    notFound()
  }

  const initialData = {
    id: driver.id,
    name: driver.name,
    licenseNumber: driver.licenseNumber,
    category: driver.category,
    licenseExpiry: driver.licenseExpiry.toISOString().split("T")[0],
    contactNumber: driver.contactNumber,
    status: driver.status,
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/drivers/${id}`} className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Driver</h2>
          <p className="text-muted-foreground">
            Update information for {driver.name}.
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <DriverForm initialData={initialData} />
      </div>
    </div>
  )
}
