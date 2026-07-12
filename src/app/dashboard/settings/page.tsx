import { auth } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import prisma from "@/lib/prisma"
import { roleLabels, routeAccessRules } from "@/lib/rbac"
import dynamic from "next/dynamic"

const SettingsForm = dynamic(() => import("@/components/settings/settings-form").then(mod => mod.SettingsForm), {
  ssr: true,
})

export const metadata = {
  title: "Settings - TransitOps",
}

const editableRoles = new Set(["ADMIN", "FLEET_MANAGER"])

export default async function SettingsPage() {
  const [session, initialSettings] = await Promise.all([
    auth(),
    prisma.appSettings.findUnique({
      where: { id: "default" },
    }),
  ])

  let settings = initialSettings
  if (!settings) {
    settings = await prisma.appSettings.create({
      data: {
        id: "default",
        depotName: "Gandhinagar Depot GJ4",
        currency: "INR (Rs)",
        distanceUnit: "KILOMETERS",
        weightUnit: "TONS",
      },
    })
  }

  const role = (session?.user as { role?: string } | undefined)?.role ?? "DRIVER"
  const canEdit = editableRoles.has(role)

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings & RBAC</h2>
        <p className="text-muted-foreground">
          Review organization defaults and confirm the scoped permissions for each TransitOps role.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SettingsForm
          canEdit={canEdit}
          defaultValues={{
            depotName: settings.depotName,
            currency: settings.currency,
            distanceUnit: settings.distanceUnit,
            weightUnit: settings.weightUnit,
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>
              Server-side route protection now follows the same rules shown below.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Allowed Areas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(roleLabels).map(([roleKey, label]) => {
                  const allowedSections = routeAccessRules
                    .filter((rule) => rule.allowedRoles.includes(roleKey as keyof typeof roleLabels))
                    .map((rule) => rule.label)

                  return (
                    <tr key={roleKey} className="border-b align-top last:border-b-0">
                      <td className="py-3 pr-4 font-medium">{label}</td>
                      <td className="py-3 text-muted-foreground">{allowedSections.join(", ")}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
