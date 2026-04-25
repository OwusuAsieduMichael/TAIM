import { AdminSubjectCreateModalBody } from '@/components/admin/AdminSubjectCreateModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminSubjectsPage() {
  return (
    <AdminModulePage
      summaryModule="subjects"
      title="Subjects"
      description="Catalogue for your school — codes, levels, and which classes offer each subject."
      primaryActionLabel="Add Subject"
      renderModalBody={({ close }) => <AdminSubjectCreateModalBody close={close} />}
      filters={[
        { key: 'department', label: 'Department', options: ['All departments', 'Sciences', 'Languages', 'Mathematics', 'Arts'] },
        { key: 'level', label: 'Level', options: ['All levels', 'JHS 1', 'JHS 2', 'JHS 3'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Active', 'Inactive'] },
      ]}
      columns={['Subject', 'Code', 'Department', 'Classes', 'Status']}
      rows={[
        { Subject: 'English Language', Code: 'SUB-ENG', Department: 'Languages', Classes: 'JHS 1A, JHS 1B, JHS 2A', Status: 'Active', Level: 'JHS 1' },
        { Subject: 'Integrated Science', Code: 'SUB-INTSCI', Department: 'Sciences', Classes: 'JHS 2A, JHS 2B', Status: 'Active', Level: 'JHS 2' },
        { Subject: 'Mathematics', Code: 'SUB-MATH', Department: 'Mathematics', Classes: 'All JHS Classes', Status: 'Active', Level: 'JHS 3' },
        { Subject: 'Creative Arts', Code: 'SUB-ART', Department: 'Arts', Classes: 'JHS 1B, JHS 2B', Status: 'Inactive', Level: 'JHS 1' },
      ]}
      rowActions={['Open Subject', 'Edit', 'Assign Classes', 'Deactivate']}
    />
  );
}
