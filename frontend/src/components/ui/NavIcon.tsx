import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavIconProps {
  icon: LucideIcon
  isActive?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  activeClassName?: string
  inactiveClassName?: string
}

const sizeMap = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
}

/**
 * NavIcon - Composant d'icône de navigation premium avec Lucide
 *
 * Utilise des icônes SVG professionnelles au lieu d'emojis pour:
 * - Consistance visuelle entre tous les appareils
 * - Contrôle total des couleurs et tailles
 * - Animations fluides et modernes
 * - Aspect premium et professionnel
 */
export function NavIcon({
  icon: Icon,
  isActive = false,
  size = 'md',
  className,
  activeClassName = 'text-primary-600',
  inactiveClassName = 'text-gray-500',
}: NavIconProps) {
  return (
    <Icon
      className={cn(
        sizeMap[size],
        'transition-all duration-200 ease-out',
        isActive ? activeClassName : inactiveClassName,
        isActive && 'scale-110',
        className
      )}
      strokeWidth={isActive ? 2.5 : 2}
    />
  )
}

/**
 * IconBox - Conteneur d'icône avec fond gradient
 * Pour les icônes plus proéminentes dans les cartes/sections
 */
interface IconBoxProps {
  icon: LucideIcon
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'cyan'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const variantStyles = {
  primary: 'from-primary-500 to-emerald-500 text-white',
  success: 'from-green-500 to-emerald-500 text-white',
  warning: 'from-amber-500 to-orange-500 text-white',
  danger: 'from-red-500 to-rose-500 text-white',
  info: 'from-blue-500 to-cyan-500 text-white',
  purple: 'from-purple-500 to-indigo-500 text-white',
  orange: 'from-orange-500 to-amber-500 text-white',
  cyan: 'from-cyan-500 to-sky-500 text-white',
}

const boxSizeMap = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-10 h-10 rounded-xl',
  lg: 'w-12 h-12 rounded-xl',
  xl: 'w-14 h-14 rounded-2xl',
}

const iconBoxSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-7 h-7',
}

export function IconBox({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className,
}: IconBoxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br shadow-lg',
        variantStyles[variant],
        boxSizeMap[size],
        className
      )}
    >
      <Icon className={cn(iconBoxSizeMap[size], 'drop-shadow-sm')} strokeWidth={2} />
    </div>
  )
}
