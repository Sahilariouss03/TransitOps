"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"

import { dispatchTripSchema, type DispatchTripFormValues } from "@/lib/validations/trip"
import { dispatchTrip } from "@/app/dashboard/trips/actions"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Driver, Vehicle } from "@prisma/client"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DispatchFormProps {
  vehicles: Vehicle[]
  drivers: Driver[]
}

export function DispatchForm({ vehicles, drivers }: DispatchFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const form = useForm<DispatchTripFormValues>({
    resolver: zodResolver(dispatchTripSchema),
    defaultValues: {
      source: "",
      destination: "",
      cargoWeight: 0,
      plannedDistance: 0,
      revenue: 0,
      vehicleId: "",
      driverId: "",
      remarks: "",
    },
  })
  
  const selectedVehicleId = form.watch("vehicleId")
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId)
  
  async function onSubmit(data: DispatchTripFormValues) {
    setIsLoading(true)
    setErrorMsg(null)
    
    try {
      const res = await dispatchTrip(data)
      if (res.error) {
        setErrorMsg(res.error)
        toast.error("Failed to dispatch trip")
        return
      }
      
      toast.success("Trip dispatched successfully!")
      router.push("/dashboard/trips")
      router.refresh()
    } catch (_error) {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source Location</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Warehouse A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Client Site B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Vehicle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select available vehicle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.length === 0 ? (
                      <SelectItem value="none" disabled>No vehicles available</SelectItem>
                    ) : (
                      vehicles.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.registrationNumber} - {v.manufacturer} (Max: {v.maxLoadCapacity}T)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="driverId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign Driver</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select available driver" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {drivers.length === 0 ? (
                      <SelectItem value="none" disabled>No drivers available</SelectItem>
                    ) : (
                      drivers.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} (Score: {d.safetyScore})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="cargoWeight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo Weight (Tons)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                {selectedVehicle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Vehicle Max Capacity: {selectedVehicle.maxLoadCapacity}T
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="plannedDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Planned Distance (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="revenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Revenue ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>
        
        <FormField
          control={form.control}
          name="remarks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Remarks / Instructions</FormLabel>
              <FormControl>
                <Textarea placeholder="Special instructions for driver..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/trips")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || vehicles.length === 0 || drivers.length === 0}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Dispatch Trip
          </Button>
        </div>
      </form>
    </Form>
  )
}
