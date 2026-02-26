/**
 * Plan-based feature permissions.
 * Single source of truth - mirrors backend plan_access.py
 */

export type PlanType = 'starter' | 'professional' | 'business';
export type FeatureType = 'voiceCoach' | 'vlm' | 'createPost';

export const PLAN_FEATURES: Record<PlanType, Record<FeatureType, boolean>> = {
  starter: {
    voiceCoach: false,
    vlm: false,
    createPost: false,
  },
  professional: {
    voiceCoach: true,
    vlm: false,
    createPost: false,
  },
  business: {
    voiceCoach: true,
    vlm: true,
    createPost: true,
  },
};

export const PLAN_DISPLAY_NAMES: Record<PlanType, string> = {
  starter: 'Starter',
  professional: 'Professional',
  business: 'Business',
};

export const PLAN_PRICES: Record<PlanType, { amount: number; period: string }> = {
  starter: { amount: 0, period: 'forever' },
  professional: { amount: 399, period: 'month' },
  business: { amount: 799, period: 'month' },
};

/**
 * Check if a user can access a feature based on plan and role.
 * Developers bypass all restrictions.
 */
export function canAccessFeature(
  plan: string | null | undefined,
  role: string | null | undefined,
  feature: FeatureType
): boolean {
  if (role === 'developer') return true;
  const planKey = (plan || 'starter') as PlanType;
  return PLAN_FEATURES[planKey]?.[feature] ?? false;
}

/**
 * Get the minimum plan required to access a feature.
 */
export function getRequiredPlan(feature: FeatureType): PlanType {
  if (PLAN_FEATURES.starter[feature]) return 'starter';
  if (PLAN_FEATURES.professional[feature]) return 'professional';
  return 'business';
}

/**
 * Map route paths to feature keys for access control.
 */
export const ROUTE_FEATURES: Record<string, FeatureType | null> = {
  '/voice-coach': 'voiceCoach',
  '/hook-detector': 'vlm',
  '/analytics': null, // All plans
  '/performance': null, // All plans
  '/audience': null, // All plans
  '/dashboard': null, // All plans
  '/settings': null, // All plans
};

/**
 * Sidebar items configuration with lock info.
 */
export const SIDEBAR_ITEMS = [
  { label: 'Overview', href: '/dashboard', feature: null },
  { label: 'Analytics', href: '/analytics', feature: null },
  { label: 'Performance', href: '/performance', feature: null },
  { label: 'Audience', href: '/audience', feature: null },
  { label: 'Voice Coach', href: '/voice-coach', feature: 'voiceCoach' as FeatureType },
  { label: 'Hook Detector', href: '/hook-detector', feature: 'vlm' as FeatureType },
  { label: 'Settings', href: '/settings', feature: null },
];
