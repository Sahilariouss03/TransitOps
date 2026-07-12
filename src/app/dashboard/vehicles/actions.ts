"use server"

import prisma from "@/lib/prisma"
import { vehicleSchema, type VehicleFormValues } from "@/lib/validations/vehicle"
import { revalidatePath } from "next/cache"

export async function createVehicle(data: VehicleFormValues) {
  const result = vehicleSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    // Check for duplicate registration
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNumber: result.data.registrationNumber }
    })
    
    if (existing) {
      return { error: "A vehicle with this registration number already exists." }
    }
    
    await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: {
          ...result.data,
          // Convert maxLoadCapacity from string/number to Float, same for odometer
          maxLoadCapacity: Number(result.data.maxLoadCapacity),
          currentOdometer: Number(result.data.currentOdometer),
        }
      })
      
      // Create initial status history
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: vehicle.id,
          oldStatus: vehicle.status,
          newStatus: vehicle.status,
          reason: "Initial registration",
          changedBy: "System" // We could pull this from auth session if needed
        }
      })
      
      // Create initial odometer reading
      await tx.vehicleOdometer.create({
        data: {
          vehicleId: vehicle.id,
          previous: 0,
          current: vehicle.currentOdometer,
        }
      })
    })
    
    revalidatePath("/dashboard/vehicles")
    return { success: true }
  } catch (error) {
    console.error("Failed to create vehicle:", error)
    return { error: "Failed to create vehicle. Please try again later." }
  }
}

export async function updateVehicle(id: string, data: VehicleFormValues) {
  const result = vehicleSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const existing = await prisma.vehicle.findUnique({ where: { id } })
    if (!existing) return { error: "Vehicle not found" }
    
    // Check duplicate registration for other vehicles
    if (existing.registrationNumber !== result.data.registrationNumber) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { registrationNumber: result.data.registrationNumber }
      })
      
      if (duplicate) {
        return { error: "Another vehicle with this registration number already exists." }
      }
    }
    
    await prisma.$transaction(async (tx) => {
      // If status changed, log it
      if (existing.status !== result.data.status) {
        await tx.vehicleStatusHistory.create({
          data: {
            vehicleId: id,
            oldStatus: existing.status,
            newStatus: result.data.status,
            reason: "Manual status update via edit",
            changedBy: "System"
          }
        })
      }
      
      // If odometer changed, log it
      if (existing.currentOdometer !== Number(result.data.currentOdometer)) {
        await tx.vehicleOdometer.create({
          data: {
            vehicleId: id,
            previous: existing.currentOdometer,
            current: Number(result.data.currentOdometer),
          }
        })
      }
      
      await tx.vehicle.update({
        where: { id },
        data: {
          ...result.data,
          maxLoadCapacity: Number(result.data.maxLoadCapacity),
          currentOdometer: Number(result.data.currentOdometer),
        }
      })
    })
    
    revalidatePath("/dashboard/vehicles")
    revalidatePath(`/dashboard/vehicles/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update vehicle:", error)
    return { error: "Failed to update vehicle. Please try again later." }
  }
}

export async function deleteVehicle(id: string) {
  try {
    // Soft delete
    await prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    
    revalidatePath("/dashboard/vehicles")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete vehicle:", error)
    return { error: "Failed to delete vehicle. Please try again later." }
  }
}

export async function getRegions() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' }
    })
    return regions
  } catch (error) {
    console.error("Failed to fetch regions:", error)
    return []
  }
}
