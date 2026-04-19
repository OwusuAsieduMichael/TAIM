import { IdCard, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type SlotProps = {
  title: string;
  description: string;
  url: string | null | undefined;
  aspectClass: string;
};

function PassportSlot({ title, description, url, aspectClass }: SlotProps) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] shadow-sm">
      <div className="border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-muted)]">{description}</p>
      </div>
      <div className={cn('relative bg-[var(--color-card)]', aspectClass)}>
        {!url || broken ? (
          <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <ImageOff className="h-10 w-10 text-[var(--color-muted)]" strokeWidth={1.5} />
            <p className="text-sm font-medium text-[var(--color-foreground)]">No image yet</p>
            <p className="max-w-[14rem] text-xs leading-relaxed text-[var(--color-muted)]">
              Your school will attach this after your passport photo is uploaded.
            </p>
          </div>
        ) : (
          <>
            <img
              src={url}
              alt={title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain"
              onError={() => setBroken(true)}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-2 right-2 rounded-lg bg-[var(--color-foreground)]/80 px-2.5 py-1.5 text-xs font-semibold text-[var(--color-background)] backdrop-blur-sm transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              Open full size
            </a>
          </>
        )}
      </div>
    </div>
  );
}

type Props = {
  passportPhotoUrl?: string | null;
};

export function StudentPassportGallery({ passportPhotoUrl }: Props) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)]/10">
          <IdCard className="h-6 w-6 text-[var(--color-primary)]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">Passport photo on file</h2>
          <p className="mt-1 text-sm leading-relaxed text-[var(--color-muted)]">
            Portrait your school has linked to your profile. Contact the office if it needs updating.
          </p>
        </div>
      </div>

      <PassportSlot
        title="Passport photo"
        description="Portrait-style image with your face clearly visible."
        url={passportPhotoUrl}
        aspectClass="aspect-[3/4] max-h-[min(70vh,520px)] sm:max-h-none"
      />
    </section>
  );
}
