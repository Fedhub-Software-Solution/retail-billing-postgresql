import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { User, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '../../../store/slices/authSlice'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { cn } from '../../../lib/utils'

const loginSchema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

interface LoginFormData {
  email: string
  password: string
}

const LoginForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the same base URL logic as baseApi
      const baseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1'
      const apiUrl = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        dispatch(setCredentials({ user: result.data.user, token: result.data.accessToken }))
        navigate('/dashboard')
      } else {
        setError(result.message || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickFill = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Username Field */}
      <div>
        <Label htmlFor="email" className="block text-sm text-gray-700 mb-2">
          Email
        </Label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <User className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={cn(
              'pl-12 pr-4',
              errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <Label htmlFor="password" className="block text-sm text-gray-700 mb-2">
          Password
        </Label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className={cn(
              'pl-12 pr-12',
              errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-2 animate-shake">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </>
        )}
      </Button>

      {/* Demo Credentials Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 text-center mb-3">
          <span className="inline-flex items-center gap-2">
            Demo Credentials
            <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
              Click to auto-fill
            </span>
          </span>
        </p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleQuickFill('admin@billing.com', 'admin123')}
            className="w-full bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-3 border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                  Admin Account
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Email:</span> admin@billing.com
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Password:</span> admin123
                </p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
