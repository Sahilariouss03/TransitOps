"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"

import { completeTripSchema, type CompleteTripFormValues } from "@/lib/validations/trip"
import { completeTrip } from "@/app/dashboard/trips/actions"
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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface CompleteFormProps {
  tripId: string
  vehicleCurrentOdometer: number
  plannedDistance: number
}

export function CompleteForm({ tripId, vehicleCurrentOdometer, plannedDistance }: CompleteFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const form = useForm<CompleteTripFormValues>({
    resolver: zodResolver(completeTripSchema),
    defaultValues: {
      actualDistance: plannedDistance,
      fuelConsumed: 0,
      closingOdometer: vehicleCurrentOdometer + plannedDistance,
      remarks: "",
    },
  })
  
  async function onSubmit(data: CompleteTripFormValues) {
    setIsLoading(true)
    setErrorMsg(null)
    
    try {
      const res = await completeTrip(tripId, data)
      if (res.error) {
        setErrorMsg(res.error)
        toast.error("Failed to complete trip")
        return
      }
      
      toast.success("Trip completed successfully!")
      router.push(`/dashboard/trips/${tripId}`)
      router.refresh()
    } catch (error) {
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
            name="actualDistance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Distance (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="closingOdometer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Closing Odometer (km)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
                </FormControl>
                <p className="text-xs text-muted-foreground mt-1">
                  Must be {'>'}= {vehicleCurrentOdometer}
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fuelConsumed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Consumed (Litres)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} />
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
              <FormLabel>Completion Remarks</FormLabel>
              <FormControl>
                <Textarea placeholder="Any issues during the trip?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Trip
          </Button>
        </div>
      </form>
    </Form>
  )
}
