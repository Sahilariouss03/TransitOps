import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"

export const metadata = {
  title: "Drivers Management",
}

export default async function DriversPage() {
  const drivers = await prisma.driver.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  })

  const formattedDrivers = drivers.map(d => ({
    id: d.id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    category: d.category,
    safetyScore: d.safetyScore,
    status: d.status,
  }))

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">
            Manage your drivers, monitor safety scores, and track availability.
          </p>
        </div>
        <Link href="/dashboard/drivers/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Link>
      </div>
      <div className="mx-auto w-full max-w-full">
        <DataTable columns={columns} data={formattedDrivers} searchKey="name" />
      </div>
    </div>
  )
}
