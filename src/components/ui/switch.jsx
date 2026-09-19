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
        "inline-flex items-center rounded-full border transition-all",
        "h-5 w-9 p-[2px]",
        "data-[checked=true]:justify-end data-[checked=false]:justify-start",
        "justify-start",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      data-checked={value}
      {...props}
    >
      <span className="block h-4 w-4 rounded-full border" />
    </button>
  )
})

export default Switch
