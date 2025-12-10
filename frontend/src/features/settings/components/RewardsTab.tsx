import { Award, CheckCircle2, Save } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Card, CardContent } from '../../../components/ui/card'
import { Switch } from '../../../components/ui/switch'

interface RewardsTabProps {
  getSettingValue: (key: string, defaultValue?: string) => string
  handleChange: (key: string, value: string) => void
  handleSave: (keys: string[]) => void
  saving: boolean
}

export const RewardsTab = ({
  getSettingValue,
  handleChange,
  handleSave,
  saving,
}: RewardsTabProps) => {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Rewards Program Configuration</h2>
        </div>

        <div className="space-y-6">
          {/* Enable Rewards Program */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1">
              <Label htmlFor="rewards_enabled" className="text-base font-medium text-gray-900 cursor-pointer">
                Enable Rewards Program
              </Label>
              <p className="text-sm text-gray-500 mt-1">Allow customers to earn and redeem reward points</p>
            </div>
            <Switch
              id="rewards_enabled"
              checked={getSettingValue('rewards_enabled') === 'true'}
              onCheckedChange={(checked) => handleChange('rewards_enabled', checked.toString())}
            />
          </div>

          {/* Points Earned per ₹100 Spent */}
          <div className="space-y-2">
            <Label htmlFor="rewards_points_per_100">Points Earned per ₹100 Spent</Label>
            <Input
              id="rewards_points_per_100"
              type="number"
              min="0"
              step="0.1"
              value={getSettingValue('rewards_points_per_100', '1')}
              onChange={(e) => handleChange('rewards_points_per_100', e.target.value)}
              placeholder="Enter points"
            />
            <p className="text-xs text-gray-500">
              If set to 1, customer earns 1 point for every ₹100 spent
            </p>
          </div>

          {/* Redemption Value */}
          <div className="space-y-2">
            <Label htmlFor="rewards_redemption_value">Redemption Value (1 Point = ₹?)</Label>
            <Input
              id="rewards_redemption_value"
              type="number"
              min="0"
              step="0.01"
              value={getSettingValue('rewards_redemption_value', '1')}
              onChange={(e) => handleChange('rewards_redemption_value', e.target.value)}
              placeholder="Enter redemption value"
            />
            <p className="text-xs text-gray-500">Currency value of 1 reward point</p>
          </div>

          {/* Minimum Points to Redeem */}
          <div className="space-y-2">
            <Label htmlFor="rewards_minimum_points">Minimum Points to Redeem</Label>
            <Input
              id="rewards_minimum_points"
              type="number"
              min="0"
              value={getSettingValue('rewards_minimum_points', '50')}
              onChange={(e) => handleChange('rewards_minimum_points', e.target.value)}
              placeholder="Enter minimum points"
            />
            <p className="text-xs text-gray-500">Minimum points required to use rewards</p>
          </div>

          {/* Example Calculation */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Example Calculation
            </h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>
                ✓ Customer spends ₹1,000 → Earns{' '}
                <strong>
                  {Math.round(
                    (1000 / 100) * parseFloat(getSettingValue('rewards_points_per_100', '1'))
                  )}{' '}
                  points
                </strong>
              </p>
              <p>
                ✓ Customer redeems 50 points → Gets{' '}
                <strong>
                  ₹{50 * parseFloat(getSettingValue('rewards_redemption_value', '1'))} discount
                </strong>
              </p>
              <p>
                ✓ Minimum balance required to redeem:{' '}
                <strong>{getSettingValue('rewards_minimum_points', '50')} points</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={() =>
              handleSave([
                'rewards_enabled',
                'rewards_points_per_100',
                'rewards_redemption_value',
                'rewards_minimum_points',
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
                <Award className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

