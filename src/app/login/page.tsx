"use client"

import { useActionState } from "react"
import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car } from "lucide-react"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="mb-2 flex items-center justify-center gap-2 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <span className="text-xl">TransitOps</span>
            </div>
            <h3 className="font-semibold leading-none tracking-tight text-center text-xl">
              Welcome back
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Enter your email below to login to your account
            </p>
          </div>
          <div className="p-6 pt-0">
            <form action={formAction}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@transitops.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    defaultValue="sexyladyonthefloor123"
                  />
                </div>
                {state?.error && (
                  <p className="text-sm font-medium text-destructive">
                    {state.error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Signing in..." : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
