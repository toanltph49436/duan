import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClerkProvider } from '@clerk/clerk-react'

// Cấu hình QueryClient với tùy chọn tự động gọi lại dữ liệu
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,   // Tự động gọi lại khi cửa sổ được focus
      refetchOnReconnect: true,     // Tự động gọi lại khi kết nối mạng được khôi phục
      staleTime: 0,                 // Dữ liệu sẽ được coi là "stale" ngay lập tức để luôn gọi lại
    },
  },
});
const Clerk_Key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!Clerk_Key) throw new Error("Clerk Key Required")
createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={Clerk_Key}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </ClerkProvider>

)
