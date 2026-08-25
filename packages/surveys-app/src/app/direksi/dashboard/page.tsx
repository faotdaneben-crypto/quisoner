'use client'

import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function DireksiDashboardPage() {
  return (
    <AnalyticsDashboard
      title="Dashboard Direksi"
      subtitle="Monitoring Kepuasan Pasien RS Baiturrahim Jambi"
      canExport
      showPayment
    />
  )
}
