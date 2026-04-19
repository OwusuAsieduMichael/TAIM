import { cn } from '@/lib/utils';
import { SCHOOL_LOGO_IMAGE } from '@/lib/schoolBrand';

type Props = {
  className?: string;
  /** `default` = hero; `corner` = wide header strip; `nav` = dashboard sidebar / mobile header (no frame). */
  variant?: 'default' | 'corner' | 'nav';
};

/** School logo image — plain, no frame or filter effects. */
export function SchoolLogoFigure({ className, variant = 'default' }: Props) {
  return (
    <img
      src={SCHOOL_LOGO_IMAGE}
      alt="Tomhel Schools"
      width={480}
      height={160}
      decoding="async"
      className={cn(
        'object-contain',
        variant === 'default' && 'h-auto w-full max-w-[min(100%,300px)]',
        variant === 'corner' && 'h-auto w-56 sm:w-64',
        variant === 'nav' &&
          'h-12 w-auto max-w-[10rem] object-left drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)] sm:h-14 sm:max-w-[11.5rem]',
        className,
      )}
    />
  );
}
