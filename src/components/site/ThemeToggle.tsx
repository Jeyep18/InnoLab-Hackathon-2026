import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useTheme } from '@/lib/theme'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {/* Shows the mode you would switch to. */}
          <Moon className="size-[18px] scale-100 rotate-0 transition-transform duration-300 ease-out dark:scale-0 dark:-rotate-90" />
          <Sun className="absolute size-[18px] scale-0 rotate-90 transition-transform duration-300 ease-out dark:scale-100 dark:rotate-0" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
