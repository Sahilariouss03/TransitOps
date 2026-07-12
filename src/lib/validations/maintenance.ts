import { z } from "zod"

export const maintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  issue: z.string().min(3, "Issue description must be at least 3 characters"),
  type: z.enum(["SERVICE", "OIL_CHANGE", "TIRE", "ENGINE", "ACCIDENT", "OTHER"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  date: z.string().min(1, "Date is required"),
  estimatedCost: z.coerce.number().min(0, "Estimated cost cannot be negative"),
  actualCost: z.coerce.number().min(0).optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "COMPLETED"]),
})

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>
