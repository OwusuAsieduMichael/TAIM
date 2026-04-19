import { apiFetch } from '@/lib/api';

export type InAppNotification = {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
};

export async function listNotifications(token: string) {
  return apiFetch<{ data: InAppNotification[] }>('/api/v1/notifications', { token });
}

export async function markNotificationRead(token: string, id: string) {
  await apiFetch<unknown>(`/api/v1/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    token,
  });
}
