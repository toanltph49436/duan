import SyncUserToBackend from './components/AdminGuard'
import Router from './router'
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react'

const App = () => {
  return (
    <div>
      <SignedIn>
        <SyncUserToBackend /> {/* Đồng bộ user lên backend khi đã đăng nhập */}
        <Router /> {/* Toàn bộ app sẽ chạy nếu đã đăng nhập */}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn redirectUrl="/admin" />
        {/* Nếu chưa đăng nhập thì chuyển hướng đến trang đăng nhập Clerk */}
      </SignedOut>
    </div>
  )
}

export default App
