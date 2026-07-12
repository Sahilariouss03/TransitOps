import { z } from "zod"

export const vehicleSchema = z.object({
  registrationNumber: z.string().min(2, "Registration number must be at least 2 characters").max(50),
  manufacturer: z.string().min(2, "Manufacturer must be at least 2 characters").max(50),
  model: z.string().min(1, "Model is required").max(50),
  variant: z.string().max(50).optional(),
  type: z.enum(["TRUCK", "VAN", "PICKUP", "CAR", "BIKE"]),
  maxLoadCapacity: z.coerce.number().min(0, "Capacity cannot be negative"),
  currentOdometer: z.coerce.number().min(0, "Odometer cannot be negative"),
  acquisitionCost: z.coerce.number().min(0, "Cost cannot be negative"),
  status: z.enum(["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"]).default("AVAILABLE"),
  regionId: z.string().min(1, "Region is required"),
})

export type VehicleFormValues = z.infer<typeof vehicleSchema>
