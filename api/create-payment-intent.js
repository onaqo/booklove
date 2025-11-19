// Stripe Payment Intent API for Vercel Serverless Functions
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, cart, billing } = req.body;

    // Validate required fields
    if (!amount || !currency || !cart || !billing) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_name: `${billing.firstName} ${billing.lastName}`,
        customer_email: billing.email,
        customer_phone: billing.phone,
        order_items: JSON.stringify(cart.map(item => ({
          title: item.title,
          quantity: item.quantity,
          price: item.price
        }))),
        shipping_address: `${billing.address}, ${billing.city}, ${billing.state} ${billing.zip}, ${billing.country}`,
        order_notes: billing.notes || ''
      },
      receipt_email: billing.email,
      description: `Book Loop Book Order - ${cart.length} item(s)`,
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create payment intent' 
    });
  }
};

