import { AdminStudentAdmissionModalBody } from '@/components/admin/AdminStudentAdmissionModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminStudentsPage() {
  return (
    <AdminModulePage
      summaryModule="students"
      title="Students"
      description="Directory, enrolment status, and guardian links. Add learners, open profiles, and reset PINs with confirmation."
      primaryActionLabel="Add Student"
      renderModalBody={({ close }) => <AdminStudentAdmissionModalBody close={close} />}
      filters={[
        { key: 'class', label: 'Class', options: ['All classes', 'JHS 1A', 'JHS 1B', 'JHS 2A', 'JHS 2B', 'JHS 3A'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Active', 'Inactive'] },
        { key: 'boarding', label: 'Boarding', options: ['All types', 'Day', 'Boarding'] },
      ]}
      columns={['Student', 'Student ID', 'Class', 'Guardian', 'Status']}
      rows={[
        { Student: 'Ama Asiedu', 'Student ID': 'STU-00142', Class: 'JHS 1A', Guardian: 'Kofi Asiedu', Status: 'Active', Boarding: 'Day' },
        { Student: 'Yaw Donkor', 'Student ID': 'STU-00143', Class: 'JHS 2B', Guardian: 'Esi Donkor', Status: 'Active', Boarding: 'Boarding' },
        { Student: 'Abigail Sarfo', 'Student ID': 'STU-00144', Class: 'JHS 3A', Guardian: 'Kwame Sarfo', Status: 'Inactive', Boarding: 'Day' },
        { Student: 'Nii Lartey', 'Student ID': 'STU-00145', Class: 'JHS 1B', Guardian: 'Adwoa Lartey', Status: 'Active', Boarding: 'Boarding' },
      ]}
      rowActions={['Open Profile', 'Edit', 'Reset PIN', 'Deactivate']}
    />
  );
}
