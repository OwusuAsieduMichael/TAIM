import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function StudentDashboard() {
  const token = useAuthStore((s) => s.token);
  const { data: results } = useQuery({
    queryKey: ['results', 'student'],
    queryFn: () =>
      apiFetch<{ data: { subject: { name: string }; grade: number; remark: string; finalScore: number }[] }>(
        '/api/v1/results?published=true',
        { token },
      ),
    enabled: !!token,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Student</h1>
        <p className="text-sm text-[var(--color-muted)]">Your published results appear below.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
          <CardDescription>Published grades only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {(results?.data?.length ?? 0) === 0 && <p className="text-[var(--color-muted)]">No published results yet.</p>}
          {results?.data?.map((r, i) => (
            <p key={i}>
              <span className="font-medium">{r.subject.name}</span>: {r.finalScore}% · grade {r.grade} ({r.remark})
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
