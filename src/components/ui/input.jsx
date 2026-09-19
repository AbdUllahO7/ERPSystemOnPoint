import * as React from "react"
import { cn } from "@/lib/utils"

export const Input = React.forwardRef(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-2",
        className
      )}
      {...props}
    />
  )
})

export default Input
