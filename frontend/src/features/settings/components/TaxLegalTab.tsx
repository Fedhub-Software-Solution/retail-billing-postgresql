import { FileText, Percent, FileCheck, Hash, AlertTriangle, Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent } from '../../../components/ui/card'

interface TaxLegalTabProps {
  getSettingValue: (key: string, defaultValue?: string) => string
  handleChange: (key: string, value: string) => void
  handleSave: (keys: string[]) => void
  saving: boolean
}

export const TaxLegalTab = ({
  getSettingValue,
  handleChange,
  handleSave,
  saving,
}: TaxLegalTabProps) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Tax & Legal Information</h2>
        </div>

        <div className="space-y-6">
          {/* Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="tax_rate" className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              % Tax Rate (%) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tax_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={getSettingValue('tax_rate', '18')}
              onChange={(e) => handleChange('tax_rate', e.target.value)}
              placeholder="Enter tax rate"
            />
            <p className="text-xs text-gray-500">This tax rate will be applied to all transactions</p>
          </div>

          {/* Tax ID / VAT Number */}
          <div className="space-y-2">
            <Label htmlFor="tax_id" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Tax ID / VAT Number
            </Label>
            <Input
              id="tax_id"
              value={getSettingValue('tax_id')}
              onChange={(e) => handleChange('tax_id', e.target.value)}
              placeholder="Tax identification number"
            />
          </div>

          {/* Business Registration Number */}
          <div className="space-y-2">
            <Label htmlFor="business_registration_number" className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              # Business Registration Number
            </Label>
            <Input
              id="business_registration_number"
              value={getSettingValue('business_registration_number')}
              onChange={(e) => handleChange('business_registration_number', e.target.value)}
              placeholder="Business registration number"
            />
          </div>

          {/* Important Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Tax settings will be applied to all new bills. Existing bills
                will retain their original tax rates.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => handleSave(['tax_rate', 'tax_id', 'business_registration_number'])}
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
                <FileText className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

