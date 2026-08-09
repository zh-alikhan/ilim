'use client';

import type { LucideIcon } from 'lucide-react';

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  index,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  index: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div
        className="flex h-11 w-11 flex-none items-center justify-center rounded-xl border border-gold/20 bg-gold-wash"
        aria-hidden
      >
        <Icon className="h-5 w-5 text-gold-deep" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="font-display text-xs font-bold tabular-nums text-gold"
          >
            {index}
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {title}
          </h2>
        </div>
        <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}
