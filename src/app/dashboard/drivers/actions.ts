"use server"

import prisma from "@/lib/prisma"
import { driverSchema, type DriverFormValues } from "@/lib/validations/driver"
import { revalidatePath } from "next/cache"

export async function createDriver(data: DriverFormValues) {
  const result = driverSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber: result.data.licenseNumber }
    })
    
    if (existing) {
      return { error: "A driver with this license number already exists." }
    }
    
    await prisma.driver.create({
      data: {
        ...result.data,
        licenseExpiry: new Date(result.data.licenseExpiry),
        safetyScore: 100, // Default starting score
      }
    })
    
    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error) {
    console.error("Failed to create driver:", error)
    return { error: "Failed to create driver. Please try again later." }
  }
}

export async function updateDriver(id: string, data: DriverFormValues) {
  const result = driverSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const existing = await prisma.driver.findUnique({ where: { id } })
    if (!existing) return { error: "Driver not found" }
    
    if (existing.licenseNumber !== result.data.licenseNumber) {
      const duplicate = await prisma.driver.findUnique({
        where: { licenseNumber: result.data.licenseNumber }
      })
      
      if (duplicate) {
        return { error: "Another driver with this license number already exists." }
      }
    }
    
    await prisma.driver.update({
      where: { id },
      data: {
        ...result.data,
        licenseExpiry: new Date(result.data.licenseExpiry),
      }
    })
    
    revalidatePath("/dashboard/drivers")
    revalidatePath(`/dashboard/drivers/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Failed to update driver:", error)
    return { error: "Failed to update driver. Please try again later." }
  }
}

export async function deleteDriver(id: string) {
  try {
    await prisma.driver.update({
      where: { id },
      data: { deletedAt: new Date() }
    })
    
    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete driver:", error)
    return { error: "Failed to delete driver. Please try again later." }
  }
}
