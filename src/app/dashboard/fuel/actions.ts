"use server"

import prisma from "@/lib/prisma"
import { fuelLogSchema, type FuelLogFormValues } from "@/lib/validations/fuel"
import { revalidatePath } from "next/cache"
import { ExpenseCategory } from "@prisma/client"

export async function createFuelLog(data: FuelLogFormValues) {
  const result = fuelLogSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const { vehicleId: _vehicleId, tripId } = result.data
    
    await prisma.$transaction(async (tx) => {
      const _fuelLog = await tx.fuelLog.create({
        data: {
          ...result.data,
          date: new Date(result.data.date),
          tripId: tripId || null,
        }
      })
      
      // Also record this as a general Expense if it's fuel
      await tx.expense.create({
        data: {
          category: ExpenseCategory.FUEL,
          amount: result.data.cost,
          date: new Date(result.data.date),
          tripId: tripId || null,
        }
      })
    })
    
    revalidatePath("/dashboard/fuel")
    revalidatePath("/dashboard/expenses")
    return { success: true }
  } catch (error) {
    console.error("Failed to create fuel log:", error)
    return { error: "Failed to log fuel. Please try again later." }
  }
}

export async function getVehiclesForFuel() {
  return await prisma.vehicle.findMany({
    where: { deletedAt: null },
    orderBy: { registrationNumber: 'asc' },
    select: { id: true, registrationNumber: true, type: true }
  })
}

export async function getTripsForVehicle(vehicleId: string) {
  if (!vehicleId) return []
  
  return await prisma.trip.findMany({
    where: { 
      vehicleId,
      deletedAt: null,
      // Allow logging fuel for active or recently completed trips
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: { id: true, source: true, destination: true, status: true, createdAt: true }
  })
}
