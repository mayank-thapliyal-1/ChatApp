import { type ClassValue, clsx } from "clsx";

/**
 * Merge class names with clsx (e.g. for Tailwind). Can be extended with tailwind-merge later.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
