import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWeight(weightInTons: number, weightUnit: "KILOGRAMS" | "TONS" | string) {
  if (weightUnit === "KILOGRAMS") {
    const kg = weightInTons * 1000;
    return `${kg.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg`;
  }
  return `${weightInTons.toLocaleString(undefined, { maximumFractionDigits: 2 })} Tons`;
}

export function convertWeightToDisplay(weightInTons: number, weightUnit: "KILOGRAMS" | "TONS" | string) {
  if (weightUnit === "KILOGRAMS") {
    return weightInTons * 1000;
  }
  return weightInTons;
}

export function convertWeightToStorage(displayWeight: number, weightUnit: "KILOGRAMS" | "TONS" | string) {
  if (weightUnit === "KILOGRAMS") {
    return displayWeight / 1000;
  }
  return displayWeight;
}
