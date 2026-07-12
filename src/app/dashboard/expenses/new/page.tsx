import { ExpenseForm } from "@/components/expenses/expense-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"

export const metadata = {
  title: "Log Expense",
}

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/expenses" className={buttonVariants({ variant: "outline", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Log Expense</h2>
          <p className="text-muted-foreground">
            Record a general business or trip-related expense.
          </p>
        </div>
      </div>
      
      <div className="max-w-3xl rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <ExpenseForm />
      </div>
    </div>
  )
}
