'use client'

import AnalyticsDashboard from '@/components/AnalyticsDashboard'

export default function ViewerDashboardPage() {
  return (
    <AnalyticsDashboard
      title="Dashboard Viewer"
      subtitle="Monitoring Kepuasan Pasien RS Baiturrahim Jambi"
      canExport={false}
      showPayment
    />
  )
}
