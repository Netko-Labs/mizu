import { useCallback, useEffect, useRef } from 'react'

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const loop = (t: number) => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      draw(ctx, rect.width, rect.height, t)
      frameRef.current = requestAnimationFrame(loop)
    }

    frameRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [draw])

  return canvasRef
}

function RippleGrid() {
  const ripples = useRef<{ x: number; y: number; birth: number }[]>([])

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const spacing = 24
    const time = t * 0.001

    // Spawn ripples
    if (Math.random() < 0.015) {
      ripples.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        birth: time,
      })
    }

    // Remove old ripples
    ripples.current = ripples.current.filter((r) => time - r.birth < 4)

    for (let x = spacing; x < w; x += spacing) {
      for (let y = spacing; y < h; y += spacing) {
        let displacement = 0

        for (const ripple of ripples.current) {
          const dx = x - ripple.x
          const dy = y - ripple.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const age = time - ripple.birth
          const wave =
            Math.sin(dist * 0.08 - age * 4) * Math.exp(-age * 0.8) * Math.exp(-dist * 0.004)
          displacement += wave
        }

        const size = 1.5 + displacement * 2
        const alpha = 0.15 + displacement * 0.3

        if (alpha > 0.05) {
          ctx.beginPath()
          ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2)
          if (displacement > 0.3) {
            ctx.fillStyle = `rgba(96, 165, 250, ${Math.min(0.6, alpha)})`
          } else {
            ctx.fillStyle = `rgba(115, 115, 115, ${Math.min(0.4, alpha)})`
          }
          ctx.fill()
        }
      }
    }
  }, [])

  const ref = useCanvas(draw)
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />
}

export function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <RippleGrid />
    </div>
  )
}
