import { useContext } from 'react'
import { CommandPaletteContext } from '../../command-palette-provider'

/**
 * Hook to access the command palette context.
 */
export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)

  if (!context) {
    throw new Error('useCommandPalette must be used within a CommandPaletteProvider')
  }

  return context
}
