import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  productId: number
  productName: string
  sku: string
  unitPrice: number
  quantity: number
  taxRate: number
  discountAmount?: number
  stockQuantity: number
}

interface CartState {
  items: CartItem[]
  customerId?: number
  discountAmount: number
}

const initialState: CartState = {
  items: [],
  customerId: undefined,
  discountAmount: 0,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      )

      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.items.push(action.payload)
      }
    },
    updateItemQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>
    ) => {
      const item = state.items.find((item) => item.productId === action.payload.productId)
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((item) => item.productId !== action.payload.productId)
        } else {
          item.quantity = action.payload.quantity
        }
      }
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload)
    },
    setCustomer: (state, action: PayloadAction<number | undefined>) => {
      state.customerId = action.payload
    },
    setDiscount: (state, action: PayloadAction<number>) => {
      state.discountAmount = action.payload
    },
    clearCart: (state) => {
      state.items = []
      state.customerId = undefined
      state.discountAmount = 0
    },
  },
})

export const {
  addItem,
  updateItemQuantity,
  removeItem,
  setCustomer,
  setDiscount,
  clearCart,
} = cartSlice.actions

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items
export const selectCartCustomer = (state: { cart: CartState }) => state.cart.customerId
export const selectCartDiscount = (state: { cart: CartState }) => state.cart.discountAmount

export const selectCartSubtotal = (state: { cart: CartState }) => {
  return state.cart.items.reduce((sum, item) => {
    return sum + item.unitPrice * item.quantity - (item.discountAmount || 0)
  }, 0)
}

export const selectCartTax = (state: { cart: CartState }) => {
  return state.cart.items.reduce((sum, item) => {
    const itemSubtotal = item.unitPrice * item.quantity - (item.discountAmount || 0)
    return sum + (itemSubtotal * item.taxRate) / 100
  }, 0)
}

export const selectCartTotal = (state: { cart: CartState }) => {
  const subtotal = selectCartSubtotal(state)
  const tax = selectCartTax(state)
  const discount = state.cart.discountAmount
  return subtotal - discount + tax
}

export default cartSlice.reducer
