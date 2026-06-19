import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  theme?: 'light' | 'dark'
  className?: string
  titleClassName?: string
  brand?: 'bgts' | 'ekohaul'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  theme = 'light',
  className,
  titleClassName,
  brand = 'bgts',
}: SectionHeadingProps) {
  const alignClass = {
    left:   'text-left',
    center: 'text-center mx-auto',
    right:  'text-right ml-auto',
  }[align]

  const eyebrowColor = brand === 'ekohaul' ? 'text-eko' : 'text-brand'
  const titleColor   = theme === 'dark' ? 'text-white' : 'text-ink-strong'
  const subtitleColor = theme === 'dark' ? 'text-white/70' : 'text-ink-muted'

  return (
    <div className={cn('max-w-2xl', alignClass, className)}>
      {eyebrow && (
        <p className={cn('eyebrow mb-3', eyebrowColor)}>{eyebrow}</p>
      )}
      <h2
        className={cn(
          'font-display font-extrabold text-4xl md:text-5xl leading-tight tracking-tight',
          titleColor,
          titleClassName
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 text-lg leading-relaxed', subtitleColor)}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
