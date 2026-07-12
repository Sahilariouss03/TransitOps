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
  PieChart,
} from "lucide-react"
import { useRouter } from "next/navigation"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    const handleOpenCustom = () => {
      setOpen(true)
    }

    document.addEventListener("keydown", down)
    document.addEventListener("open-command-palette", handleOpenCustom)
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("open-command-palette", handleOpenCustom)
    }
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/vehicles"))}>
            <Car className="mr-2 h-4 w-4" />
            <span>Vehicles</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/drivers"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Drivers</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Operations">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/trips"))}>
            <Map className="mr-2 h-4 w-4" />
            <span>Trips</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/maintenance"))}>
            <Wrench className="mr-2 h-4 w-4" />
            <span>Maintenance</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/fuel"))}>
            <Fuel className="mr-2 h-4 w-4" />
            <span>Fuel Logs</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/expenses"))}>
            <DollarSign className="mr-2 h-4 w-4" />
            <span>Expenses</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/analytics"))}>
            <PieChart className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
