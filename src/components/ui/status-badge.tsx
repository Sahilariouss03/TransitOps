"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        // Vehicle / Driver
        AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100/80",
        ON_TRIP: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/80",
        IN_SHOP: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100/80",
        RETIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-100/80",
        OFF_DUTY: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-100/80",
        SUSPENDED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80",
        
        // Trip
        DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-100/80",
        DISPATCHED: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-100/80",
        COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100/80",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80",
        
        // Maintenance
        OPEN: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100/80",
        IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100/80",
        
        // Priority
        LOW: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 hover:bg-gray-100/80",
        MEDIUM: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100/80",
        HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-100/80",
        CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100/80",
      },
    },
    defaultVariants: {
      status: "AVAILABLE",
    },
  }
)

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: string | null | undefined
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  // Format the text from SNAKE_CASE to Title Case
  const formattedText = status
    ? String(status).replace(/_/g, " ").replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    : "Unknown"

  // We cast status to any here because it accepts dynamic strings that might not be in the cva definition
  const badgeStatus = status as any

  return (
    <div className={cn(statusBadgeVariants({ status: badgeStatus }), className)} {...props}>
      {formattedText}
    </div>
  )
}
