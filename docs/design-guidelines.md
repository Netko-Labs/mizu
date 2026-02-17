# Mizu Design Guidelines

Reference for the visual language and component patterns used across Mizu's interface.
Every new component, page, or feature should follow these conventions to maintain cohesion.

---

## Philosophy

- **True black, Vercel aesthetic** — Pure `#000` backgrounds, neutral grays with zero color hue, blue accents.
- **Terminal personality** — Monospace type, `$` prompts, `#` section headers, `▸` list markers, macOS window chrome.
- **Restrained color** — Most of the UI is grayscale. Color appears only when it carries meaning (active state, status, accent).
- **Motion with purpose** — Staggered entrance animations and spring-based layout transitions. No gratuitous effects.

---

## Color Palette

### Backgrounds

| Token | Tailwind | Use |
|-------|----------|-----|
| True black | `bg-black` | Page backgrounds, sidebar, header, inputs |
| Near-black | `bg-neutral-950` | Cards, terminal windows, elevated surfaces |
| Dark gray | `bg-neutral-900` | Hover states on cards/buttons (sparingly) |
| Border gray | `bg-neutral-800` | Divider lines (`h-px`), pulse placeholders |

### Text Hierarchy

| Token | Tailwind | Use |
|-------|----------|-----|
| Primary | `text-white` | Headings, emphasized values, user name |
| Secondary | `text-neutral-300` | Nav item labels (active hover), links |
| Tertiary | `text-neutral-400` | Stat values, body text, descriptions |
| Muted | `text-neutral-500` | Inactive nav items, secondary labels |
| Subtle | `text-neutral-600` | Timestamps, metadata, decorative text |
| Decorative | `text-neutral-700` | `$` prompts, `#` headers, `▸` markers |

### Accent & Status

| Token | Tailwind | Use |
|-------|----------|-----|
| Blue (primary) | `text-blue-500` / `bg-blue-600` | Active indicator, links, CTA buttons |
| Green | `text-green-600` | Online / success status |
| Yellow | `text-yellow-500` | Warnings (`! no workspace`) |
| Red | `text-red-500` | Destructive actions, errors |

### Borders

| Token | Tailwind | Use |
|-------|----------|-----|
| Default | `border-neutral-800` | Cards, inputs, sidebar edge, dividers |
| Hover | `border-neutral-700` | Interactive element hover state |

**Rule:** Borders are always `neutral-800` at rest. On hover they lighten to `neutral-700`. Never use colored borders except for the blue active indicator.

---

## Typography

### Fonts

| Context | Class | Notes |
|---------|-------|-------|
| Terminal UI | `font-mono` | Sidebar, home dashboard, terminal cards, nav items |
| Content pages | `font-sans` | Forms, dialogs, project pages (Nunito Sans Variable) |

### Scale

| Size | Class | Use |
|------|-------|-----|
| 9px | `text-[9px]` | Version badges |
| 10px | `text-[10px]` | Section headers (`# quick`), metadata, small labels |
| 11px | `text-[11px]` | Terminal card titles (window chrome) |
| 12px | `text-xs` | **Default UI text** — nav items, stat labels, buttons |
| 14px | `text-sm` | Form labels, dialog descriptions |
| 16px | `text-base` | Card titles |
| 20px | `text-xl` | Page headings |
| 24px | `text-2xl` | Large stat numbers |
| 30px | `text-3xl` | Hero stat numbers |

### Weight

| Weight | Class | Use |
|--------|-------|-----|
| Regular | (default) | Most text |
| Medium | `font-medium` | Nav items, labels, small headings |
| Bold | `font-bold` | Stat numbers |

---

## Terminal Patterns

These are the core visual signatures that give Mizu its identity.

### Window Chrome (macOS Dots)

Used in `TerminalCard` headers. Dots are neutral-800 at rest, animate to traffic light colors on group hover.

```tsx
<div className="flex gap-1.5">
  <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-red-500" />
  <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-yellow-500" />
  <div className="h-2.5 w-2.5 rounded-full bg-neutral-800 transition-colors group-hover:bg-green-500" />
</div>
```

### Shell Prompt Prefix

Navigation items and commands are prefixed with `$` in `text-neutral-700`. Hidden when sidebar is collapsed.

