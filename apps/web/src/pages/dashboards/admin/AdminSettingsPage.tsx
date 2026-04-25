import { AdminSettingsAddModalBody } from '@/components/admin/AdminSettingsAddModalBody';
import { AdminModulePage } from '@/pages/dashboards/AdminModulePage';

export function AdminSettingsPage() {
  return (
    <AdminModulePage
      summaryModule="settings"
      title="Settings"
      description="School profile, academic year & terms, subject defaults, and system preferences."
      primaryActionLabel="Add Setting"
      secondaryActionLabel="Export Config"
      renderModalBody={({ close }) => <AdminSettingsAddModalBody close={close} />}
      filters={[
        { key: 'section', label: 'Section', options: ['All sections', 'School', 'Academics', 'Results', 'System'] },
        { key: 'owner', label: 'Owner', options: ['All owners', 'Admin', 'Academic Board', 'System'] },
        { key: 'status', label: 'Status', options: ['All statuses', 'Active', 'Inactive'] },
      ]}
      columns={['Setting', 'Section', 'Owner', 'Last Updated', 'Status']}
      rows={[
        { Setting: 'School Name & Branding', Section: 'School', Owner: 'Admin', 'Last Updated': 'Apr 15, 2026', Status: 'Active' },
        { Setting: 'Academic Year & Terms', Section: 'Academics', Owner: 'Academic Board', 'Last Updated': 'Apr 18, 2026', Status: 'Active' },
        { Setting: 'Result Publishing Window', Section: 'Results', Owner: 'Admin', 'Last Updated': 'Apr 24, 2026', Status: 'Active' },
        { Setting: 'SMS Notification Provider', Section: 'System', Owner: 'System', 'Last Updated': 'Apr 11, 2026', Status: 'Inactive' },
      ]}
      rowActions={['Open Setting', 'Edit', 'Audit Log', 'Disable']}
    />
  );
}
