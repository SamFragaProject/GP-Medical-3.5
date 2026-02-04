import React from 'react'
import { AreaChart, Title, Text } from '@tremor/react'

const data = [
    { name: 'Lun', "Ritmo Cardíaco": 72, "Presión": 120, "Glucosa": 95 },
    { name: 'Mar', "Ritmo Cardíaco": 75, "Presión": 118, "Glucosa": 98 },
    { name: 'Mie', "Ritmo Cardíaco": 70, "Presión": 122, "Glucosa": 92 },
    { name: 'Jue', "Ritmo Cardíaco": 78, "Presión": 125, "Glucosa": 96 },
    { name: 'Vie', "Ritmo Cardíaco": 74, "Presión": 119, "Glucosa": 94 },
    { name: 'Sab', "Ritmo Cardíaco": 71, "Presión": 117, "Glucosa": 90 },
    { name: 'Dom', "Ritmo Cardíaco": 69, "Presión": 115, "Glucosa": 88 },
]

export function HealthOverviewChart() {
    return (
        <div className="h-72 w-full">
            <AreaChart
                className="h-full mt-4"
                data={data}
                index="name"
                categories={["Ritmo Cardíaco", "Presión", "Glucosa"]}
                colors={["emerald-500", "blue-500", "amber-500"]}
                yAxisWidth={40}
                showAnimation={true}
                showGradient={true}
                curveType="monotone"
                showLegend={true}
                showGridLines={false}
            />
        </div>
    )
}
