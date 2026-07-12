import prisma from "@/lib/prisma"

export const metadata = {
  title: "Print Fleet Report - TransitOps",
}

export default async function PrintAnalyticsPage() {
  const [vehicles, settings] = await Promise.all([
    prisma.vehicle.findMany({
      where: { deletedAt: null },
      include: {
        trips: {
          where: { deletedAt: null }
        },
        fuelLogs: {
          where: { deletedAt: null }
        },
        maintenanceLogs: {
          where: { deletedAt: null }
        }
      }
    }),
    prisma.appSettings.findUnique({
      where: { id: "default" }
    })
  ])

  const depotName = settings?.depotName || "Grandhinagar Depot GJ4"
  const currency = settings?.currency || "INR (Rs)"

  const vehicleMetrics = vehicles.map(vehicle => {
    const completedTrips = vehicle.trips.filter(t => t.status === "COMPLETED")
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.actualDistance || t.plannedDistance || 0), 0)
    const totalFuelFromTrips = completedTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0)
    
    const fuelEfficiency = totalFuelFromTrips > 0 ? (totalDistance / totalFuelFromTrips) : 0
    const totalFuelCost = vehicle.fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0)
    const totalMaintenanceCost = vehicle.maintenanceLogs.reduce((sum, m) => sum + Number(m.actualCost || m.estimatedCost || 0), 0)
    const operationalCost = totalFuelCost + totalMaintenanceCost
    const totalRevenue = completedTrips.reduce((sum, t) => sum + Number(t.revenue), 0)
    
    const acquisitionCost = Number(vehicle.acquisitionCost)
    const roi = acquisitionCost > 0 ? ((totalRevenue - operationalCost) / acquisitionCost) * 100 : 0
    
    return {
      registrationNumber: vehicle.registrationNumber,
      manufacturer: vehicle.manufacturer,
      model: vehicle.model,
      totalDistance,
      totalFuelFromTrips,
      fuelEfficiency,
      totalFuelCost,
      totalMaintenanceCost,
      operationalCost,
      totalRevenue,
      roi,
    }
  })

  const isINR = currency.includes("INR")
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(isINR ? "en-IN" : "en-US", {
      style: "currency",
      currency: isINR ? "INR" : "USD",
    }).format(val)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto bg-white text-black font-sans">
      <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">TransitOps Fleet Report</h1>
          <p className="text-sm text-gray-600 mt-1">{depotName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">Report Generated</p>
          <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
          <p className="text-xs text-gray-500">Currency: {currency}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2">Fleet Vehicle Operational & Financial Summary</h2>
        <p className="text-xs text-gray-600">
          This document displays key performance indicators for each active vehicle in the fleet, including fuel efficiency, operational costs, gross revenue, and return on investment (ROI).
        </p>
      </div>

      <table className="w-full text-xs text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            <th className="p-2 border-r border-gray-300 font-bold">Vehicle</th>
            <th className="p-2 border-r border-gray-300 font-bold">Distance</th>
            <th className="p-2 border-r border-gray-300 font-bold">Fuel Used</th>
            <th className="p-2 border-r border-gray-300 font-bold">Fuel Efficiency</th>
            <th className="p-2 border-r border-gray-300 font-bold">Fuel Cost</th>
            <th className="p-2 border-r border-gray-300 font-bold">Maint. Cost</th>
            <th className="p-2 border-r border-gray-300 font-bold">Total Operating Cost</th>
            <th className="p-2 border-r border-gray-300 font-bold">Revenue</th>
            <th className="p-2 text-right font-bold">ROI (%)</th>
          </tr>
        </thead>
        <tbody>
          {vehicleMetrics.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-2 border-r border-gray-300 font-semibold">
                {row.registrationNumber} ({row.manufacturer} {row.model})
              </td>
              <td className="p-2 border-r border-gray-300">{row.totalDistance.toLocaleString()} km</td>
              <td className="p-2 border-r border-gray-300">{row.totalFuelFromTrips.toLocaleString()} L</td>
              <td className="p-2 border-r border-gray-300">
                {row.fuelEfficiency > 0 ? `${row.fuelEfficiency.toFixed(2)} km/L` : "N/A"}
              </td>
              <td className="p-2 border-r border-gray-300">{formatCurrency(row.totalFuelCost)}</td>
              <td className="p-2 border-r border-gray-300">{formatCurrency(row.totalMaintenanceCost)}</td>
              <td className="p-2 border-r border-gray-300 font-semibold">{formatCurrency(row.operationalCost)}</td>
              <td className="p-2 border-r border-gray-300">{formatCurrency(row.totalRevenue)}</td>
              <td className="p-2 text-right font-bold text-gray-900">{row.roi.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
        &copy; {new Date().getFullYear()} TransitOps Platform. All rights reserved.
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          `,
        }}
      />
    </div>
  )
}
