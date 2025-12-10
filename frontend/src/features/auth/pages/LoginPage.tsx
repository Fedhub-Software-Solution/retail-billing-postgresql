import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, LogIn, Eye, EyeOff, Store } from 'lucide-react'
import LoginForm from '../components/LoginForm'
import { Button } from '../../../components/ui/button'

const LoginPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-white to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        {/* Logo/Title Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-2xl mb-4 transform hover:scale-105 transition-transform">
            <Store className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl text-white mb-2 font-bold">Retail Billing System</h1>
          <p className="text-purple-200 text-lg">Sign in to continue</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-lg">
          <h2 className="text-2xl text-gray-800 mb-6 text-center font-semibold">Welcome Back</h2>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Staff Mode Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/staff-entry')}
          >
            Enter Staff Mode (No Login Required)
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-purple-200 text-sm">
            Powered by © 2025 Fedhub Software. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
