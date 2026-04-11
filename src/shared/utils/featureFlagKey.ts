/**
 * Backend-aligned feature flag key: dot-separated segments, lowercase only.
 * First segment: letters and digits only. Later segments: letters, digits, underscores.
 * Examples: checkout.new_flow, machine.enabled_to_update_machine_status, product.pricing.v2
 */
export const FEATURE_FLAG_KEY_PATTERN = /^[a-z][a-z0-9]*(\.[a-z0-9_]+)*$/;

export type FeatureFlagKeyValidationFailure = 'required' | 'format';

export type FeatureFlagKeyValidationResult =
  | { valid: true }
  | { valid: false; reason: FeatureFlagKeyValidationFailure };

export function normalizeFeatureFlagKey(value: string | undefined | null): string {
  return (value ?? '').trim();
}

export function validateFeatureFlagKey(value: string | undefined | null): FeatureFlagKeyValidationResult {
  const key = normalizeFeatureFlagKey(value);
  if (!key) {
    return { valid: false, reason: 'required' };
  }
  if (!FEATURE_FLAG_KEY_PATTERN.test(key)) {
    return { valid: false, reason: 'format' };
  }
  return { valid: true };
}

export function isValidFeatureFlagKey(value: string | undefined | null): boolean {
  return validateFeatureFlagKey(value).valid;
}
