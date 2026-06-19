type Props = {
  label?: string;
};

/** Separates quick portal access from credential-based sign-in on login pages. */
export function AuthFormDivider({ label = 'Sign in with your credentials' }: Props) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <span className="w-full border-t border-[var(--color-border)]/80" />
      </div>
      <p className="relative mx-auto w-fit bg-[var(--color-card)] px-3 text-xs font-medium tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
    </div>
  );
}
