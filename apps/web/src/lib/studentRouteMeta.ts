export type StudentRouteMeta = { label: string; hint: string };

export function studentRouteMeta(pathname: string): StudentRouteMeta {
  if (pathname.includes('/student/home')) {
    return { label: 'Dashboard', hint: 'Performance, attendance, and quick actions' };
  }
  if (pathname.includes('/student/results')) {
    return { label: 'Results', hint: 'Subject scores and breakdowns' };
  }
  if (pathname.includes('/student/attendance')) {
    return { label: 'Attendance', hint: 'Daily presence and recent history' };
  }
  if (pathname.includes('/student/profile')) {
    return { label: 'Profile', hint: 'Your details, class, and account' };
  }
  return { label: 'Student portal', hint: 'Your school workspace' };
}
