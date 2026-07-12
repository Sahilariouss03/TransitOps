"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TopNav } from "@/components/layout/top-nav"
import { CommandPalette } from "@/components/layout/command-palette"
import { PageTransition } from "@/components/ui/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
