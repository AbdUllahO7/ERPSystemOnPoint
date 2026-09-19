import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { useTheme } from "@/context/theme-provider";
import { cn } from "@/lib/utils";

const iconByTheme = {
  light: Sun,
  dark: Moon,
};

export function ModeToggle({ className, duration = 800 }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const buttonRef = useRef(null);

  const active = resolvedTheme === "dark" ? "dark" : "light";
  const ActiveIcon = iconByTheme[active];

  const toggleTheme = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextTheme = active === "light" ? "dark" : "light";
    const applyTheme = () => setTheme(nextTheme);

    const button = buttonRef.current;

    if (!button || !document.startViewTransition) {
      applyTheme();
      setIsTransitioning(false);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    try {
      const transition = document.startViewTransition(() => {
        flushSync(applyTheme);
      });

      await transition.ready;

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    } catch {
      applyTheme();
    }

    setTimeout(() => setIsTransitioning(false), duration);
  }, [setTheme, duration, active, isTransitioning]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex h-10 w-10 shrink-0 rounded-lg border border-border bg-card",
          className,
        )}
        aria-hidden
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={active === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={cn(
        "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:opacity-60",
        className,
      )}
    >
      <ActiveIcon className="h-[18px] w-[18px]" />
    </button>
  );
}

export default ModeToggle;
