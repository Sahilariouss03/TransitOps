"use client"

import * as React from "react"
import { Bell, Search } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { getUserNotifications, markNotificationRead } from "@/app/dashboard/actions"
import { Notification } from "@prisma/client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNav() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = React.useState<Notification[]>([])

  const userName = session?.user?.name || "User"
  const userEmail = session?.user?.email || ""
  const userInitials = userName.substring(0, 2).toUpperCase()

  const fetchNotifications = React.useCallback(async () => {
    const list = await getUserNotifications()
    setNotifications(list)
  }, [])

  React.useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications()
    }
  }, [session, fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    fetchNotifications()
  }

  return (
    <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
      <div className="w-full flex-1 md:w-auto md:flex-none">
        <Button
          variant="outline"
          className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
          onClick={() => {
            document.dispatchEvent(new CustomEvent("open-command-palette"))
          }}
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="inline-flex">Search...</span>
          <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Button>
            }
          />
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto" align="end">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount} New
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <DropdownMenuItem
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer border-b last:border-b-0 ${
                    !n.read ? "bg-muted/40 hover:bg-muted font-medium" : "opacity-80"
                  }`}
                >
                  <span className="text-sm font-semibold">{n.title}</span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{n.description}</span>
                  <span className="text-[9px] text-muted-foreground/60 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 font-medium text-primary">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/settings")}>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
