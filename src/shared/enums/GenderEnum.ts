export const GenderEnum = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

export type GenderEnum = typeof GenderEnum[keyof typeof GenderEnum];