```tsx
{!collapsed && <span className="mr-1 text-neutral-700">$</span>}
```

### Section Headers

Use `#` prefix like code comments. Always `text-[10px] text-neutral-700`.

```tsx
<div className="mb-2 px-4 text-[10px] text-neutral-700"># navigation</div>
```

### List Marker

Use `▸` for stat/property lines. Always `text-neutral-700`.

```tsx
<span className="text-neutral-700">▸</span>
<span className="text-neutral-600">{label}:</span>
<span className="text-neutral-400">{value}</span>
```

### Command Simulation

Display simulated shell commands as contextual labels.

```tsx
<div className="text-xs text-neutral-600">$ ls -la | head -4</div>
```

### Blinking Cursor

Used next to the brand name. Infinite opacity animation.

```tsx
<motion.span
  className="text-neutral-600"
  animate={{ opacity: [1, 0, 1] }}
  transition={{ duration: 1, repeat: Infinity }}
>
  _
</motion.span>
```

---

## Component Patterns

### TerminalCard

The primary container for dashboard content. Combines window chrome with a content area.

```
+----------------------------------------------+
| [o] [o] [o]   title.label                    |  <- border-b border-neutral-800
|                                               |
|  Content area (p-5)                           |
|                                               |
+----------------------------------------------+
```

- Outer: `rounded-lg border border-neutral-800 bg-neutral-950 font-mono`
- Header: `flex items-center gap-2 border-b border-neutral-800 px-4 py-2.5`
- Title: `text-[11px] text-neutral-600`
- Content: `relative p-5`
- Entrance animation: `opacity: 0, y: 10` -> `opacity: 1, y: 0` with stagger delay

### NavItem

Sidebar navigation item with terminal aesthetic.

- Inactive: `text-neutral-500 hover:bg-neutral-950 hover:text-neutral-300`
- Active: `bg-neutral-950 text-white` + blue indicator bar
- Icon: `size-4`, `text-neutral-600` (inactive) / `text-blue-500` (active)
- Command shortcut: `text-[10px] text-neutral-700` on the right side

Active indicator (animated blue bar):
```tsx
<motion.div
  layoutId="nav-indicator"
  className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-blue-500"
  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
/>
```

### UserMenu

Bottom-of-sidebar user section with dropdown.

- Trigger: `rounded-lg border border-neutral-800 bg-black` with `hover:border-neutral-700 hover:bg-neutral-950`
- Avatar: `rounded-lg ring-1 ring-neutral-800` with `bg-neutral-800` fallback
- Dropdown: `bg-black border-neutral-800 font-mono`
- Items: `text-xs text-neutral-500 focus:bg-neutral-950 focus:text-neutral-300`
- Destructive item: `text-red-500 focus:bg-red-500/10 focus:text-red-400`

### WorkspaceSwitcher

Styled identically to other sidebar controls.

- Trigger: `rounded-lg border border-neutral-800 bg-black px-2.5 py-2 font-mono`
- Badge icon: `size-6 rounded border border-neutral-800 bg-neutral-950 text-[10px] text-blue-500`
- Dropdown header: `text-[10px] text-neutral-600` with `# workspaces` label

---

## Motion & Animation

### Entrance Animations

Use `motion/react` (Framer Motion). Stagger delays for sequential elements.

```tsx
// Fade up (default for cards)
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, delay }}

// Slide in from left (list items)
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.3, delay }}
```

**Stagger pattern:** Start at `delay={0.1}`, increment by `0.05` per item.

### Layout Animations

Use `layoutId` for shared element transitions (e.g., nav indicator bar).

```tsx
transition={{ type: 'spring', stiffness: 500, damping: 30 }}
```

### Progress Bars

Animate from zero to target width with a longer delay.

```tsx
initial={{ width: 0 }}
animate={{ width: `${percentage}%` }}
transition={{ duration: 1, delay: 0.4 }}
```

### Hover Micro-interactions

Prefer Tailwind `transition-*` classes over Motion for simple hovers.

- `transition-all duration-200` — General purpose
- `transition-colors` — Color-only changes
- `transition-transform` — Movement/scale
- `group-hover:translate-x-0.5` — Chevron nudge on card hover

---

## Spacing

### Standard Gaps

