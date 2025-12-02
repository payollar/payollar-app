"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function ConditionalHeaderWrapper({ children }) {
  const pathname = usePathname()
  const [showHeader, setShowHeader] = useState(true)
  
  useEffect(() => {
    // Hide header on auth pages
    if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
      setShowHeader(false)
    } else {
      setShowHeader(true)
    }
  }, [pathname])
  
  if (!showHeader) {
    return null
  }
  
  return <>{children}</>
}

