import { motion } from 'motion/react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { SettingsTab } from './lib'
import { SETTINGS_TABS, useInstanceSettingsForm } from './lib'
import { SettingsAccessTab } from './settings-access-tab'
import { SettingsIngressTab } from './settings-ingress-tab'
import { SettingsInstanceTab } from './settings-instance-tab'
import { SettingsTeamTab } from './settings-team-tab'

export function SettingsPage() {
  const { form, feedback, stats, isDirty, isLoadingSettings, isSaving, updateField, handleSave } =
    useInstanceSettingsForm()
  const [activeTab, setActiveTab] = useState<SettingsTab>('instance')

  if (isLoadingSettings) {
    return (
      <div className="relative min-h-screen bg-black font-mono">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />
        <div className="relative mx-auto max-w-3xl space-y-6 px-6 py-8">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-800" />
          <div className="h-8 w-64 animate-pulse rounded bg-neutral-900" />
          <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
          <div className="h-48 animate-pulse rounded-lg bg-neutral-900" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black font-mono">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-neutral-950 via-black to-black" />

      <div className="relative mx-auto max-w-3xl px-6 py-8">
        <motion.header
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6 flex items-end justify-between gap-4"
        >
          <div>
            <div className="text-xs text-neutral-600">$ mizu config</div>
            <h1 className="mt-2 text-xl text-white">settings</h1>
          </div>

          <div className="flex items-center gap-3">
            {feedback && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  feedback.type === 'success'
                    ? 'text-[11px] text-green-500'
                    : 'text-[11px] text-red-500'
                }
              >
                {feedback.type === 'success' ? '✓' : '✗'} {feedback.message}
              </motion.span>
            )}
            {isDirty && !feedback && (
              <span className="text-[11px] text-neutral-600">unsaved changes</span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
              className={cn(
                'rounded border px-4 py-1.5 font-mono text-xs transition-all',
                isDirty
                  ? 'border-blue-500/50 bg-black text-white hover:border-blue-500'
                  : 'border-neutral-800 bg-black text-neutral-600',
                'disabled:cursor-not-allowed',
                isSaving && 'opacity-60',
              )}
            >
              {isSaving ? '$ saving...' : '$ save'}
            </button>
          </div>
        </motion.header>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6 flex gap-6 border-b border-neutral-800"
        >
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                '-mb-px border-b-2 pb-2 text-[11px] transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-600 hover:text-neutral-400',
              )}
            >
              {tab.label}
            </button>
          ))}
        </motion.nav>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'instance' && (
            <SettingsInstanceTab form={form} updateField={updateField} stats={stats} />
          )}
          {activeTab === 'ingress' && (
            <SettingsIngressTab form={form} updateField={updateField} stats={stats} />
          )}
          {activeTab === 'access' && <SettingsAccessTab form={form} updateField={updateField} />}
          {activeTab === 'team' && <SettingsTeamTab />}
        </motion.div>
      </div>
    </div>
  )
}
