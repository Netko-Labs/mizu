import { useCallback, useEffect, useRef, useState } from 'react'
import type { UseEditablePropertyOptions, UseEditablePropertyResult } from '../types'

export function useEditableProperty({
  value,
  onSave,
}: UseEditablePropertyOptions): UseEditablePropertyResult {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleSave = useCallback(() => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== value) {
      onSave(trimmed)
    }
    setEditing(false)
  }, [draft, value, onSave])

  const startEditing = useCallback(() => {
    setDraft(value)
    setEditing(true)
  }, [value])

  const cancelEditing = useCallback(() => {
    setDraft(value)
    setEditing(false)
  }, [value])

  return { editing, draft, setDraft, inputRef, handleSave, startEditing, cancelEditing }
}
