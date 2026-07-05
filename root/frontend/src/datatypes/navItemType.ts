import type { LucideIcon } from "lucide-react";


export type NavbarItem = {
  dashboard: { label: string, to: string },
  profile: { label: string, to: string },
  settings: { label: string, to: string },
  signOut: { label: string, to: string },
}

export type NavItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
  to: string
};
