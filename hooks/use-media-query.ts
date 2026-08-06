"use client"

import * as React from "react"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    const onChange = (event: MediaQueryListEvent) => setValue(event.matches)
    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    setValue(result.matches)
    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}

export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)")
}

export function useCountUp(target: number, duration = 1800, decimals = 0) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setValue(target * eased)
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [target, duration])

  const formatted = React.useMemo(() => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }, [value, decimals])

  return { ref, value, formatted }
}
