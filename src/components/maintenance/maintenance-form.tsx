"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, UploadCloud } from "lucide-react"

import { maintenanceSchema, type MaintenanceFormValues } from "@/lib/validations/maintenance"
import { createMaintenanceLog } from "@/app/dashboard/maintenance/actions"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MaintenanceFormProps {
  vehicles: { id: string; registrationNumber: string; manufacturer: string; model: string }[]
}

export function MaintenanceForm({ vehicles }: MaintenanceFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: "",
      issue: "",
      type: "SERVICE",
      priority: "MEDIUM",
      date: new Date().toISOString().split("T")[0],
      estimatedCost: 0,
      actualCost: 0,
      status: "OPEN",
    },
  })
  
  async function onSubmit(data: MaintenanceFormValues) {
    setIsLoading(true)
    
    try {
      const res = await createMaintenanceLog(data)
      if (res.error) {
        toast.error(res.error)
        return
      }
      
      toast.success("Maintenance log created successfully")
      router.push("/dashboard/maintenance")
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="vehicleId"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Vehicle</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle for maintenance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.manufacturer} {v.model}
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
            name="issue"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Issue Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Describe the issue or service required..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SERVICE">Regular Service</SelectItem>
                    <SelectItem value="OIL_CHANGE">Oil Change</SelectItem>
                    <SelectItem value="TIRE">Tire Replacement</SelectItem>
                    <SelectItem value="ENGINE">Engine Repair</SelectItem>
                    <SelectItem value="ACCIDENT">Accident Repair</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="CRITICAL">Critical (AOG)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="OPEN">Open (Scheduled)</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Shop (In Progress)</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="estimatedCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Cost ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="actualCost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Actual Cost ($) - Optional</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-2 border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
            <UploadCloud className="h-10 w-10 mb-2 text-muted-foreground/60" />
            <p className="text-sm font-medium">Upload Receipt / Document (Mock)</p>
            <p className="text-xs text-center mt-1 max-w-sm">
              UploadThing integration requires API keys. For this hackathon scope, file attachments are stubbed.
            </p>
            <Button type="button" variant="outline" className="mt-4" disabled>
              Select File
            </Button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/maintenance")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Log Maintenance
          </Button>
        </div>
      </form>
    </Form>
  )
}
