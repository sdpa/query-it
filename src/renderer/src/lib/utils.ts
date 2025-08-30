import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { AllDBConfigs } from '../../../backend/db/types'
import { FieldConfig } from '@renderer/components/types'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export const createDatabaseConfigs = <
  T extends { [K in keyof AllDBConfigs]: Record<keyof AllDBConfigs[K], FieldConfig> }
>(
  config: T
) => config
