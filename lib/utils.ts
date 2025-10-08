import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Updated: October 7, 2025 - Panna.ai v2.0.0

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
