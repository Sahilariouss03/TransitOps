"use client"

import { useActionState, useState } from "react"
import { AlertCircle } from "lucide-react"

import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)
  const [role, setRole] = useState("DISPATCHER")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 font-sans text-gray-200 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Sign in to your account</h1>
          <p className="text-sm text-gray-400">Enter your credentials to continue</p>
        </div>

        <form action={formAction}>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-400">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="dispatcher@transitops.com"
                required
                className="h-12 border-zinc-800 bg-zinc-900 focus-visible:ring-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-400">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                defaultValue="test123"
                className="h-12 border-zinc-800 bg-zinc-900 focus-visible:ring-zinc-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-xs uppercase tracking-wider text-gray-400">
                Role (RBAC)
              </Label>
              <input type="hidden" name="role" value={role} />
              <Select onValueChange={(value) => setRole(value ?? "DISPATCHER")} value={role}>
                <SelectTrigger className="h-12 w-full border-zinc-800 bg-zinc-900 focus:ring-zinc-700">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-900 text-gray-200">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                  <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                  <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                  <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border border-zinc-700 bg-zinc-900 accent-emerald-600"
                />
                <label htmlFor="remember" className="text-sm font-medium leading-none text-gray-300">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                Forgot password?
              </a>
            </div>

            {state?.error ? (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-red-900/50 bg-red-950/50 p-3 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">{state.error}</p>
              </div>
            ) : null}

            <Button
              type="submit"
              className="mt-2 h-12 w-full bg-amber-600 text-base font-medium text-white hover:bg-amber-700"
              disabled={isPending}
            >
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="mb-3 text-sm font-medium text-gray-400">Access is scoped by role after login:</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>Admin - Complete Access</li>
            <li>Fleet Manager - Fleet, Maintenance</li>
            <li>Dispatcher - Dashboard, Trips</li>
            <li>Safety Officer - Drivers, Compliance</li>
            <li>Financial Analyst - Fuel & Expenses, Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
