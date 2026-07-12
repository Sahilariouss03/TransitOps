"use server"

import prisma from "@/lib/prisma"
import { dispatchTripSchema, type DispatchTripFormValues, completeTripSchema, type CompleteTripFormValues } from "@/lib/validations/trip"
import { revalidatePath } from "next/cache"
import { VehicleStatus, DriverStatus, TripStatus } from "@prisma/client"

function getLicenseValidityCutoff() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

export async function dispatchTrip(data: DispatchTripFormValues) {
  const result = dispatchTripSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const { vehicleId, driverId, cargoWeight } = result.data
    const licenseValidityCutoff = getLicenseValidityCutoff()
    
    // Validate Vehicle
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, deletedAt: null },
    })
    if (!vehicle) return { error: "Vehicle not found." }
    if (vehicle.status !== VehicleStatus.AVAILABLE) return { error: "Vehicle is not available." }
    if (cargoWeight > vehicle.maxLoadCapacity) {
      return { error: `Cargo weight (${cargoWeight}T) exceeds vehicle capacity (${vehicle.maxLoadCapacity}T).` }
    }
    
    // Validate Driver
    const driver = await prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
    })
    if (!driver) return { error: "Driver not found." }
    if (driver.status !== DriverStatus.AVAILABLE) return { error: "Driver is not available." }
    if (driver.licenseExpiry < licenseValidityCutoff) {
      return { error: "Driver license has expired and cannot be assigned to trips." }
    }
    
    // Execute Dispatch in Transaction
    const trip = await prisma.$transaction(async (tx) => {
      // 1. Create Trip
      const newTrip = await tx.trip.create({
        data: {
          source: result.data.source,
          destination: result.data.destination,
          cargoWeight: result.data.cargoWeight,
          plannedDistance: result.data.plannedDistance,
          revenue: result.data.revenue,
          vehicleId: result.data.vehicleId,
          driverId: result.data.driverId,
          remarks: result.data.remarks,
          status: TripStatus.DISPATCHED,
          tripStart: new Date(),
          createdBy: "System", // Ideally from Auth session
        }
      })
      
      // 2. Update Vehicle Status
      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { status: VehicleStatus.ON_TRIP }
      })
      
      // 3. Update Driver Status
      await tx.driver.update({
        where: { id: driverId },
        data: { status: DriverStatus.ON_TRIP }
      })
      
      // 4. Create Trip History
      await tx.tripHistory.create({
        data: {
          tripId: newTrip.id,
          status: TripStatus.DISPATCHED,
          remarks: "Trip dispatched",
          updatedBy: "System",
        }
      })
      
      // 5. Create Vehicle Status History
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: vehicle.id,
          oldStatus: VehicleStatus.AVAILABLE,
          newStatus: VehicleStatus.ON_TRIP,
          reason: `Dispatched for trip ${newTrip.id}`,
          changedBy: "System"
        }
      })
      
      return newTrip
    })
    
    revalidatePath("/dashboard/trips")
    revalidatePath("/dashboard/vehicles")
    revalidatePath("/dashboard/drivers")
    return { success: true, tripId: trip.id }
  } catch (error) {
    console.error("Failed to dispatch trip:", error)
    return { error: "Failed to dispatch trip. Please try again later." }
  }
}

