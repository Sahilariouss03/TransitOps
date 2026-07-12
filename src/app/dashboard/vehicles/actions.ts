"use server"

import prisma from "@/lib/prisma"
import { vehicleSchema, type VehicleFormValues } from "@/lib/validations/vehicle"
import { revalidatePath } from "next/cache"
import { promises as fs } from "fs"
import path from "path"
import { DocumentType } from "@prisma/client"

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
          maxLoadCapacity: Number(result.data.maxLoadCapacity),
          currentOdometer: Number(result.data.currentOdometer),
          acquisitionCost: result.data.acquisitionCost !== undefined && result.data.acquisitionCost !== null ? result.data.acquisitionCost : null,
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
          acquisitionCost: result.data.acquisitionCost !== undefined && result.data.acquisitionCost !== null ? result.data.acquisitionCost : null,
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

export async function uploadVehicleDocument(vehicleId: string, formData: FormData) {
  try {
    const file = formData.get("file") as File | null
    if (!file) return { error: "No file selected." }

    const documentType = formData.get("documentType") as DocumentType
    if (!documentType) return { error: "Document type is required." }

    const expiryDateStr = formData.get("expiryDate") as string | null
    const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`
    const filePath = path.join(uploadDir, uniqueFilename)
    await fs.writeFile(filePath, buffer)

    const fileUrl = `/uploads/${uniqueFilename}`

    await prisma.vehicleDocument.create({
      data: {
        vehicleId,
        fileName: file.name,
        fileUrl,
        documentType,
        expiryDate,
      }
    })

    revalidatePath(`/dashboard/vehicles/${vehicleId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to upload vehicle document:", error)
    return { error: "Failed to upload document. Please try again." }
  }
}

export async function deleteVehicleDocument(vehicleId: string, documentId: string) {
  try {
    await prisma.vehicleDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() }
    })

    revalidatePath(`/dashboard/vehicles/${vehicleId}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to delete document:", error)
    return { error: "Failed to delete document." }
  }
}
