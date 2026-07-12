"use client"

import { DataTable } from "@/components/ui/data-table"
import { getColumns, FuelLogRow } from "@/app/dashboard/fuel/columns"

interface FuelTableClientProps {
  data: FuelLogRow[]
  currencyCode: string
}

export function FuelTableClient({ data, currencyCode }: FuelTableClientProps) {
  const columns = getColumns(currencyCode)
  return <DataTable columns={columns} data={data} searchKey="vehicleReg" />
}
