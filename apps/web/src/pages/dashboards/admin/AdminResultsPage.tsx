import { AdminResultsPublishModalBody } from '@/components/admin/AdminResultsPublishModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminResultsPage() {
  return (
    <AdminModulePage
      summaryModule="results"
      title="Results"
      description="Draft and published terms with lock controls. Critical publishes use confirmation dialogs."
      primaryActionLabel="Publish Results"
      secondaryActionLabel="Export Sheet"
      renderModalBody={({ close }) => <AdminResultsPublishModalBody close={close} />}
      filters={[
        { key: 'class', label: 'Class', options: ['All classes', 'JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 3A'] },
        { key: 'term', label: 'Term', options: ['All terms', 'Term 1', 'Term 2', 'Term 3'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Published', 'Draft'] },
      ]}
      columns={['Term', 'Class', 'Subjects', 'Last Updated', 'Status']}
      rows={[
        { Term: 'Term 2', Class: 'JHS 1A', Subjects: '8', 'Last Updated': 'Apr 20, 2026', Status: 'Published' },
        { Term: 'Term 2', Class: 'JHS 1B', Subjects: '8', 'Last Updated': 'Apr 20, 2026', Status: 'Published' },
        { Term: 'Term 2', Class: 'JHS 2A', Subjects: '9', 'Last Updated': 'Apr 23, 2026', Status: 'Draft' },
        { Term: 'Term 2', Class: 'JHS 3A', Subjects: '10', 'Last Updated': 'Apr 24, 2026', Status: 'Draft' },
      ]}
      rowActions={['Open Results', 'Edit Scores', 'Publish', 'Lock']}
    />
  );
}
