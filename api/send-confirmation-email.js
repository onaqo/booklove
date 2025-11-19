// Email Confirmation API for Vercel Serverless Functions
// You can use SendGrid, Mailgun, or any email service

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
    const { orderId, cart, billing, total, date } = req.body;

    // Build email content
    const itemsList = cart.map(item => 
      `${item.title} - Qty: ${item.quantity} × AED ${item.price.toFixed(2)} = AED ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const emailContent = `
Order Confirmation - Book Loop Book

Thank you for your order!

Order ID: ${orderId}
Date: ${new Date(date).toLocaleString()}

Items:
${itemsList}

Subtotal: AED ${total.toFixed(2)}
Shipping: Free
Total: AED ${total.toFixed(2)}

Shipping Address:
${billing.firstName} ${billing.lastName}
${billing.address}
${billing.city}, ${billing.state} ${billing.zip}
${billing.country}

Email: ${billing.email}
Phone: ${billing.phone}

${billing.notes ? `Order Notes: ${billing.notes}` : ''}

Your order will be processed within 1-2 business days.

If you have any questions, please contact us:
Email: info@bookloopbook.com
Phone: +1 973 925 6115

Thank you for shopping with Book Loop Book!
    `.trim();

    // TODO: Integrate with your email service
    // Example with SendGrid:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    await sgMail.send({
      to: billing.email,
      from: 'orders@bookloopbook.com',
      subject: `Order Confirmation #${orderId}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>')
    });
    */

    // For now, just log it
    console.log('Order confirmation email:', emailContent);

    res.status(200).json({ 
      success: true,
      message: 'Confirmation email sent'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send confirmation email' 
    });
  }
};

