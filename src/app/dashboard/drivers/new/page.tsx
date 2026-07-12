import { DriverForm } from "@/components/drivers/driver-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: "Register New Driver",
}

export default async function NewDriverPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/drivers" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Register New Driver</h2>
          <p className="text-muted-foreground">
            Onboard a new driver to your fleet.
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <DriverForm />
      </div>
    </div>
  )
}
