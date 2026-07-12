import { z } from "zod"

export const driverSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  licenseNumber: z.string().min(4, "License number is required").max(50),
  category: z.string().min(1, "License category is required"),
  licenseExpiry: z.string().min(1, "License expiry date is required"),
  contactNumber: z.string().min(5, "Contact number is required").max(20),
  status: z.enum(["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"]).default("AVAILABLE"),
})

export type DriverFormValues = z.infer<typeof driverSchema>
