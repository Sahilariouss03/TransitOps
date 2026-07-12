"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { CommandPalette } from "@/components/layout/command-palette"
import { PageTransition } from "@/components/ui/page-transition"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const denied = searchParams?.get("denied")

  useEffect(() => {
    if (denied) {
      toast.error("Access Denied: You do not have permission to access that resource.")
      // Remove query parameter from URL
      const newUrl = window.location.pathname
      router.replace(newUrl)
    }
  }, [denied, router])
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <CommandPalette />
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <TopNav />
        </header>
        <main className="flex-1 overflow-auto bg-muted/20 p-4 md:p-6">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
