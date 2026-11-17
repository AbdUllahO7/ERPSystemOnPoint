import * as React from "react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/context/translate-api"
import { translateErp } from "@/lib/erp-i18n"

export const Input = React.forwardRef(function Input(
  { className, type = "text", placeholder, ...props },
  ref
) {
  const { locale } = useI18n();
  const displayPlaceholder = locale === "ar" && typeof placeholder === "string"
    ? translateErp(placeholder, locale)
    : placeholder;

  return (
    <input
      ref={ref}
      type={type}
      placeholder={displayPlaceholder}
      className={cn(
        "flex h-8 w-full rounded-md border px-2 text-sm outline-none focus:ring-2",
        className
      )}
      {...props}
    />
  )
})

export default Input
