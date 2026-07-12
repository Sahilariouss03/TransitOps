import { z } from "zod"

export const expenseSchema = z.object({
  category: z.enum(["FUEL", "TOLL", "REPAIR", "MAINTENANCE", "OTHER"]),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  tripId: z.string().optional(),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>
