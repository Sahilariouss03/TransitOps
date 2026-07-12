"use server"

import prisma from "@/lib/prisma"
import { maintenanceSchema, type MaintenanceFormValues } from "@/lib/validations/maintenance"
import { revalidatePath } from "next/cache"
import { ExpenseCategory, VehicleStatus } from "@prisma/client"

export async function createMaintenanceLog(data: MaintenanceFormValues) {
  const result = maintenanceSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      const _log = await tx.maintenanceLog.create({
        data: {
          ...result.data,
          date: new Date(result.data.date),
        }
      })
      
      // If status is OPEN or IN_PROGRESS, set vehicle status to IN_SHOP
      if (result.data.status !== "COMPLETED") {
        await tx.vehicle.update({
          where: { id: result.data.vehicleId },
          data: { status: VehicleStatus.IN_SHOP }
        })
        
        await tx.vehicleStatusHistory.create({
          data: {
            vehicleId: result.data.vehicleId,
            oldStatus: VehicleStatus.AVAILABLE, // Assuming it was available
            newStatus: VehicleStatus.IN_SHOP,
            reason: `Maintenance: ${result.data.issue}`,
            changedBy: "System"
          }
        })
      }
      
      // Record Expense if there is an actual cost
      if (result.data.actualCost && result.data.actualCost > 0) {
        await tx.expense.create({
          data: {
            category: ExpenseCategory.MAINTENANCE,
            amount: result.data.actualCost,
            date: new Date(result.data.date),
          }
        })
      }
    })
    
    revalidatePath("/dashboard/maintenance")
    revalidatePath("/dashboard/vehicles")
    return { success: true }
  } catch (error) {
    console.error("Failed to log maintenance:", error)
    return { error: "Failed to log maintenance. Please try again later." }
  }
}

export async function completeMaintenance(id: string, actualCost: number) {
  try {
    const log = await prisma.maintenanceLog.findUnique({ where: { id } })
    if (!log) return { error: "Log not found" }
    
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceLog.update({
        where: { id },
        data: {
          status: "COMPLETED",
          actualCost,
        }
      })
      
      if (actualCost > 0) {
        await tx.expense.create({
          data: {
            category: ExpenseCategory.MAINTENANCE,
            amount: actualCost,
            date: new Date(),
          }
        })
      }
      
      // Set vehicle back to available
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { status: VehicleStatus.AVAILABLE }
      })
      
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: log.vehicleId,
          oldStatus: VehicleStatus.IN_SHOP,
          newStatus: VehicleStatus.AVAILABLE,
          reason: `Maintenance Completed: ${log.issue}`,
          changedBy: "System"
        }
      })
    })
    
    revalidatePath("/dashboard/maintenance")
    revalidatePath("/dashboard/vehicles")
    return { success: true }
  } catch (error) {
    console.error("Failed to complete maintenance:", error)
    return { error: "Failed to complete maintenance." }
  }
}

export async function getVehiclesForMaintenance() {
  return await prisma.vehicle.findMany({
    where: { deletedAt: null },
    orderBy: { registrationNumber: 'asc' },
    select: { id: true, registrationNumber: true, manufacturer: true, model: true }
  })
}
