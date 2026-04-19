import {
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Laptop2,
  ListChecks,
  ReceiptText,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type ServiceCard = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  href?: string;
  comingSoon?: boolean;
  featured?: boolean;
};

type Props = {
  average: number | null;
};

export function StudentServiceHub({ average }: Props) {
  const cards: ServiceCard[] = [
    {
      title: 'Status Checker',
      description:
        average === null ? 'Discover your academic standing for the current term.' : `Current average: ${average}%`,
      icon: BadgeCheck,
      href: '/app/student/results',
      featured: true,
    },
    {
      title: 'Course Registration',
      description: 'Register courses and electives for your academic module.',
      icon: BookOpenCheck,
      comingSoon: true,
    },
    {
      title: 'Registration Slip',
      description: 'View and download your registration details.',
      icon: ReceiptText,
      comingSoon: true,
    },
    {
      title: 'Check Results',
      description: 'Open detailed results, grade trails, and performance reports.',
      icon: ClipboardCheck,
      href: '/app/student/results',
    },
    {
      title: 'Assess Lecturers',
      description: 'Provide structured feedback for teaching quality.',
      icon: Users,
      comingSoon: true,
    },
    {
      title: 'Bill and Payments',
      description: 'Track fees, dues, and payment references.',
      icon: CreditCard,
      comingSoon: true,
    },
    {
      title: 'Attendance Log',
      description: 'Review daily attendance marks and class presence.',
      icon: ListChecks,
      href: '/app/student/attendance',
    },
    {
      title: 'Virtual Classroom',
      description: 'Join online lessons with video, audio, and classroom chat.',
      icon: Laptop2,
      comingSoon: true,
    },
    {
      title: 'Student Profile',
      description: 'Manage identity details and passport documents on file.',
      icon: FileText,
      href: '/app/student/profile',
    },
  ];

  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Services</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          const cls =
            'student-interactive-well group rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 text-left shadow-sm hover:border-[var(--color-primary)]/35 hover:bg-[var(--color-primary)]/[0.04]';

          if (card.href) {
            return (
              <Link
                key={card.title}
                to={card.href}
                className={cn(cls, card.featured && 'border-[var(--color-primary)]/30')}
              >
                <Icon className="h-7 w-7 text-[var(--color-foreground)]" strokeWidth={1.75} />
                <p className="mt-5 text-[1.07rem] font-semibold text-[var(--color-primary)]">{card.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{card.description}</p>
              </Link>
            );
          }

          return (
            <div
              key={card.title}
              className={cn(cls, 'cursor-default opacity-95', card.featured && 'border-[var(--color-primary)]/30')}
            >
              <Icon className="h-7 w-7 text-[var(--color-foreground)]" strokeWidth={1.75} />
              <div className="mt-5 flex items-center justify-between gap-2">
                <p className="text-[1.07rem] font-semibold text-[var(--color-primary)]">{card.title}</p>
                {card.comingSoon ? (
                  <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                    Soon
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">{card.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
