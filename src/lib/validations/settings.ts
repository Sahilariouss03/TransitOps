import { z } from "zod"

export const settingsSchema = z.object({
  depotName: z.string().trim().min(3, "Depot name must be at least 3 characters."),
  currency: z.string().trim().min(2, "Currency is required."),
  distanceUnit: z.enum(["KILOMETERS", "MILES"]),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
