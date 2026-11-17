import * as React from "react"
import { cn } from "@/lib/utils"
import { useI18n } from "@/context/translate-api"
import { translateErp } from "@/lib/erp-i18n"

function translateNode(child, locale) {
  if (typeof child === "string") {
    const trimmed = child.trim();
    if (!trimmed) return child;
    const translated = translateErp(trimmed, locale);
    if (translated === trimmed) return child;
    const leading = child.match(/^\s*/)?.[0] || "";
    const trailing = child.match(/\s*$/)?.[0] || "";
    return `${leading}${translated}${trailing}`;
  }
  return child;
}

const Label = React.forwardRef(({ className, children, ...props }, ref) => {
  const { locale } = useI18n();
  const displayChildren = React.useMemo(() => {
    if (locale !== "ar" || children == null) return children;
    if (typeof children === "string") {
      return translateNode(children, locale);
    }
    if (Array.isArray(children)) {
      return React.Children.map(children, (c) => translateNode(c, locale));
    }
    return children;
  }, [children, locale]);

  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    >
      {displayChildren}
    </label>
  );
})
Label.displayName = "Label"

export { Label }
