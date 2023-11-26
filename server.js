require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
  const sig = request.headers['stripe-signature'];

  console.log('Receiving webhook...');

  let event;

  try {
    console.log('Constructing event...');
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    console.log('Event constructed:', event.type);
  } catch (err) {
    console.error(`Error constructing event: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  try {
    // Aquí puedes manejar los diferentes tipos de eventos
    console.log(`Handling event type ${event.type}`);
    // ... tu código para manejar los eventos ...

    // Respuesta de éxito para acusar recibo del evento
    response.status(200).send('Evento recibido');
  } catch (err) {
    console.error(`Error handling event ${event.type}: ${err.message}`);
    response.status(500).send(`Server Error: ${err.message}`);
  }
});

app.listen(4242, () => console.log('Servidor ejecutándose en el puerto 4242'));

