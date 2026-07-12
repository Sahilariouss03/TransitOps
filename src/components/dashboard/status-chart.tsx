"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts"

interface StatusChartProps {
  available: number
  onTrip: number
  inShop: number
}

export function StatusChart({ available, onTrip, inShop }: StatusChartProps) {
  const data = [
    { name: "Available", value: available, color: "#10b981" },
    { name: "On Trip", value: onTrip, color: "#3b82f6" },
    { name: "In Shop", value: inShop, color: "#f59e0b" },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: 'var(--tw-colors-background)', borderRadius: '8px', border: '1px solid var(--tw-colors-border)' }}
        />
        <Legend verticalAlign="bottom" height={36}/>
      </PieChart>
    </ResponsiveContainer>
  )
}
