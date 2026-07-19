import type { IngressRule } from '@mizu/nagare-domain'
import { useState } from 'react'
import type { UseIngressRulesOptions, UseIngressRulesResult } from '../types'

/**
 * Local draft state for the "add ingress rule" form. Committed rules live on
 * the service (server) — add/remove emit the next full array via `onChange`.
 */
export function useIngressRules({
  ports,
  rules,
  onChange,
}: UseIngressRulesOptions): UseIngressRulesResult {
  const [port, setPort] = useState<number>(ports[0] ?? 80)
  const [hostType, setHostType] = useState<IngressRule['hostType']>('subdomain')
  const [host, setHost] = useState('')

  const trimmed = host.trim().toLowerCase()
  const canAdd = trimmed.length > 0 && port > 0

  const addRule = () => {
    if (!canAdd) return
    const rule: IngressRule = { id: crypto.randomUUID(), port, hostType, host: trimmed }
    onChange([...rules, rule])
    setHost('')
  }

  const removeRule = (id: string) => onChange(rules.filter((rule) => rule.id !== id))

  return { port, setPort, hostType, setHostType, host, setHost, canAdd, addRule, removeRule }
}
