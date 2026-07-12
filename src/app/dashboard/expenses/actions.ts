"use server"

import prisma from "@/lib/prisma"
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense"
import { revalidatePath } from "next/cache"

export async function createExpense(data: ExpenseFormValues) {
  const result = expenseSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    await prisma.expense.create({
      data: {
        category: result.data.category,
        amount: result.data.amount,
        date: new Date(result.data.date),
        tripId: result.data.tripId || null,
      }
    })
    
    revalidatePath("/dashboard/expenses")
    return { success: true }
  } catch (error) {
    console.error("Failed to create expense:", error)
    return { error: "Failed to log expense. Please try again later." }
  }
}
