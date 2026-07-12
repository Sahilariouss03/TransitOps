import { z } from "zod"

export const dispatchTripSchema = z.object({
  source: z.string().min(2, "Source is required"),
  destination: z.string().min(2, "Destination is required"),
  cargoWeight: z.coerce.number().min(0.1, "Cargo weight must be greater than 0"),
  plannedDistance: z.coerce.number().min(1, "Planned distance must be greater than 0"),
  revenue: z.coerce.number().min(0, "Revenue cannot be negative"),
  vehicleId: z.string().min(1, "Vehicle is required"),
  driverId: z.string().min(1, "Driver is required"),
  remarks: z.string().optional(),
})

export type DispatchTripFormValues = z.infer<typeof dispatchTripSchema>

export const completeTripSchema = z.object({
  actualDistance: z.coerce.number().min(1, "Actual distance is required"),
  fuelConsumed: z.coerce.number().min(0, "Fuel consumed cannot be negative"),
  closingOdometer: z.coerce.number().min(0, "Closing odometer must be provided"),
  remarks: z.string().optional(),
})

export type CompleteTripFormValues = z.infer<typeof completeTripSchema>
