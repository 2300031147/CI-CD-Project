const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Create payment intent for premium subscription
router.post('/create-payment-intent', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    
    const amounts = {
      monthly: 999, // $9.99
      yearly: 9999 // $99.99
    };

    const amount = amounts[plan] || amounts.monthly;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.user.id,
        plan
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const userId = paymentIntent.metadata.userId;
    const plan = paymentIntent.metadata.plan;

    // Update user to premium
    const expiresAt = plan === 'yearly' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET is_premium = true, premium_expires_at = $1 WHERE id = $2',
      [expiresAt, userId]
    );

    // Log payment
    await pool.query(
      'INSERT INTO payments (user_id, amount, plan, stripe_payment_id) VALUES ($1, $2, $3, $4)',
      [userId, paymentIntent.amount, plan, paymentIntent.id]
    );
  }

  res.json({ received: true });
});

// Get subscription status
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT is_premium, premium_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      isPremium: user.is_premium,
      expiresAt: user.premium_expires_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
