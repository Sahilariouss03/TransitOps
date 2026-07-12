export const roleLabels = {
  ADMIN: "Admin",
  FLEET_MANAGER: "Fleet Manager",
  DISPATCHER: "Dispatcher",
  DRIVER: "Driver",
  SAFETY_OFFICER: "Safety Officer",
  FINANCIAL_ANALYST: "Financial Analyst",
} as const

export type AppRole = keyof typeof roleLabels

export const routeAccessRules = [
  {
    label: "Dashboard",
    path: "/dashboard",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"] as AppRole[],
  },
  {
    label: "Vehicles",
    path: "/dashboard/vehicles",
    allowedRoles: ["ADMIN", "FLEET_MANAGER"] as AppRole[],
  },
  {
    label: "Drivers",
    path: "/dashboard/drivers",
    allowedRoles: ["ADMIN", "SAFETY_OFFICER"] as AppRole[],
  },
  {
    label: "Trips",
    path: "/dashboard/trips",
    allowedRoles: ["ADMIN", "DISPATCHER"] as AppRole[],
  },
  {
    label: "Maintenance",
    path: "/dashboard/maintenance",
    allowedRoles: ["ADMIN", "FLEET_MANAGER"] as AppRole[],
  },
  {
    label: "Fuel Logs",
    path: "/dashboard/fuel",
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"] as AppRole[],
  },
  {
    label: "Expenses",
    path: "/dashboard/expenses",
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"] as AppRole[],
  },
  {
    label: "Analytics",
    path: "/dashboard/analytics",
    allowedRoles: ["ADMIN", "FINANCIAL_ANALYST"] as AppRole[],
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    allowedRoles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"] as AppRole[],
  },
] as const

export function canAccessRoute(role: string | undefined, pathname: string) {
  const matchedRule = [...routeAccessRules]
    .sort((a, b) => b.path.length - a.path.length)
    .find((rule) => pathname === rule.path || pathname.startsWith(`${rule.path}/`))

  if (!matchedRule) {
    return true
  }

  if (!role) {
    return false
  }

  return matchedRule.allowedRoles.includes(role as AppRole)
}
