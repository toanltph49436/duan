import { SignIn } from '@clerk/clerk-react'

const Login = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <SignIn />
        </div>
    )
}

export default Login
