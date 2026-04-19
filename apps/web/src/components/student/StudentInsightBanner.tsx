import { AlertTriangle, Lightbulb, PartyPopper, Sparkles, WifiOff } from 'lucide-react';
import type { InsightBannerModel } from '@/lib/studentInsights';
import { cn } from '@/lib/utils';

function BannerIcon({ model }: { model: InsightBannerModel }) {
  if (model.variant === 'warning' && model.message.toLowerCase().includes('offline')) {
    return <WifiOff className="h-5 w-5" strokeWidth={1.75} />;
  }
  if (model.variant === 'warning') return <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />;
  if (model.variant === 'success') return <Sparkles className="h-5 w-5" strokeWidth={1.75} />;
  if (model.variant === 'celebrate') return <PartyPopper className="h-5 w-5" strokeWidth={1.75} />;
  return <Lightbulb className="h-5 w-5" strokeWidth={1.75} />;
}

export function StudentInsightBanner({ model }: { model: InsightBannerModel }) {

  return (
    <div
      role="status"
      className={cn(
        'mb-6 flex gap-3 rounded-2xl border px-4 py-3.5 shadow-sm motion-safe:animate-[insight-in_280ms_ease-out_both]',
        model.variant === 'success' && 'border-[var(--color-success)]/35 bg-[var(--color-success)]/8',
        model.variant === 'warning' && 'border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10',
        model.variant === 'info' && 'border-[var(--color-primary)]/25 bg-[var(--color-primary)]/6',
        model.variant === 'celebrate' && 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          model.variant === 'success' && 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
          model.variant === 'warning' && 'bg-[var(--color-warning)]/20 text-[var(--color-warning)]',
          model.variant === 'info' && 'bg-[var(--color-primary)]/12 text-[var(--color-primary)]',
          model.variant === 'celebrate' && 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
        )}
      >
        <BannerIcon model={model} />
      </div>
      <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-[var(--color-foreground)]">{model.message}</p>
    </div>
  );
}
