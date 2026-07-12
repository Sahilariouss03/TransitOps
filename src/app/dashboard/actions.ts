"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserNotifications() {
  const session = await auth()
  if (!session?.user?.id) return []

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 15,
    })
    return notifications
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return []
  }
}

export async function markNotificationRead(id: string) {
  try {
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    })
    
    const session = await auth()
    if (session?.user?.id) {
      revalidatePath("/dashboard")
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return { error: "Failed to mark notification as read." }
  }
}
