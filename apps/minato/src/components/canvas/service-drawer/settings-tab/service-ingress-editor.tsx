import type { IngressRule } from '@mizu/nagare-domain'
import { IconPlus, IconX } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { instanceSettingsQueries } from '@/shared/api'
import { type ServiceIngressEditorProps, sanitizeResourceName, useIngressRules } from '../lib'

/**
 * Manual public ingress editor. Each rule maps a chosen service port to a
 * public host — a subdomain of the instance domain (wildcard-covered) or a full
 * custom FQDN (its own cert). Any rule overrides the auto-derived ingress host.
 */
export function ServiceIngressEditor({
  rules,
  ports,
  running,
  autoUrl,
  onChange,
}: ServiceIngressEditorProps) {
  const { data: settings } = useQuery(instanceSettingsQueries.get())
  const baseDomain = settings?.domain || 'localhost'
  const { port, setPort, hostType, setHostType, host, setHost, canAdd, addRule, removeRule } =
    useIngressRules({ ports, rules, onChange })

  const ruleHost = (rule: IngressRule): string =>
    rule.hostType === 'subdomain' ? `${sanitizeResourceName(rule.host)}.${baseDomain}` : rule.host

  const ruleUrl = (rule: IngressRule): string => {
    const scheme = rule.hostType === 'custom' || baseDomain !== 'localhost' ? 'https' : 'http'
    return `${scheme}://${ruleHost(rule)}`
  }

  return (
    <div className="space-y-2">
      {rules.length > 0 ? (
        <div className="space-y-1">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px]"
            >
              {running ? (
                <a
                  href={ruleUrl(rule)}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-primary transition-colors hover:text-primary/80"
                >
                  {ruleHost(rule)}
                </a>
              ) : (
                <span className="truncate text-primary/60">{ruleHost(rule)}</span>
              )}
              <span className="shrink-0 text-muted-foreground">:{rule.port}</span>
              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                className="ml-auto shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="remove ingress rule"
              >
                <IconX className="size-3" />
              </button>
            </div>
          ))}
        </div>
      ) : autoUrl ? (
        <a
          href={autoUrl}
          target="_blank"
          rel="noreferrer"
          className="block truncate rounded-md border border-primary/20 bg-primary/5 px-2 py-1 font-mono text-[11px] text-primary transition-colors hover:border-primary/40 hover:text-primary/80"
        >
          {autoUrl}
        </a>
      ) : (
        <div className="text-[11px] text-muted-foreground">Not exposed</div>
      )}

      {/* Add rule */}
      <div className="space-y-1.5 rounded-md border border-border bg-background/60 p-2">
        <div className="flex items-center gap-1.5">
          {ports.length > 0 ? (
            <select
              value={port}
              onChange={(e) => setPort(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-foreground focus:border-primary/50 focus:outline-none"
            >
              {ports.map((p) => (
                <option key={p} value={p}>
                  :{p}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              value={port || ''}
              onChange={(e) => setPort(Number(e.target.value))}
              placeholder="port"
              className="w-16 rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-foreground focus:border-primary/50 focus:outline-none"
            />
          )}
          <div className="flex overflow-hidden rounded-md border border-border">
            {(['subdomain', 'custom'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setHostType(type)}
                className={cn(
                  'px-1.5 py-1 text-[10px] transition-colors',
                  hostType === type
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {type === 'subdomain' ? 'sub' : 'custom'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addRule()
            }}
            placeholder={hostType === 'subdomain' ? 'api' : 'api.example.com'}
            maxLength={253}
            className="min-w-0 flex-1 rounded-md border border-border bg-background px-1.5 py-1 font-mono text-[11px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none"
          />
          {hostType === 'subdomain' && (
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
              .{baseDomain}
            </span>
          )}
          <button
            type="button"
            onClick={addRule}
            disabled={!canAdd}
            className="shrink-0 rounded-md border border-border bg-background p-1 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-40"
            aria-label="add ingress rule"
          >
            <IconPlus className="size-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
