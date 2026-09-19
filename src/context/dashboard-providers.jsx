import { createContext, useContext, useState, useEffect } from "react";

// ===== Sidebar Context =====
const SidebarContext = createContext(null);

export function useSidebar() {
  return useContext(SidebarContext);
}

// ===== Dashboard Skeleton =====
function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full overflow-hidden  bg-white dark:bg-neutral-950 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="flex h-full w-64 shrink-0 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-800 px-5 h-16">
          <div className="h-9 w-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-3.5 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-2.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-hidden px-3 py-5 space-y-6">
          {[
            { label: 14, items: 2 },
            { label: 10, items: 3 },
            { label: 16, items: 2 },
          ].map((group, gi) => (
            <div key={gi} className="space-y-1">
              <div
                className={`h-2.5 w-${group.label} rounded-full bg-neutral-200 dark:bg-neutral-800 mb-3 opacity-60`}
              />
              {Array.from({ length: group.items }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                >
                  <div className="h-5 w-5 rounded-lg bg-neutral-200 dark:bg-neutral-800 shrink-0" />
                  <div className="h-3 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-20 rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="h-2.5 w-28 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header Skeleton */}
        <div className="flex h-16 w-full shrink-0 items-center gap-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6">
          <div className="h-8 w-8 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0" />
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="h-4 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-2.5 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex-1 max-w-sm mx-4 hidden sm:block">
            <div className="h-9 w-full rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
          <div className="flex items-center gap-2 ml-auto shrink-0">
            <div className="h-9 w-9 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-9 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-2">
            <div className="h-6 w-52 rounded-full bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3.5 w-72 rounded-full bg-neutral-200 dark:bg-neutral-800 opacity-60" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-28 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800"
              />
            ))}
          </div>
          <div className="h-72 w-full rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}

// ===== Dashboard Providers =====
export function DashboardProviders({ children }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <DashboardSkeleton />;

  return (
    <SidebarContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}
