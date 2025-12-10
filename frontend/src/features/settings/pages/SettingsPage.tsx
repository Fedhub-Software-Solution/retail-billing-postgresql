import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Building2, FileText, Award, ArrowLeft } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import LoadingSpinner from '../../../components/common/LoadingSpinner'
import ErrorState from '../../../components/common/ErrorState'
import { useSettings } from '../hooks/useSettings'
import { SettingsHeader } from '../components/SettingsHeader'
import { BusinessInfoTab } from '../components/BusinessInfoTab'
import { BankingTab } from '../components/BankingTab'
import { TaxLegalTab } from '../components/TaxLegalTab'
import { RewardsTab } from '../components/RewardsTab'

const SettingsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('business')
  
  const {
    isLoading,
    error,
    saving,
    handleChange,
    handleSave,
    getSettingValue,
  } = useSettings()

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />
  }

  if (error) {
    return (
      <ErrorState
        title="Error Loading Settings"
        message="Failed to load settings. Please try again."
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button variant="outline" onClick={() => navigate('/billing')} className="flex items-center gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Billing
      </Button>

      {/* Settings Header */}
      <SettingsHeader />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            Business Info
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Banking Details
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tax & Legal
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Rewards
          </TabsTrigger>
        </TabsList>

        {/* Business Info Tab */}
        <TabsContent value="business" className="space-y-6">
          <BusinessInfoTab
            getSettingValue={getSettingValue}
            handleChange={handleChange}
            handleSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        {/* Banking Details Tab */}
        <TabsContent value="banking" className="space-y-6">
          <BankingTab
            getSettingValue={getSettingValue}
            handleChange={handleChange}
            handleSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        {/* Tax & Legal Tab */}
        <TabsContent value="tax" className="space-y-6">
          <TaxLegalTab
            getSettingValue={getSettingValue}
            handleChange={handleChange}
            handleSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <RewardsTab
            getSettingValue={getSettingValue}
            handleChange={handleChange}
            handleSave={handleSave}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage
