import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface StaffState {
  isStaffMode: boolean
  staffName?: string
}

const initialState: StaffState = {
  isStaffMode: false,
  staffName: undefined,
}

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    enableStaffMode: (state, action: PayloadAction<{ name?: string }>) => {
      state.isStaffMode = true
      state.staffName = action.payload.name
      localStorage.setItem('staffMode', 'true')
      if (action.payload.name) {
        localStorage.setItem('staffName', action.payload.name)
      }
    },
    disableStaffMode: (state) => {
      state.isStaffMode = false
      state.staffName = undefined
      localStorage.removeItem('staffMode')
      localStorage.removeItem('staffName')
    },
    initializeStaffMode: (state) => {
      const staffMode = localStorage.getItem('staffMode')
      if (staffMode === 'true') {
        state.isStaffMode = true
        state.staffName = localStorage.getItem('staffName') || undefined
      }
    },
  },
})

export const { enableStaffMode, disableStaffMode, initializeStaffMode } = staffSlice.actions
export default staffSlice.reducer