export async function completeTrip(tripId: string, data: CompleteTripFormValues) {
  const result = completeTripSchema.safeParse(data)
  
  if (!result.success) {
    return { error: "Invalid form data. Please check your inputs." }
  }
  
  try {
    const trip = await prisma.trip.findUnique({ 
      where: { id: tripId },
      include: { vehicle: true }
    })
    
    if (!trip) return { error: "Trip not found." }
    if (trip.status !== TripStatus.DISPATCHED) return { error: "Trip is not in DISPATCHED status." }
    
    const vehicle = trip.vehicle
    
    // Odometer Rollback Check
    if (result.data.closingOdometer < vehicle.currentOdometer) {
      return { 
        error: `Closing odometer (${result.data.closingOdometer} km) cannot be less than current odometer (${vehicle.currentOdometer} km).` 
      }
    }
    
    await prisma.$transaction(async (tx) => {
      // 1. Update Trip
      await tx.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.COMPLETED,
          tripEnd: new Date(),
          actualDistance: result.data.actualDistance,
          fuelConsumed: result.data.fuelConsumed,
          remarks: result.data.remarks ? `${trip.remarks || ''}\n[Completion]: ${result.data.remarks}` : trip.remarks,
        }
      })
      
      // 2. Update Vehicle Status and Odometer
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { 
          status: VehicleStatus.AVAILABLE,
          currentOdometer: result.data.closingOdometer,
        }
      })
      
      // 3. Update Driver Status
      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: DriverStatus.AVAILABLE }
      })
      
      // 4. Log Trip History
      await tx.tripHistory.create({
        data: {
          tripId: trip.id,
          status: TripStatus.COMPLETED,
          remarks: "Trip completed successfully",
          updatedBy: "System",
        }
      })
      
      // 5. Log Vehicle Status History
      await tx.vehicleStatusHistory.create({
        data: {
          vehicleId: vehicle.id,
          oldStatus: VehicleStatus.ON_TRIP,
          newStatus: VehicleStatus.AVAILABLE,
          reason: `Completed trip ${trip.id}`,
          changedBy: "System"
        }
      })
      
      // 6. Log Odometer History
      if (result.data.closingOdometer > vehicle.currentOdometer) {
        await tx.vehicleOdometer.create({
          data: {
            vehicleId: vehicle.id,
            previous: vehicle.currentOdometer,
            current: result.data.closingOdometer,
            tripId: trip.id,
          }
        })
      }
    })
    
    revalidatePath("/dashboard/trips")
    revalidatePath(`/dashboard/trips/${tripId}`)
    revalidatePath("/dashboard/vehicles")
    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error) {
    console.error("Failed to complete trip:", error)
    return { error: "Failed to complete trip. Please try again later." }
  }
}

export async function cancelTrip(tripId: string) {
  try {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } })
    if (!trip) return { error: "Trip not found." }
    if (trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED) {
      return { error: "Trip cannot be cancelled from its current state." }
    }
    
    await prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id: tripId },
        data: { status: TripStatus.CANCELLED }
      })
      
      if (trip.status === TripStatus.DISPATCHED) {
        await tx.vehicle.update({
          where: { id: trip.vehicleId },
          data: { status: VehicleStatus.AVAILABLE }
        })
        
        await tx.driver.update({
          where: { id: trip.driverId },
          data: { status: DriverStatus.AVAILABLE }
        })
        
        await tx.vehicleStatusHistory.create({
          data: {
            vehicleId: trip.vehicleId,
            oldStatus: VehicleStatus.ON_TRIP,
            newStatus: VehicleStatus.AVAILABLE,
            reason: `Trip ${trip.id} cancelled`,
            changedBy: "System"
          }
        })
      }
      
      await tx.tripHistory.create({
        data: {
          tripId: trip.id,
          status: TripStatus.CANCELLED,
          remarks: "Trip cancelled",
          updatedBy: "System",
        }
      })
    })
    
    revalidatePath("/dashboard/trips")
    revalidatePath(`/dashboard/trips/${tripId}`)
    revalidatePath("/dashboard/vehicles")
    revalidatePath("/dashboard/drivers")
    return { success: true }
  } catch (error) {
    console.error("Failed to cancel trip:", error)
    return { error: "Failed to cancel trip." }
  }
}

export async function getAvailableResources() {
  const licenseValidityCutoff = getLicenseValidityCutoff()

  const [vehicles, drivers] = await Promise.all([
    prisma.vehicle.findMany({ 
      where: { status: VehicleStatus.AVAILABLE, deletedAt: null },
      orderBy: { registrationNumber: 'asc' }
    }),
    prisma.driver.findMany({ 
      where: {
        status: DriverStatus.AVAILABLE,
        deletedAt: null,
        licenseExpiry: {
          gte: licenseValidityCutoff,
        },
      },
      orderBy: { name: 'asc' }
    })
  ])
  
  return { vehicles, drivers }
}
