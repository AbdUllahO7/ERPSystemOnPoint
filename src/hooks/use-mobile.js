import { useEffect, useState } from "react"

export function useIsMobile(breakpoint = 768) {
  const getMatch = () =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false

  const [isMobile, setIsMobile] = useState(getMatch)

  useEffect(() => {
    if (typeof window === "undefined") return
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const handler = (e) => setIsMobile(e.matches)
    // support both addEventListener and addListener
    if (mql.addEventListener) mql.addEventListener("change", handler)
    else mql.addListener(handler)
    setIsMobile(mql.matches)
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", handler)
      else mql.removeListener(handler)
    }
  }, [breakpoint])

  return isMobile
}
