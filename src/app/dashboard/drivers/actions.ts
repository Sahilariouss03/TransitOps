"use server"

import prisma from "@/lib/prisma"
import { driverSchema, type DriverFormValues } from "@/lib/validations/driver"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"

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

export async function sendDriverExpiryReminder(driverId: string) {
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email
  if (!userId) {
    return { error: "You must be logged in to trigger email reminders." }
  }

  try {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return { error: "Driver not found." }
    }

    console.log(`[EMAIL SEND SIMULATION] Sending email reminder to driver ${driver.name} at contact: ${driver.contactNumber} regarding license DL-${driver.licenseNumber} expiring on ${driver.licenseExpiry.toLocaleDateString()}`)

    await prisma.$transaction(async (tx) => {
      await tx.notification.create({
        data: {
          title: "License Expiry Reminder Sent",
          description: `Email reminder sent to ${driver.name} for license ${driver.licenseNumber} (Expiry: ${driver.licenseExpiry.toLocaleDateString()})`,
          type: "LICENSE_EXPIRY",
          userId: userId,
        }
      })

      await tx.auditLog.create({
        data: {
          entity: "Driver",
          entityId: driver.id,
          action: "UPDATE",
          performedBy: userEmail || "System",
          oldValue: "No reminder",
          newValue: `Expiry reminder sent for license expiring on ${driver.licenseExpiry.toLocaleDateString()}`
        }
      })
    })

    revalidatePath("/dashboard/drivers")
    revalidatePath("/dashboard")
    return {
      success: true,
      emailBody: `Email Reminder Simulation\n-------------------------\nTo: ${driver.name}\nContact: ${driver.contactNumber}\nLicense Number: ${driver.licenseNumber}\nExpiry Date: ${driver.licenseExpiry.toLocaleDateString()}\n\nDear ${driver.name},\nYour driving license (${driver.licenseNumber}) is expiring on ${driver.licenseExpiry.toLocaleDateString()}. Please submit your renewal document as soon as possible.`,
    }
  } catch (error) {
    console.error("Failed to send driver expiry reminder:", error)
    return { error: "Failed to send expiry reminder. Please try again." }
  }
}
