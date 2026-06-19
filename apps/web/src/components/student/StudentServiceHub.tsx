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
import { ServiceHubCard } from '@/components/portal/ServiceHubCard';

type Props = {
  average: number | null;
};

export function StudentServiceHub({ average }: Props) {
  const cards = [
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
  ] as const;

  return (
    <section>
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">Services</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <ServiceHubCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={card.icon}
            href={'href' in card ? card.href : undefined}
            comingSoon={'comingSoon' in card ? card.comingSoon : false}
            featured={'featured' in card ? card.featured : false}
          />
        ))}
      </div>
    </section>
  );
}
