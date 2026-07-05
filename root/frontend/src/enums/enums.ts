export const ENUM_USER_ROLE = {
  STUDENT: 1,
  ADMIN: 2,
} as const;

export type ENUM_USER_ROLE = (typeof ENUM_USER_ROLE)[keyof typeof ENUM_USER_ROLE];