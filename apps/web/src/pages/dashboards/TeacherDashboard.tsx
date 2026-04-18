import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Teacher workspace</h1>
        <p className="text-sm text-[var(--color-muted)]">Mark attendance and review classes via the API.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance</CardTitle>
          <CardDescription>POST /api/v1/attendance/bulk</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--color-muted)]">
          <p>
            Send <code className="rounded bg-black/5 px-1">classId</code>,{' '}
            <code className="rounded bg-black/5 px-1">date</code> (YYYY-MM-DD), and{' '}
            <code className="rounded bg-black/5 px-1">rows</code> with student IDs and statuses.
          </p>
          <p>Parents receive in-app notifications and SMS stubs when a student is marked absent.</p>
        </CardContent>
      </Card>
    </div>
  );
}