| Gap | Use |
|-----|-----|
| `gap-1.5` | Window chrome dots, tight icon groups |
| `gap-2` | Nav items, stat lines, inline elements |
| `gap-3` | Card content, flex rows |
| `gap-4` | Grid cells, section spacing |
| `gap-6` | Page sections |

### Standard Padding

| Padding | Use |
|---------|-----|
| `px-1.5 py-0.5` | Badges, version chips |
| `p-2` | Compact controls (sidebar items) |
| `p-3` | Card padding, footer |
| `px-4 py-2.5` | Terminal card headers |
| `p-5` | Terminal card content |
| `px-6 py-8` | Page-level content padding |

### Border Radius

| Radius | Use |
|--------|-----|
| `rounded-full` | Dots, avatars, pill badges |
| `rounded-xl` | Brand icon, large containers |
| `rounded-lg` | Cards, buttons, inputs, nav items |
| `rounded` | Small elements, badges |

---

## Skeleton & Loading States

Use `animate-pulse` with `bg-neutral-800` shapes matching the content layout.

```tsx
// Text placeholder
<div className="h-3 w-16 animate-pulse rounded bg-neutral-800" />

// Avatar placeholder
<div className="size-8 animate-pulse rounded-lg bg-neutral-800" />

// Card placeholder
<Skeleton className="h-36 rounded-lg border border-neutral-800 bg-neutral-950" />
```

---

## Buttons

### Primary Action
```tsx
className="bg-blue-600 font-mono text-white hover:bg-blue-500"
```

### Secondary / Cancel
```tsx
className="border-neutral-800 bg-black font-mono text-neutral-400 hover:bg-neutral-900 hover:text-white"
```

### Ghost (Sidebar / Toolbar)
Transparent background, text-only with hover state.

### Keyboard Shortcut Badge
```tsx
<kbd className="rounded border border-neutral-800 bg-black px-1 py-0.5 text-[10px] text-neutral-600">
  ⌘K
</kbd>
```

---

## Dialogs & Dropdowns

- Container: `border-neutral-800 bg-neutral-950 font-mono` (dialogs) or `bg-black` (dropdowns)
- Section headers inside dropdowns: `text-[10px] text-neutral-600` with `# label` format
- Separator: `bg-neutral-800`
- Focus state on items: `focus:bg-neutral-950 focus:text-neutral-300`

---

## Header Bar

- Height: `h-12`
- Background: `bg-black/80 backdrop-blur-sm`
- Border: `border-b border-neutral-800`
- Font: `font-mono`
- Trigger icon: `text-neutral-600 hover:text-neutral-400`

---

## CSS Variables (Dark Mode)

All dark-mode colors use `oklch` with **zero chroma** (pure neutrals — no blue/teal tint).

```css
--background: oklch(0 0 0);        /* True black */
--card: oklch(0.065 0 0);          /* Near-black cards */
--border: oklch(0.2 0 0);          /* Neutral gray borders */
--muted: oklch(0.15 0 0);          /* Muted backgrounds */
--muted-foreground: oklch(0.55 0 0); /* Muted text */
--sidebar: oklch(0 0 0);           /* True black sidebar */
--sidebar-accent: oklch(0.1 0 0);  /* Sidebar hover */
--sidebar-border: oklch(0.2 0 0);  /* Sidebar border */
--primary: oklch(0.65 0.17 250);   /* Blue accent */
```

**Key rule:** Gray tones must always have chroma `0`. This prevents the blue/green tint that breaks the Vercel aesthetic.

---

## Do / Don't

| Do | Don't |
|----|-------|
| Use `bg-black` for backgrounds | Use `bg-gray-900`, `bg-slate-900` (tinted) |
| Use `neutral-*` for all grays | Use `zinc-*`, `slate-*`, `gray-*` (tinted) |
| Use `text-blue-500` for accents | Use purple, cyan, or teal accents |
| Use `font-mono` in terminal contexts | Use `font-mono` for everything |
| Use `border-neutral-800` at rest | Use colored or varying border shades |
| Animate entrances with stagger | Add bouncy or flashy animations |
| Keep text at `text-xs` baseline | Use `text-base` or larger for UI chrome |
| Use `$`, `#`, `▸` terminal markers | Invent new decorative prefixes |
| Let color carry meaning | Use color decoratively |
