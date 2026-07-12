"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { saveAppSettings } from "@/app/dashboard/settings/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
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
import { settingsSchema, type SettingsFormValues } from "@/lib/validations/settings"

interface SettingsFormProps {
  canEdit: boolean
  defaultValues: SettingsFormValues
}

export function SettingsForm({ canEdit, defaultValues }: SettingsFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  })

  function onSubmit(values: SettingsFormValues) {
    setServerError(null)

    startTransition(async () => {
      const result = await saveAppSettings(values)

      if (result.error) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }

      toast.success("Settings saved successfully.")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>
          Configure the organization profile used across dashboards and reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="depotName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Depot Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit || isPending} />
                    </FormControl>
                    <FormDescription>
                      Shown in operations headers and exported reports.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!canEdit || isPending}
                      items={[
                        { value: "INR", label: "INR (₹)" },
                        { value: "USD", label: "USD ($)" }
                      ]}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      System currency displayed across ledger, fuel and operating costs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="distanceUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!canEdit || isPending}
                      items={[
                        { value: "KILOMETERS", label: "Kilometers" },
                        { value: "MILES", label: "Miles" }
                      ]}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a distance unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KILOMETERS">Kilometers</SelectItem>
                        <SelectItem value="MILES">Miles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weightUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight Unit</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!canEdit || isPending}
                      items={[
                        { value: "KILOGRAMS", label: "Kilograms (kg)" },
                        { value: "TONS", label: "Tons (T)" }
                      ]}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a weight unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="KILOGRAMS">Kilograms (kg)</SelectItem>
                        <SelectItem value="TONS">Tons (T)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {serverError ? <p className="text-sm font-medium text-destructive">{serverError}</p> : null}
            {!canEdit ? (
              <p className="text-sm text-muted-foreground">
                Your role can view settings but only Admins and Fleet Managers can change them.
              </p>
            ) : null}

            <div className="flex justify-end">
              <Button type="submit" disabled={!canEdit || isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
