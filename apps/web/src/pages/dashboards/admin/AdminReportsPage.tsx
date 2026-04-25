import { AdminInsightCharts } from '@/components/admin/AdminInsightCharts';
import { AdminReportGenerateModalBody } from '@/components/admin/AdminReportGenerateModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminReportsPage() {
  return (
    <AdminModulePage
      summaryModule="reports"
      title="Reports & analytics"
      description="Class performance, rankings, and longitudinal trends — export-friendly summaries."
      primaryActionLabel="Generate Report"
      secondaryActionLabel="Export PDF"
      belowContent={<AdminInsightCharts />}
      renderModalBody={({ close }) => <AdminReportGenerateModalBody close={close} />}
      filters={[
        { key: 'type', label: 'Type', options: ['All types', 'Performance', 'Attendance', 'Behaviour'] },
        { key: 'period', label: 'Period', options: ['All periods', 'Weekly', 'Monthly', 'Termly'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Ready', 'Draft'] },
      ]}
      columns={['Report', 'Category', 'Coverage', 'Generated', 'Status']}
      rows={[
        { Report: 'Top Performing Classes', Category: 'Performance', Coverage: 'Term 2', Generated: 'Apr 22, 2026', Status: 'Ready', Period: 'Termly' },
        { Report: 'Attendance Exceptions', Category: 'Attendance', Coverage: 'Last 30 days', Generated: 'Apr 24, 2026', Status: 'Ready', Period: 'Monthly' },
        { Report: 'Subject Mean Score Trend', Category: 'Performance', Coverage: 'Term 1 - Term 2', Generated: 'Apr 19, 2026', Status: 'Draft', Period: 'Termly' },
        { Report: 'Behaviour Case Summary', Category: 'Behaviour', Coverage: 'This Month', Generated: 'Apr 24, 2026', Status: 'Draft', Period: 'Monthly' },
      ]}
      rowActions={['Open Report', 'Regenerate', 'Share', 'Archive']}
    />
  );
}
