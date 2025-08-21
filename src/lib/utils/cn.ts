/**
 * Tailwind CSS Utility Functions
 * 
 * This file contains utilities for working with Tailwind CSS classes.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine and merge Tailwind CSS classes
 * This is the standard utility function used in shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
