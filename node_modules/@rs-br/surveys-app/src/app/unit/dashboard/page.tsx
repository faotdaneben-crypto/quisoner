'use client'

import { useEffect, useState } from 'react'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import { getStoredUser } from '@/lib/session'

export default function UnitDashboardPage() {
  const [unitName, setUnitName] = useState<string | null>(null)

  useEffect(() => {
    const u = getStoredUser()
    setUnitName(u?.unitName || null)
  }, [])

  return (
    <AnalyticsDashboard
      title={`Dashboard Unit${unitName ? ` · ${unitName}` : ''}`}
      subtitle="Kinerja Unit Layanan"
      scopeUnitName={unitName}
      canExport={false}
      showPayment={false}
    />
  )
}
