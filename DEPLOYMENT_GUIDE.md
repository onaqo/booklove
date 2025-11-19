# 🚀 Complete Deployment Guide - Book Loop Book

## ✅ Stripe Integration Status

**Publishable Key**: Already configured in `checkout.html` ✓

```
pk_test_51SQlQzFdWSERE7CqPcEdsZk2RF3q2GCwAE0Uwu0tTQmXRSyzKegzzYhlSQCcML6ecicuULNQftHql0VdK0q6sIeu00un4YwDBu
```

---

## 📋 What You Need

1. **Stripe Secret Key** (starts with `sk_test_`)
   - Get it from: https://dashboard.stripe.com/test/apikeys
   - **DO NOT share this key publicly!**

2. **Vercel Account** (for hosting)
   - Sign up at: https://vercel.com

---

## 🛠️ Step 1: Get Your Stripe Secret Key

1. Go to https://dashboard.stripe.com/test/apikeys
2. Log in to your Stripe account
3. Under "Standard keys", reveal and copy your **Secret key**
4. It should start with: `sk_test_`

---

## 🛠️ Step 2: Install Dependencies

```bash
cd /Users/knowadi/Downloads/booklove
npm install
```

---

## 🛠️ Step 3: Set Up Local Environment

Update the `.env.local` file with your secret key:

```bash
# Open .env.local and replace sk_test_YOUR_STRIPE_SECRET_KEY_HERE
# with your actual secret key from Step 1
```

---

## 🛠️ Step 4: Test Locally

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Start local development server
vercel dev
```

Visit http://localhost:3000 and test:
1. Add a product to cart
2. Go to `/cart.html`
3. Fill billing details
4. Use test card: **4242 4242 4242 4242**
5. Complete checkout

---

## 🛠️ Step 5: Deploy to Vercel

### First Time Deployment:

```bash
# Login to Vercel
vercel login

# Deploy (this will ask some questions)
vercel

# When prompted:
# - Set up and deploy? → Yes
# - Which scope? → Select your account
# - Link to existing project? → No
# - Project name? → bookloop-book (or your choice)
# - Directory? → ./ (press Enter)
# - Override settings? → No
```

### Add Environment Variables:

```bash
# Add your Stripe SECRET key
vercel env add STRIPE_SECRET_KEY

# When prompted:
# - What's the value? → Paste your sk_test_... key
# - Expose to? → Production, Preview, Development (select all)

# Add publishable key
vercel env add STRIPE_PUBLISHABLE_KEY

# When prompted:
# - What's the value? → pk_test_51SQlQzFdWSERE7CqPcEdsZk2RF3q2GCwAE0Uwu0tTQmXRSyzKegzzYhlSQCcML6ecicuULNQftHql0VdK0q6sIeu00un4YwDBu
# - Expose to? → Production, Preview, Development (select all)
```

### Deploy to Production:

```bash
vercel --prod
```

Your site will be live at: `https://bookloop-book.vercel.app` (or similar)

---

## ✅ Alternative: Deploy via Vercel Dashboard

1. **Push to GitHub**:
```bash
cd /Users/knowadi/Downloads/booklove
git init
git add .
git commit -m "Initial commit with Stripe integration"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bookloop-book.git
git push -u origin main
```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Deploy"

3. **Add Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add:
     - `STRIPE_SECRET_KEY` = `sk_test_YOUR_SECRET_KEY`
     - `STRIPE_PUBLISHABLE_KEY` = `pk_test_51SQlQzFdWSERE7CqPcEdsZk2RF3q2GCwAE0Uwu0tTQmXRSyzKegzzYhlSQCcML6ecicuULNQftHql0VdK0q6sIeu00un4YwDBu`

4. **Redeploy**:
   - Click "Deployments" → "..." → "Redeploy"

---

## 🧪 Testing Checklist

After deployment, test the complete flow:

- [ ] Visit your live site
- [ ] Browse products
- [ ] Click "Add to Cart" on a product
- [ ] See cart notification
- [ ] Go to `/cart.html`
- [ ] Items show up correctly
- [ ] Update quantity (+ and - buttons)
- [ ] Remove an item
- [ ] Add item back
- [ ] Fill billing form with test data:
  - First Name: Test
  - Last Name: User
  - Email: test@example.com
  - Phone: +1234567890
  - Address: 123 Test St
  - City: Dubai
  - ZIP: 12345
  - Country: AE
- [ ] Click "Proceed to Payment"
- [ ] Checkout page loads
- [ ] Order summary is correct
- [ ] Billing address displays correctly
- [ ] Enter test card: `4242 4242 4242 4242`
- [ ] Expiry: `12/25`
- [ ] CVC: `123`
- [ ] Click "Pay Now"
- [ ] Payment processes (spinner shows)
- [ ] Redirect to confirmation page
- [ ] Order ID shows (starts with `pi_`)
- [ ] Order details are correct
- [ ] Go back to cart - it should be empty

