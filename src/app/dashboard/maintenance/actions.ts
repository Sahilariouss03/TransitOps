"use server"

import prisma from "@/lib/prisma"
import { maintenanceSchema } from "@/lib/validations/maintenance"
import { revalidatePath } from "next/cache"
import { ExpenseCategory, VehicleStatus, MaintenanceType, Priority, MaintenanceStatus } from "@prisma/client"
import { promises as fs } from "fs"
import path from "path"

export async function createMaintenanceLog(formData: FormData) {
  const vehicleId = formData.get("vehicleId") as string
  const issue = formData.get("issue") as string
  const type = formData.get("type") as MaintenanceType
  const priority = formData.get("priority") as Priority
  const date = formData.get("date") as string
  const estimatedCost = Number(formData.get("estimatedCost"))
  const actualCostVal = formData.get("actualCost")
  const actualCost = actualCostVal ? Number(actualCostVal) : undefined
  const status = formData.get("status") as MaintenanceStatus

  const result = maintenanceSchema.safeParse({
    vehicleId,
    issue,
    type,
    priority,
    date,
    estimatedCost,
    actualCost,
    status
  })
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }

  // Handle optional receipt file
  const file = formData.get("file") as File | null
  let receiptUrl: string | null = null

  if (file && file.size > 0) {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const uploadDir = path.join(process.cwd(), "public", "uploads")
      await fs.mkdir(uploadDir, { recursive: true })

      const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`
      const filePath = path.join(uploadDir, uniqueFilename)
      await fs.writeFile(filePath, buffer)
      receiptUrl = `/uploads/${uniqueFilename}`
    } catch (err) {
      console.error("Failed to save receipt file:", err)
      return { error: "Failed to save upload receipt. Please try again." }
    }
  }
  
  try {
    await prisma.$transaction(async (tx) => {
      await tx.maintenanceLog.create({
        data: {
          ...result.data,
          date: new Date(result.data.date),
          receiptUrl,
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
