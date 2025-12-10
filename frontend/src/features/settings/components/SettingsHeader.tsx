import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent } from '../../../components/ui/card'

export const SettingsHeader = () => {
  return (
    <Card className="border border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30"></div>
            <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-xl">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
              Settings
              <span className="text-purple-400">✨</span>
            </h1>
            <p className="text-gray-600 mt-1">Configure your business details</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

