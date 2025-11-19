# Quick Start Guide - Stripe Checkout Integration

## ✅ What's Been Done

I've integrated a complete Stripe checkout system into your Book Loop Book website:

### Files Created:
1. **`cart.html`** - Shopping cart page with billing form
2. **`checkout.html`** - Stripe payment page
3. **`order-confirmation.html`** - Order success page
4. **`api/create-payment-intent.js`** - Stripe payment API
5. **`api/send-confirmation-email.js`** - Email confirmation API
6. **`cdn/shop/t/146/assets/cart-integration.js`** - Cart functionality
7. **`package.json`** - Node.js dependencies
8. **`vercel.json`** - Vercel deployment config

---

## 🚀 Setup in 5 Minutes

### 1. Get Stripe Keys
1. Go to https://dashboard.stripe.com/register
2. Create account
3. Get your keys from https://dashboard.stripe.com/test/apikeys
   - Copy **Publishable key** (starts with `pk_test_`)
   - Copy **Secret key** (starts with `sk_test_`)

### 2. Update checkout.html
Open `checkout.html` and find line 145:

```javascript
const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY');
```

Replace with YOUR publishable key:
```javascript
const stripe = Stripe('pk_test_51ABC123...XYZ789');
```

### 3. Install Dependencies
```bash
cd /Users/knowadi/Downloads/booklove
npm install
```

### 4. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add STRIPE_SECRET_KEY
# Paste: sk_test_YOUR_SECRET_KEY

vercel env add STRIPE_PUBLISHABLE_KEY
# Paste: pk_test_YOUR_PUBLISHABLE_KEY

# Deploy to production
vercel --prod
```

---

## 🧪 Test the Checkout

### 1. Add Product to Cart
- Click any "Add to Cart" button on your site
- You'll see a green notification

### 2. View Cart
- Go to `/cart.html`
- Update quantities or remove items

### 3. Enter Billing Details
- Fill out the billing form
- Click "Proceed to Payment"

### 4. Complete Payment
- Use test card: **4242 4242 4242 4242**
- Any future date (e.g., 12/25)
- Any 3-digit CVC (e.g., 123)
- Click "Pay Now"

### 5. View Confirmation
- You'll see order confirmation page
- Order ID is the Stripe Payment Intent ID
- Cart is automatically cleared

---

## 📱 How Customers Use It

```
Browse Books → Add to Cart → View Cart → 
Enter Billing Info → Enter Card Details → 
Pay → Order Confirmation → Continue Shopping
```

---

## 🔧 Customization

### Change Currency
In `checkout.html` line 120:
```javascript
currency: 'usd',  // Change to: 'gbp', 'eur', etc.
```

### Add Shipping Costs
In `cart.html` around line 340:
```javascript
const shipping = 10; // Add your shipping cost
const total = subtotal + shipping;
```

### Customize Email
Edit `api/send-confirmation-email.js` to integrate with SendGrid, Mailgun, etc.

---

## 📋 Test Cards

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0025 0000 3155 | 3D Secure |

---

## 🐛 Troubleshooting

### Cart not working?
- Check browser console for errors
- Make sure `cart-integration.js` is loaded
- Clear localStorage: `localStorage.clear()`

### Payment failing?
- Verify Stripe keys are correct
- Check Vercel environment variables
- Look at Vercel function logs

### Images not loading?
- Product images should be in `/cdn/shop/files/` or `/cdn/shop/products/`
- Check image paths in cart data

---

## 🎯 Next Steps

1. **Test thoroughly** with Stripe test cards
2. **Get live Stripe keys** when ready for production
3. **Set up email service** (SendGrid recommended)
4. **Add order management** system
5. **Configure shipping rates** based on location
6. **Add inventory tracking**

---

## 📞 Support

Need help?
- Email: info@bookloopbook.com
- Phone: +1 973 925 6115

Read full documentation: `STRIPE_SETUP.md`

---

## ✨ Features Included

✅ Add to cart functionality
✅ Cart page with quantity management
✅ Billing details form
✅ Stripe payment integration
✅ Order confirmation page
✅ Email notifications (ready to integrate)
✅ Mobile responsive
✅ Secure payment processing
✅ Test mode enabled
✅ Production ready

---

**Ready to go live?** Just replace test keys with live keys and deploy!

