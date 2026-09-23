import * as React from "react"
import { cn } from "@/lib/utils"

export const Switch = React.forwardRef(function Switch(
  {
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  const [checked, setChecked] = React.useState(!!defaultChecked)
  const isControlled = checkedProp !== undefined
  const value = isControlled ? !!checkedProp : checked

  const toggle = () => {
    if (disabled) return
    const next = !value
    if (!isControlled) setChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      ref={ref}
      role="switch"
      aria-checked={value}
      aria-disabled={disabled}
      type="button"
      onClick={toggle}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0066d1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        value ? "bg-[#0066d1]" : "bg-slate-200",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      data-checked={value}
      data-state={value ? "checked" : "unchecked"}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-xs ring-0 transition-transform",
          value ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
})

export default Switch
