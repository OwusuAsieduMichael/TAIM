import { AdminClassCreateModalBody } from '@/components/admin/AdminClassCreateModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminClassesPage() {
  return (
    <AdminModulePage
      summaryModule="classes"
      title="Classes"
      description="Streams and cohorts (e.g. JHS 1-A). Toggle subjects taught in each class with instant feedback."
      primaryActionLabel="Add Class"
      renderModalBody={({ close }) => <AdminClassCreateModalBody close={close} />}
      filters={[
        { key: 'level', label: 'Level', options: ['All levels', 'JHS 1', 'JHS 2', 'JHS 3'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Active', 'Inactive'] },
        { key: 'shift', label: 'Shift', options: ['All shifts', 'Morning', 'Afternoon'] },
      ]}
      columns={['Class', 'Code', 'Class Teacher', 'Subjects', 'Status']}
      rows={[
        { Class: 'JHS 1A', Code: 'CLS-101', 'Class Teacher': 'Abena Ofori', Subjects: '8', Status: 'Active', Level: 'JHS 1', Shift: 'Morning' },
        { Class: 'JHS 1B', Code: 'CLS-102', 'Class Teacher': 'Kojo Asare', Subjects: '8', Status: 'Active', Level: 'JHS 1', Shift: 'Morning' },
        { Class: 'JHS 2A', Code: 'CLS-201', 'Class Teacher': 'Kwame Mensah', Subjects: '9', Status: 'Active', Level: 'JHS 2', Shift: 'Afternoon' },
        { Class: 'JHS 3A', Code: 'CLS-301', 'Class Teacher': 'Efua Boakye', Subjects: '10', Status: 'Inactive', Level: 'JHS 3', Shift: 'Morning' },
      ]}
      rowActions={['Open Class', 'Edit', 'Assign Subjects', 'Archive']}
    />
  );
}
