import type { ReactNode } from 'react';

type BadgeVariant = 'gold' | 'neutral' | 'outline';

const VARIANTS: Record<BadgeVariant, string> = {
  gold: 'bg-gold-wash text-gold-deep border border-gold/25',
  neutral: 'bg-mist text-ink-soft border border-line',
  outline: 'bg-transparent text-ink-muted border border-line',
};

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
