import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

type Option = { value: 'light' | 'dark' | 'system'; icon: React.ElementType; label: string }

const OPTIONS: Option[] = [
  { value: 'light',  icon: Sun,     label: 'Light'  },
  { value: 'dark',   icon: Moon,    label: 'Dark'   },
  { value: 'system', icon: Monitor, label: 'System' },
]

interface ThemeToggleProps {
  /** 'icon' shows only the current icon, toggling light→dark→system on click (compact, for headers).
   *  'segmented' shows three buttons side-by-side (for settings/profile). */
  variant?: 'icon' | 'segmented'
}

export default function ThemeToggle({ variant = 'segmented' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  if (variant === 'icon') {
    const cycle = () => {
      const order: typeof theme[] = ['light', 'dark', 'system']
      const next = order[(order.indexOf(theme) + 1) % order.length]
      setTheme(next)
    }
    const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
    return (
      <button
        type="button"
        onClick={cycle}
        className="iconbtn tap"
        aria-label={`Theme: ${theme}. Click to change.`}
        title={`Theme: ${theme}`}
      >
        <Icon style={{ width: 20, height: 20 }} />
      </button>
    )
  }

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex p-1 rounded-xl gap-1"
      style={{ background: 'var(--muted)' }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = theme === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={active}
            title={label}
            className="tap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center"
            style={{
              background: active ? 'var(--background)' : 'transparent',
              color: active ? 'var(--foreground)' : 'var(--muted-foreground)',
              boxShadow: active ? 'var(--shadow-xs)' : 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <Icon style={{ width: 14, height: 14, flexShrink: 0 }} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
