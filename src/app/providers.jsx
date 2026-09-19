import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "../context/theme-provider"
import { useState } from "react"
import { I18nProvider } from "../context/translate-api"
import { Toaster } from "react-hot-toast"

export default function AppProviders({ children }) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <I18nProvider>
          {children}
          <Toaster position="top-center" />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
