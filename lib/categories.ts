import {
  Heart,
  Users,
  Sprout,
  Briefcase,
  Brain,
  Globe,
  Activity,
  Moon,
  type LucideIcon,
} from 'lucide-react';

/**
 * Visual metadata for each category. The knowledge base defines the
 * canonical category ids; this map attaches an icon and a subtle hue
 * offset used to differentiate topic clusters on the sphere.
 *
 * Hues are kept within a warm, gold-adjacent range so the palette stays
 * calm and cohesive per the brief (gold is the single accent).
 */
export interface CategoryVisual {
  icon: LucideIcon;
  /** HSL hue used for the node's subtle tint (kept warm / restrained). */
  hue: number;
}

export const CATEGORY_VISUALS: Record<string, CategoryVisual> = {
  family: { icon: Heart, hue: 42 },
  relationships: { icon: Users, hue: 38 },
  'personal-development': { icon: Sprout, hue: 46 },
  'work-success': { icon: Briefcase, hue: 40 },
  'mental-wellbeing': { icon: Brain, hue: 44 },
  society: { icon: Globe, hue: 36 },
  health: { icon: Activity, hue: 48 },
  spirituality: { icon: Moon, hue: 43 },
};

export function getCategoryVisual(categoryId: string): CategoryVisual {
  return CATEGORY_VISUALS[categoryId] ?? { icon: Sprout, hue: 42 };
}
