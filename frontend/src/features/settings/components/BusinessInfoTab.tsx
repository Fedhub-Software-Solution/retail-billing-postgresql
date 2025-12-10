import { Store, Phone, Mail, MapPin, Globe, DollarSign, Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent } from '../../../components/ui/card'

interface BusinessInfoTabProps {
  getSettingValue: (key: string, defaultValue?: string) => string
  handleChange: (key: string, value: string) => void
  handleSave: (keys: string[]) => void
  saving: boolean
}

export const BusinessInfoTab = ({
  getSettingValue,
  handleChange,
  handleSave,
  saving,
}: BusinessInfoTabProps) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Retail Name */}
          <div className="space-y-2">
            <Label htmlFor="retail_name" className="flex items-center gap-2">
              Retail Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="retail_name"
                value={getSettingValue('retail_name', 'Retail Billing System')}
                onChange={(e) => handleChange('retail_name', e.target.value)}
                className="pl-10"
                placeholder="Enter retail name"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline" className="flex items-center gap-2">
              Tagline <span className="text-purple-400">✨</span>
            </Label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="tagline"
                value={getSettingValue('tagline', 'Your trusted retail partner')}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="pl-10"
                placeholder="Enter tagline"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                id="address"
                value={getSettingValue('address', '123 Main Street')}
                onChange={(e) => handleChange('address', e.target.value)}
                className="pl-10"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={getSettingValue('city', 'Mumbai')}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state" className="flex items-center gap-2">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              value={getSettingValue('state', 'Maharashtra')}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="Enter state"
            />
          </div>

          {/* ZIP Code */}
          <div className="space-y-2">
            <Label htmlFor="zip_code" className="flex items-center gap-2">
              ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zip_code"
              value={getSettingValue('zip_code', '400001')}
              onChange={(e) => handleChange('zip_code', e.target.value)}
              placeholder="Enter ZIP code"
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="flex items-center gap-2">
              Country <span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              value={getSettingValue('country', 'India')}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Enter country"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              Phone <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                value={getSettingValue('phone', '+91 98765 43210')}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="pl-10"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={getSettingValue('email', 'contact@retailstore.com')}
                onChange={(e) => handleChange('email', e.target.value)}
                className="pl-10"
                placeholder="Enter email"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="website"
                type="url"
                value={getSettingValue('website')}
                onChange={(e) => handleChange('website', e.target.value)}
                className="pl-10"
                placeholder="Enter website URL"
              />
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="currency"
                value={getSettingValue('currency', 'INR')}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="pl-10"
                placeholder="Currency code"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() =>
              handleSave([
                'retail_name',
                'tagline',
                'address',
                'city',
                'state',
                'zip_code',
                'country',
                'phone',
                'email',
                'website',
                'currency',
              ])
            }
            disabled={saving}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

