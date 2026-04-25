import { AdminAttendanceNoteModalBody } from '@/components/admin/AdminAttendanceNoteModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminAttendancePage() {
  return (
    <AdminModulePage
      summaryModule="attendance"
      title="Attendance"
      description="Monthly calendar and daily summaries. Pick a date to drill into class registers."
      primaryActionLabel="Mark Attendance"
      secondaryActionLabel="Export Summary"
      renderModalBody={({ close }) => <AdminAttendanceNoteModalBody close={close} />}
      filters={[
        { key: 'class', label: 'Class', options: ['All classes', 'JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A'] },
        { key: 'term', label: 'Term', options: ['All terms', 'Term 1', 'Term 2', 'Term 3'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Complete', 'Pending'] },
      ]}
      columns={['Date', 'Class', 'Present', 'Absent', 'Status']}
      rows={[
        { Date: '2026-04-23', Class: 'JHS 1A', Present: '38', Absent: '2', Status: 'Complete', Term: 'Term 2' },
        { Date: '2026-04-23', Class: 'JHS 2B', Present: '35', Absent: '4', Status: 'Complete', Term: 'Term 2' },
        { Date: '2026-04-24', Class: 'JHS 3A', Present: '31', Absent: '6', Status: 'Pending', Term: 'Term 2' },
        { Date: '2026-04-24', Class: 'JHS 1B', Present: '37', Absent: '3', Status: 'Complete', Term: 'Term 2' },
      ]}
      rowActions={['Open Register', 'Edit Entry', 'Send Reminder']}
    />
  );
}
