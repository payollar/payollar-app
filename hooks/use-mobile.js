import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with a safe default (assume desktop initially to avoid hydration issues)
  const [isMobile, setIsMobile] = React.useState(() => {
    // Only check on client side
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT
    }
    return false // Default to desktop for SSR
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange);
  }, [])

  return isMobile
}
