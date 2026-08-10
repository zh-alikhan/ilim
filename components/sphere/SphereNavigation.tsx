'use client';

import dynamic from 'next/dynamic';
import { useLocale } from '@/components/layout/LocaleProvider';
import { contentLocaleFor } from '@/hooks/useContentLocale';
import { topics } from '@/lib/content';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { SphereFallback } from './SphereFallback';

// The WebGL sphere is client-only and heavy — load it lazily.
const ThreeSphere = dynamic(
  () => import('./ThreeSphere').then((m) => m.ThreeSphere),
  { ssr: false },
);

interface SphereNavigationProps {
  onSelect: (id: string) => void;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  /** Currently opened topic (kept highlighted while content shows below). */
  activeId?: string | null;
  /** Shrinks the sphere when a topic is open and content is shown below. */
  compact?: boolean;
}

export function SphereNavigation({
  onSelect,
  onHover,
  activeId = null,
  compact = false,
}: SphereNavigationProps) {
  const { locale } = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const isCompactViewport = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Reduced-motion: render the accessible grouped fallback instead of WebGL.
  if (reducedMotion) {
    return <SphereFallback onSelect={onSelect} />;
  }

  // Responsive square canvas; shrink when a topic is open.
  // Base sizes bumped +20% per request.
  const base = isCompactViewport ? 408 : isTablet ? 552 : 672;
  const size = compact ? Math.round(base * 0.64) : base;

  return (
    <div
      className="relative mx-auto"
      style={{
        width: size,
        height: size,
        maxWidth: '100%',
        transition:
          'width 0.6s cubic-bezier(0.22,1,0.36,1), height 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      <ThreeSphere
        topics={topics}
        locale={contentLocaleFor(locale)}
        activeId={activeId}
        onSelect={onSelect}
        onHover={onHover}
        autoRotate
        autoRotateSpeed={0.9}
        showConnections
        theme="dark"
        showBackground={false}
      />
    </div>
  );
}
