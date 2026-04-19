type Props = { message: string };

/** Screen-reader announcements for async feedback (e.g. refresh). */
export function StudentLiveRegion({ message }: Props) {
  return (
    <div role="status" aria-live="polite" aria-atomic className="sr-only">
      {message}
    </div>
  );
}
