import * as React from "react"

export function TooltipProvider({ children }) {
  return children
}

export function Tooltip({ children }) {
  return children
}

export function TooltipTrigger({ asChild, children, ...props }) {
  const Comp = asChild ? React.Fragment : "span"
  return <Comp {...props}>{children}</Comp>
}

export function TooltipContent({ children, hidden, ...props }) {
  if (hidden) return null
  return <div {...props}>{children}</div>
}

export default {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
}
