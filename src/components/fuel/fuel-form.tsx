"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { z } from "zod"

import { fuelLogSchema, type FuelLogFormValues } from "@/lib/validations/fuel"
import { createFuelLog, getTripsForVehicle } from "@/app/dashboard/fuel/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FuelFormProps {
  vehicles: { id: string; registrationNumber: string; type: string }[]
  currencyCode: string
}

export function FuelForm({ vehicles, currencyCode }: FuelFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<z.input<typeof fuelLogSchema>, unknown, FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: "",
      litres: 0,
      cost: 0,
      fuelType: "DIESEL",
      date: new Date().toISOString().split("T")[0],
      tripId: "",
    },
  })
  
  const selectedVehicleId = form.watch("vehicleId")
  const [vehicleTrips, setVehicleTrips] = useState<{ id: string; source: string; destination: string; createdAt: Date }[]>([])
  
  useEffect(() => {
    if (selectedVehicleId) {
      getTripsForVehicle(selectedVehicleId).then((trips) => {
        setVehicleTrips(trips)
      }).catch(err => {
        console.error("Failed to load trips", err)
      })
    } else {
      setVehicleTrips([])
    }
  }, [selectedVehicleId])
  
  async function onSubmit(data: FuelLogFormValues) {
    setIsLoading(true)
    
    // Handle 'none' value from select dropdown
    const submitData = {
      ...data,
      tripId: data.tripId === "none" ? undefined : data.tripId
    }
    
    try {
      const res = await createFuelLog(submitData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      
      toast.success("Fuel log created successfully")
      router.push("/dashboard/fuel")
      router.refresh()
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="PETROL">Petrol</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="CNG">CNG</SelectItem>
                    <SelectItem value="EV">EV Charge</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="litres"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volume (Litres/kWh)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.1"
                    name={field.name}
                    ref={field.ref}
                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Cost ({currencyCode === "INR" ? "₹" : "$"})</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    name={field.name}
                    ref={field.ref}
                    value={field.value !== undefined && field.value !== null ? String(field.value) : ""}
                    onBlur={field.onBlur}
                    onChange={(event) => field.onChange(event.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tripId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip (Optional)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedVehicleId || vehicleTrips.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={!selectedVehicleId ? "Select a vehicle first" : vehicleTrips.length === 0 ? "No trips found for this vehicle" : "Select an associated trip"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none" className="text-muted-foreground italic">None (General Fueling)</SelectItem>
                    {vehicleTrips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {trip.source} → {trip.destination} ({new Date(trip.createdAt).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/fuel")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Fuel
          </Button>
        </div>
      </form>
    </Form>
  )
}
