# Payment Integration Setup Guide

This document provides instructions for setting up UPI and Card payment functionality using Razorpay.

## Prerequisites

1. Razorpay Account: Sign up at [https://razorpay.com](https://razorpay.com)
2. Get your API Keys from Razorpay Dashboard:
   - Key ID (starts with `rzp_test_` for test mode or `rzp_live_` for production)
   - Key Secret

## Backend Setup

### 1. Install Razorpay SDK

```bash
cd backend
npm install razorpay
```

### 2. Add Environment Variables

Add to `backend/.env`:

```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 3. Update Payment Controller

The payment controller (`backend/src/controllers/paymentController.ts`) has placeholder code for Razorpay integration. Uncomment and configure the Razorpay initialization:

```typescript
const Razorpay = require('razorpay')
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})
```

## Frontend Setup

### 1. Add Razorpay Key to Environment Variables

Add to `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 2. Razorpay Script Loading

The Razorpay checkout script is loaded dynamically in the PaymentModal component. No additional setup needed.

## How It Works

### Payment Flow

1. **User selects payment method** (UPI or Card)
2. **Frontend calls backend** to create payment order
3. **Backend creates Razorpay order** and returns order details
4. **Frontend initializes Razorpay checkout** with order details
5. **User completes payment** via Razorpay checkout
6. **Razorpay callback** triggers payment verification
7. **Backend verifies payment** signature
8. **Sale is completed** with transaction ID

### Manual Transaction ID Entry

If payment gateway is not configured or fails:
- User can manually enter transaction ID
- Payment is completed with manual transaction ID
- Transaction ID is stored in sale notes

## Testing

### Test Mode

1. Use Razorpay test keys (starts with `rzp_test_`)
2. Use test UPI IDs: `success@razorpay` or `failure@razorpay`
3. Use test card numbers from Razorpay documentation

### Production

1. Switch to live keys (starts with `rzp_live_`)
2. Update environment variables
3. Ensure webhook URL is configured in Razorpay dashboard
4. Test payment verification thoroughly

## Webhook Configuration

For production, configure webhook in Razorpay Dashboard:
- Webhook URL: `https://yourdomain.com/api/v1/payments/verify`
- Events: `payment.captured`, `payment.failed`

## Security Notes

1. **Never expose Key Secret** in frontend code
2. **Always verify payment signature** on backend
3. **Use HTTPS** in production
4. **Validate amounts** on backend before processing
5. **Log all payment transactions** for audit

## Troubleshooting

### Payment Gateway Not Loading

- Check if Razorpay script is accessible
- Verify network connectivity
- Check browser console for errors

### Payment Verification Fails

- Verify Razorpay Key Secret is correct
- Check signature generation logic
- Ensure order ID matches between creation and verification

### Transaction ID Not Saved

- Check backend payment verification endpoint
- Verify transaction ID is included in sale notes
- Check database for payment records

