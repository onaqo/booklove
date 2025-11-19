# Stripe Payment Integration Setup Guide

## Overview
This guide will help you set up Stripe payment processing for Book Loop Book online store.

## Flow
1. **Add to Cart** → Products added to localStorage cart
2. **View Cart** (`/cart.html`) → Review items, update quantities
3. **Enter Billing Details** → Customer fills shipping/billing form
4. **Payment** (`/checkout.html`) → Stripe payment form
5. **Order Confirmation** (`/order-confirmation.html`) → Success page with order details

---

## Prerequisites

1. **Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from https://dashboard.stripe.com/apikeys

2. **Vercel Account** (for deployment)
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd /Users/knowadi/Downloads/booklove
npm install
```

### Step 2: Configure Stripe Keys

#### For Local Development:
Create a `.env.local` file:

```bash
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
```

#### For Vercel Production:
Add environment variables in Vercel dashboard:

```bash
vercel env add STRIPE_SECRET_KEY
# Paste your secret key: sk_live_YOUR_SECRET_KEY

vercel env add STRIPE_PUBLISHABLE_KEY  
# Paste your publishable key: pk_live_YOUR_PUBLISHABLE_KEY
```

### Step 3: Update Stripe Publishable Key in Frontend

Edit `checkout.html` line 145:

```javascript
// Replace this line:
const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');

// With your actual publishable key:
const stripe = Stripe('pk_test_51ABC...XYZ');
```

### Step 4: Test Locally

```bash
# Start local development server
vercel dev

# Visit http://localhost:3000
```

### Step 5: Test Payment

Use Stripe test cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

### Step 6: Deploy to Production

```bash
# Deploy to Vercel
vercel --prod
```

---

## File Structure

```
booklove/
├── cart.html                          # Shopping cart page
├── checkout.html                      # Payment page
├── order-confirmation.html            # Success page
├── api/
│   ├── create-payment-intent.js      # Stripe payment API
│   └── send-confirmation-email.js    # Email confirmation API
├── package.json                       # Dependencies
├── vercel.json                        # Vercel configuration
└── env.example                        # Environment variables template
```

---

## How It Works

### 1. Cart Management (cart.html)
- Uses **localStorage** to store cart items
- Cart structure:
```javascript
{
  id: 'product-123',
  title: 'Book Title',
  price: 20.00,
  image: '/cdn/shop/files/book.jpg',
  quantity: 2
}
```

### 2. Billing Form (cart.html)
- Collects customer information
- Validates required fields
- Saves to localStorage
- Redirects to checkout

### 3. Payment Processing (checkout.html)
- Loads cart and billing data
- Displays order summary
- Integrates Stripe Elements for card input
- Calls `/api/create-payment-intent` to create payment
- Confirms payment with Stripe
- Redirects to confirmation page

### 4. Order Confirmation (order-confirmation.html)
- Displays order details
- Shows order ID (Stripe Payment Intent ID)
- Clears cart
- Sends confirmation email

---

## API Endpoints

### POST /api/create-payment-intent
Creates a Stripe Payment Intent

**Request:**
```json
{
  "amount": 4000,
  "currency": "aed",
  "cart": [...],
  "billing": {...}
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

### POST /api/send-confirmation-email
Sends order confirmation email

**Request:**
```json
{
  "orderId": "pi_xxx",
  "cart": [...],
  "billing": {...},
  "total": 40.00,
  "date": "2025-01-01T00:00:00.000Z"
}
```

---

## Adding Products to Cart

Add this JavaScript to your product pages:

```javascript
<script>
// Add to cart button handler
$('.add-to-cart-btn').on('click', function(e) {
  e.preventDefault();
  
  const product = {
    id: $(this).data('product-id'),
    title: $(this).data('product-title'),
    price: parseFloat($(this).data('product-price')),
    image: $(this).data('product-image'),
    quantity: parseInt($('.quantity-input').val()) || 1
  };
  
  // Add to cart
  if (typeof BookLoopCart !== 'undefined') {
    BookLoopCart.add(product);
    alert('Added to cart!');
  } else {
    // Fallback for pages without cart.js loaded
    const cart = JSON.parse(localStorage.getItem('bookloop_cart') || '[]');
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      existing.quantity += product.quantity;
    } else {
      cart.push(product);
    }
    localStorage.setItem('bookloop_cart', JSON.stringify(cart));
    alert('Added to cart!');
  }
});
</script>
```

---

## Customization

### Currency
To change from AED to another currency:

1. Update `checkout.html` line 120:
```javascript
currency: 'usd', // Change to your currency
```

2. Update display in all HTML files:
```javascript
// Replace: AED ${price}
// With: $${price} or £${price}
```

### Shipping Costs
Add shipping calculation in `cart.html` and `checkout.html`:

```javascript
function calculateShipping(billing) {
  // Example: Flat rate or based on location
  if (billing.country === 'AE') {
    return 0; // Free shipping in UAE
  }
  return 10; // AED 10 for international
}
```

### Email Service
To send actual emails, integrate SendGrid in `api/send-confirmation-email.js`:

```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: billing.email,
  from: 'orders@bookloopbook.com',
  subject: `Order Confirmation #${orderId}`,
  html: emailHtml
});
```

---

## Testing Checklist

- [ ] Add product to cart
- [ ] View cart page
- [ ] Update quantities
- [ ] Remove items
- [ ] Fill billing form
- [ ] Proceed to payment
- [ ] Enter test card
- [ ] Complete payment
- [ ] View confirmation page
- [ ] Check order details
- [ ] Verify cart is cleared

---

## Troubleshooting

### "Stripe is not defined"
- Check that Stripe.js is loaded: `<script src="https://js.stripe.com/v3/"></script>`
- Verify publishable key is set correctly

### "Payment Intent creation failed"
- Check Stripe secret key in Vercel environment variables
- Verify API endpoint is accessible
- Check browser console for errors

### "Cart is empty"
- Clear localStorage and try again
- Check browser console for JavaScript errors
- Verify cart.js is loaded

### Images not loading
- Ensure product images are in `/cdn/shop/files/` or `/cdn/shop/products/`
- Check image paths in cart data

---

## Production Checklist

Before going live:

1. [ ] Replace test Stripe keys with live keys
2. [ ] Test with real card (small amount)
3. [ ] Set up email service (SendGrid/Mailgun)
4. [ ] Add order management system
5. [ ] Set up webhooks for payment events
6. [ ] Add inventory management
7. [ ] Configure shipping rates
8. [ ] Add tax calculation if needed
9. [ ] Set up SSL certificate (Vercel provides free)
10. [ ] Test on mobile devices

---

## Support

For issues or questions:
- Email: info@bookloopbook.com
- Phone: +1 973 925 6115

Stripe Documentation: https://stripe.com/docs
Vercel Documentation: https://vercel.com/docs