---

## 🎴 Stripe Test Cards

| Card Number | Scenario |
|-------------|----------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Card declined |
| 4000 0025 0000 3155 | 🔐 3D Secure authentication |
| 4000 0000 0000 9995 | ❌ Insufficient funds |

Use any future expiry date and any 3-digit CVC.

---

## 🔧 Troubleshooting

### Problem: "Stripe is not defined"
**Solution**: Check that Stripe.js script is loading:
```html
<script src="https://js.stripe.com/v3/"></script>
```

### Problem: "Payment Intent creation failed"
**Solutions**:
1. Check secret key is correctly set in Vercel
2. Verify key starts with `sk_test_`
3. Check Vercel function logs for errors
4. Ensure API endpoint `/api/create-payment-intent` is accessible

### Problem: Cart not showing items
**Solutions**:
1. Check browser console for JavaScript errors
2. Clear localStorage: Open DevTools → Console → Type: `localStorage.clear()`
3. Verify `cart-integration.js` is loaded
4. Check that products have correct data attributes

### Problem: Images not loading
**Solutions**:
1. Product images should be in `/cdn/shop/files/` or `/cdn/shop/products/`
2. Check image paths in product data
3. Ensure images were downloaded (run the download script again if needed)

### Problem: API calls failing (404)
**Solution**: 
- Vercel serverless functions need a rebuild
- Run: `vercel --prod` again

---

## 📊 Monitor Your Payments

1. **Stripe Dashboard**: https://dashboard.stripe.com/test/payments
   - See all test payments
   - View payment details
   - Issue refunds

2. **Vercel Logs**: 
   - Go to your project in Vercel
   - Click "Functions" → View logs
   - See API requests and errors

---

## 🔄 Update Existing Deployment

After making changes:

```bash
# Pull latest changes if using Git
git pull

# Redeploy
vercel --prod
```

Or use Vercel's auto-deployment:
- Push to GitHub
- Vercel automatically redeploys

---

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `bookloopbook.com`)
3. Update DNS records as instructed
4. Vercel provides free SSL certificate

---

## 🔐 Going to Production

When ready to accept real payments:

1. **Get Live Stripe Keys**:
   - Go to https://dashboard.stripe.com/apikeys
   - Toggle to "Live mode"
   - Copy live keys (start with `pk_live_` and `sk_live_`)

2. **Update Environment Variables**:
```bash
vercel env add STRIPE_SECRET_KEY production
# Paste your sk_live_... key

vercel env add STRIPE_PUBLISHABLE_KEY production
# Paste your pk_live_... key
```

3. **Update `checkout.html`**:
   - Replace test key with live key on line 177

4. **Activate Stripe Account**:
   - Complete business verification
   - Add bank account details

5. **Test with Real Card** (small amount):
   - Use your own card
   - Make a test purchase
   - Verify payment appears in Stripe dashboard
   - Issue a refund to test refund flow

6. **Set Up Webhooks** (recommended):
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.vercel.app/api/webhook`
   - Select events to listen to
   - Create webhook API to handle events

---

## 📧 Email Notifications (Next Step)

To send actual order confirmation emails:

### Option 1: SendGrid

```bash
npm install @sendgrid/mail
```

Update `api/send-confirmation-email.js`:
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

Add environment variable:
```bash
vercel env add SENDGRID_API_KEY
```

### Option 2: Resend (Modern alternative)

```bash
npm install resend
```

```javascript
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'orders@bookloopbook.com',
  to: billing.email,
  subject: `Order Confirmation #${orderId}`,
  html: emailHtml
});
```

---

## 📈 Analytics (Optional)

Add order tracking:

```javascript
// In order-confirmation.html
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: total,
  currency: 'AED',
  items: cart
});
```

---

## 🎯 Current Status

✅ Frontend cart system - Working
✅ Billing form - Working
✅ Stripe publishable key - Configured
✅ Payment page - Ready
✅ Confirmation page - Ready
✅ Serverless API - Ready
⚠️ Secret key - **Need to add to Vercel**
⚠️ Deployment - **Ready to deploy**
⏳ Email notifications - Optional (can add later)

---

## 📞 Support

Need help?
- Email: info@bookloopbook.com
- Phone: +1 973 925 6115

Stripe Support: https://support.stripe.com
Vercel Support: https://vercel.com/support

---

## ✨ You're Ready!

Your Stripe integration is complete. Follow the steps above to deploy and start accepting payments! 🎉

**Quick Deploy Command:**
```bash
npm install
vercel login
vercel --prod
# Then add environment variables as shown above
```

