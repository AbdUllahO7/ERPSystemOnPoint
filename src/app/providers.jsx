import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "../context/theme-provider"
import { useState } from "react"
import { I18nProvider } from "../context/translate-api"
import { Toaster } from "react-hot-toast"

export default function AppProviders({ children }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // دقيقة واحدة يعتبر البيانات صالحة ولا يكرر الجلب
        gcTime: 5 * 60 * 1000, // 5 دقائق كاش في الذاكرة
        refetchOnWindowFocus: false, // عدم إزعاج المستخدم بجلب البيانات عند الانتقال بين التبويبات
        retry: 1, // محاولة واحدة عند فشل الاتصال
      },
      mutations: {
        retry: 0,
      }
    }
  }))

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <I18nProvider>
          {children}
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
