import { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useGetSettingsQuery, useUpdateSettingMutation } from '../../../store/api/settingsApi'
import { addToast } from '../../../store/slices/uiSlice'

export const useSettings = () => {
  const dispatch = useDispatch()
  const { data: settings = [], isLoading, error } = useGetSettingsQuery()
  const [updateSetting] = useUpdateSettingMutation()

  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const settingsRef = useRef<string>('')

  // Initialize values from settings (only when settings actually change)
  useEffect(() => {
    if (settings.length === 0) return

    const settingsKey = JSON.stringify(settings.map(s => ({ key: s.key, value: s.value })))
    
    if (settingsRef.current === settingsKey) return
    
    settingsRef.current = settingsKey
    
    const initialValues: Record<string, string> = {}
    settings.forEach((setting) => {
      initialValues[setting.key] = setting.value || ''
    })
    
    setValues(initialValues)
  }, [settings])

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (keys: string[]) => {
    setSaving(true)
    try {
      const results = []
      const errors: string[] = []
      for (const key of keys) {
        try {
          const cleanKey = key.trim()
          const value = values[cleanKey] || ''
          
          const result = await updateSetting({
            key: cleanKey,
            data: { value },
          }).unwrap()
          results.push(result)
        } catch (err: any) {
          const errorMsg = err?.data?.message || err?.message || 'Unknown error'
          console.error(`Failed to save setting ${key}:`, err)
          errors.push(`${key}: ${errorMsg}`)
        }
      }

      if (results.length === keys.length) {
        dispatch(
          addToast({
            message: 'Settings saved successfully',
            severity: 'success',
            duration: 3000,
          })
        )
      } else if (results.length > 0) {
        dispatch(
          addToast({
            message: `Saved ${results.length} of ${keys.length} settings. Some settings failed to save.`,
            severity: 'warning',
            duration: 4000,
          })
        )
      } else {
        const errorDetails = errors.length > 0 ? ` Errors: ${errors.join('; ')}` : ''
        throw new Error(`All settings failed to save.${errorDetails}`)
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      const errorMessage = error?.data?.message || error?.message || 'Failed to save settings. Please try again.'
      dispatch(
        addToast({
          message: errorMessage,
          severity: 'error',
          duration: 5000,
        })
      )
    } finally {
      setSaving(false)
    }
  }

  const getSettingValue = (key: string, defaultValue: string = '') => {
    return values[key] || defaultValue
  }

  return {
    settings,
    isLoading,
    error,
    values,
    saving,
    handleChange,
    handleSave,
    getSettingValue,
  }
}

