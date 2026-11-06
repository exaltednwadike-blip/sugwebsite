export const EXECUTIVE_OFFICES = [
  { value: 'president', label: 'President' },
  { value: 'vice_president', label: 'Vice President' },
  { value: 'general_secretary', label: 'General Secretary' },
  { value: 'financial_secretary', label: 'Financial Secretary' },
  { value: 'treasurer', label: 'Treasurer' },
  { value: 'director_games', label: 'Director of Games' },
  { value: 'director_welfare', label: 'Director of Welfare' },
  { value: 'pro', label: 'PRO' },
  { value: 'assistant_secretary_general', label: 'Assistant Secretary General' },
] as const

export const HOUSE_OFFICES = [
  { value: 'speaker', label: 'Speaker' },
  { value: 'deputy_speaker', label: 'Deputy Speaker' },
  { value: 'clerk', label: 'Clerk' },
  { value: 'house_member', label: 'House Member' },
] as const

export const ALL_OFFICES = [...EXECUTIVE_OFFICES, ...HOUSE_OFFICES]

export function officeLabel(value: string): string {
  return ALL_OFFICES.find((o) => o.value === value)?.label ?? value
}

export function isHouseOffice(value: string | null | undefined): boolean {
  return HOUSE_OFFICES.some((o) => o.value === value)
}

export function officeRank(value: string | null | undefined): number {
  const index = ALL_OFFICES.findIndex((o) => o.value === value)
  return index === -1 ? 999 : index
}