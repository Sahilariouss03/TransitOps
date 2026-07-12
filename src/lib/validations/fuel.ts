import { z } from "zod"

export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  litres: z.coerce.number().min(0.1, "Litres must be greater than 0"),
  cost: z.coerce.number().min(0, "Cost cannot be negative"),
  fuelType: z.enum(["PETROL", "DIESEL", "CNG", "EV", "HYBRID"]),
  date: z.string().min(1, "Date is required"),
  tripId: z.string().optional(),
})

export type FuelLogFormValues = z.infer<typeof fuelLogSchema>
