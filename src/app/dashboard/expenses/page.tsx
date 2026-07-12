import prisma from "@/lib/prisma"
import { columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Expenses",
}

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
  })

  const formattedExpenses = expenses.map(exp => ({
    id: exp.id,
    category: exp.category,
    amount: Number(exp.amount),
    date: exp.date,
    tripId: exp.tripId,
  }))

  const totalExpenses = formattedExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  // Group by category for quick summary
  const summaryByCategory = formattedExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Expenses Ledger</h2>
          <p className="text-muted-foreground">
            Comprehensive view of all operational costs (Fuel, Maintenance, Salary, etc.)
          </p>
        </div>
        <Link href="/dashboard/expenses/new" className={buttonVariants({ variant: "default" })}>
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Link>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        {Object.entries(summaryByCategory).slice(0, 3).map(([category, amount]) => (
          <Card key={category}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{category.toLowerCase()} Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mx-auto w-full max-w-full">
        <DataTable columns={columns} data={formattedExpenses} searchKey="category" />
      </div>
    </div>
  )
}
