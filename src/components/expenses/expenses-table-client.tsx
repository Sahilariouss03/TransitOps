"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns, ExpenseRow } from "@/app/dashboard/expenses/columns"

interface ExpensesTableClientProps {
  data: ExpenseRow[]
  currencyCode: string
}

export function ExpensesTableClient({ data, currencyCode }: ExpensesTableClientProps) {
  const columns = getColumns(currencyCode)
  return <DataTable columns={columns} data={data} searchKey="category" />
}
