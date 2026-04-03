type Tone = 'default' | 'accent' | 'warm'

type BadgeProps = {
  label: string
  tone?: Tone
}

type ChipProps = {
  label: string
  tone?: Tone
}

const toneClassByType: Record<Tone, string> = {
  default: '',
  accent: ' badge-tone-accent',
  warm: ' badge-tone-warm'
}

const toneClassByChip: Record<Tone, string> = {
  default: '',
  accent: ' chip-tone-accent',
  warm: ' chip-tone-warm'
}

export const Badge = ({ label, tone = 'default' }: BadgeProps) => {
  return <span className={`badge${toneClassByType[tone]}`.trim()}>{label}</span>
}

export const Chip = ({ label, tone = 'default' }: ChipProps) => {
  return <span className={`chip${toneClassByChip[tone]}`.trim()}>{label}</span>
}
