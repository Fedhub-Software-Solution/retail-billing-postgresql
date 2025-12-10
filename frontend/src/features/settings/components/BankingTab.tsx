import { Building2, Building, CreditCard, User, Hash, Globe, Lightbulb, Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent } from '../../../components/ui/card'

interface BankingTabProps {
  getSettingValue: (key: string, defaultValue?: string) => string
  handleChange: (key: string, value: string) => void
  handleSave: (keys: string[]) => void
  saving: boolean
}

export const BankingTab = ({
  getSettingValue,
  handleChange,
  handleSave,
  saving,
}: BankingTabProps) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Bank Account Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank_name" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Bank Name
            </Label>
            <Input
              id="bank_name"
              value={getSettingValue('bank_name', 'State Bank of India')}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              placeholder="Enter bank name"
            />
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Account Number
            </Label>
            <Input
              id="account_number"
              value={getSettingValue('account_number')}
              onChange={(e) => handleChange('account_number', e.target.value)}
              placeholder="Account number"
            />
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="account_name" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Account Name
            </Label>
            <Input
              id="account_name"
              value={getSettingValue('account_name')}
              onChange={(e) => handleChange('account_name', e.target.value)}
              placeholder="Account holder name"
            />
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <Label htmlFor="ifsc_code" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              # IFSC Code
            </Label>
            <Input
              id="ifsc_code"
              value={getSettingValue('ifsc_code')}
              onChange={(e) => handleChange('ifsc_code', e.target.value)}
              placeholder="IFSC code (for India)"
            />
          </div>

          {/* SWIFT Code */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="swift_code" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              SWIFT Code
            </Label>
            <Input
              id="swift_code"
              value={getSettingValue('swift_code')}
              onChange={(e) => handleChange('swift_code', e.target.value)}
              placeholder="SWIFT/BIC code"
            />
          </div>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Note: Bank details will appear on your invoices for customer payments. Ensure all
              information is accurate.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() =>
              handleSave(['bank_name', 'account_number', 'account_name', 'ifsc_code', 'swift_code'])
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
                <Building2 className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

