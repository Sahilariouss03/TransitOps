import { useActionState, useState } from "react"
import { loginAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, AlertCircle } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined)
  const [role, setRole] = useState("DISPATCHER")

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black p-6 md:p-10 font-sans text-gray-200">
      <div className="flex w-full max-w-md flex-col gap-8">
        
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif">Sign in to your account</h1>
          <p className="text-sm text-gray-400">
            Enter your credentials to continue
          </p>
        </div>
        
        <form action={formAction}>
          <div className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-gray-400">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="raven.k@transitops.in"
                required
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 h-12"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-gray-400">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                defaultValue="sexyladyonthefloor123"
                className="bg-zinc-900 border-zinc-800 focus-visible:ring-zinc-700 h-12"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role" className="text-xs uppercase tracking-wider text-gray-400">Role (RBAC)</Label>
              <input type="hidden" name="role" value={role} />
              <Select onValueChange={setRole} value={role}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-zinc-700 h-12">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-gray-200">
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="FLEET_MANAGER">Fleet Manager</SelectItem>
                  <SelectItem value="DISPATCHER">Dispatcher</SelectItem>
                  <SelectItem value="SAFETY_OFFICER">Safety Officer</SelectItem>
                  <SelectItem value="FINANCIAL_ANALYST">Financial Analyst</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="border-zinc-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600" />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                Forgot password?
              </a>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-950/50 border border-red-900/50 text-red-400 mt-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  {state.error}
                </p>
              </div>
            )}
            
            <Button type="submit" className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-medium text-base mt-2" disabled={isPending}>
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <p className="text-sm text-gray-400 mb-3 font-medium">Access is scoped by role after login:</p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>• Admin → Complete Access</li>
            <li>• Fleet Manager → Fleet, Maintenance</li>
            <li>• Dispatcher → Dashboard, Trips</li>
            <li>• Safety Officer → Drivers, Compliance</li>
            <li>• Financial Analyst → Fuel & Expenses, Analytics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
