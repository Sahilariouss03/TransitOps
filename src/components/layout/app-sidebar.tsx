"use client"

import * as React from "react"
import {
  Car,
  LayoutDashboard,
  Users,
  Map,
  Wrench,
  Fuel,
  DollarSign,
  Settings,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"],
  },
  {
    title: "Vehicles",
    url: "/dashboard/vehicles",
    icon: Car,
    allowedRoles: ["ADMIN", "FLEET_MANAGER"],
  },
  {
    title: "Drivers",
    url: "/dashboard/drivers",
    icon: Users,
    allowedRoles: ["ADMIN", "SAFETY_OFFICER"],
  },
  {
    title: "Trips",
    url: "/dashboard/trips",
    icon: Map,
    allowedRoles: ["ADMIN", "DISPATCHER"],
  },
  {
    title: "Maintenance",
    url: "/dashboard/maintenance",
    icon: Wrench,
    allowedRoles: ["ADMIN", "FLEET_MANAGER"],
  },
  {
    title: "Fuel Logs",
    url: "/dashboard/fuel",
    icon: Fuel,
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"],
  },
  {
    title: "Expenses",
    url: "/dashboard/expenses",
    icon: DollarSign,
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"],
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: PieChart,
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  
  // @ts-expect-error session.user.role exists
  const userRole = session?.user?.role || "ADMIN"

  const filteredItems = items.filter(item => item.allowedRoles.includes(userRole))

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex h-16 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2 font-bold">
          <Car className="h-6 w-6 text-primary" />
          <span>TransitOps</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarMenu>
          {filteredItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton isActive={pathname === item.url || pathname.startsWith(item.url + "/")}>
                <Link href={item.url} className="flex items-center gap-2">
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Link href="/dashboard/settings" className="flex items-center gap-2">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
