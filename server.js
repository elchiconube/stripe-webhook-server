#!/usr/bin/env -S npm run-script run

const Stripe = require('stripe');
const express = require('express');
const env = require('dotenv');

env.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// Use JSON parser for all non-webhook routes
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    // On error, log and return the error message
    console.log(`❌ Error message: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Successfully constructed event
  console.log('✅ Success:', event.id);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`💰 PaymentIntent status: ${paymentIntent.status}`);
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log(`💵 Charge id: ${charge.id}`);
      break;
    default:
      console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({received: true});
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Webhook endpoint available at http://localhost:${server.address().port}/webhook`);
});
