import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserCircle, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation, UpdateProfileRequest, ChangePasswordRequest } from '../../../store/api/authApi'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { setCredentials } from '../../../store/slices/authSlice'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import { showSuccess, showError } from '../../../utils/toast'
import { cn } from '../../../lib/utils'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const currentUser = useSelector((state: RootState) => state.auth.user)
  const { data: profile, isLoading, error, refetch } = useGetProfileQuery()
  const [updateProfile] = useUpdateProfileMutation()
  const [changePassword] = useChangePasswordMutation()

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileRequest>()

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<ChangePasswordRequest & { confirmPassword: string }>()

  const newPassword = watch('newPassword')

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      resetProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || '',
      })
    }
  }, [profile, resetProfile])

  const onProfileSubmit = async (data: UpdateProfileRequest) => {
    try {
      const updatedProfile = await updateProfile(data).unwrap()
      
      // Update Redux store with new user data
      if (currentUser) {
        dispatch(
          setCredentials({
            user: {
              id: updatedProfile.id,
              username: updatedProfile.username,
              email: updatedProfile.email,
              firstName: updatedProfile.firstName,
              lastName: updatedProfile.lastName,
              role: updatedProfile.role,
            },
            token: localStorage.getItem('token') || '',
          })
        )
      }
      
      showSuccess('Profile updated successfully')
      refetch()
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to update profile'
      showError(errorMessage)
    }
  }

  const onPasswordSubmit = async (data: ChangePasswordRequest & { confirmPassword: string }) => {
    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (data.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordError(null)

    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap()
      
      showSuccess('Password changed successfully')
      resetPassword()
    } catch (error: any) {
      const errorMessage = error?.data?.message || 'Failed to change password'
      showError(errorMessage)
      setPasswordError(errorMessage)
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Profile"
        message="Failed to load profile. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-3xl font-bold">
            My Profile
          </h2>
          <p className="text-gray-500 mt-1">Manage your account information and password</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information Card */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-purple-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile?.username || ''}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Username cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {profile?.role || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...registerProfile('firstName', { required: 'First name is required' })}
                    className={cn(profileErrors.firstName && 'border-red-500')}
                  />
                  {profileErrors.firstName && (
                    <p className="text-sm text-red-500">{profileErrors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...registerProfile('lastName')}
                    className={cn(profileErrors.lastName && 'border-red-500')}
                  />
                  {profileErrors.lastName && (
                    <p className="text-sm text-red-500">{profileErrors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...registerProfile('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={cn(profileErrors.email && 'border-red-500')}
                />
                {profileErrors.email && (
                  <p className="text-sm text-red-500">{profileErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...registerProfile('phone')}
                  className={cn(profileErrors.phone && 'border-red-500')}
                />
                {profileErrors.phone && (
                  <p className="text-sm text-red-500">{profileErrors.phone.message}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  Current Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    className={cn(passwordErrors.currentPassword && 'border-red-500')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...registerPassword('newPassword', {
                      required: 'New password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className={cn(passwordErrors.newPassword && 'border-red-500')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm New Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...registerPassword('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === newPassword || 'Passwords do not match',
                    })}
                    className={cn(passwordErrors.confirmPassword && 'border-red-500')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
                )}
                {passwordError && (
                  <p className="text-sm text-red-500">{passwordError}</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Information Card */}
      {profile && (
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Account Status</p>
                <Badge
                  variant={profile.isActive ? 'success' : 'destructive'}
                  className={profile.isActive ? 'bg-green-100 text-green-700 border-green-200' : ''}
                >
                  {profile.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {profile.lastLogin && (
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(profile.lastLogin).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ProfilePage

