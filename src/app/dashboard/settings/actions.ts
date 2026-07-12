"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings"

const editableRoles = new Set(["ADMIN", "FLEET_MANAGER"])

export async function saveAppSettings(data: SettingsFormValues) {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!role || !editableRoles.has(role)) {
    return { error: "You do not have permission to update organization settings." }
  }

  const result = settingsSchema.safeParse(data)
  if (!result.success) {
    return { error: "Invalid settings data. Please review the form and try again." }
  }

  try {
    await prisma.appSettings.upsert({
      where: { id: "default" },
      update: result.data,
      create: {
        id: "default",
        ...result.data,
      },
    })

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Failed to save app settings:", error)
    return { error: "Failed to save settings. Please try again later." }
  }
}
