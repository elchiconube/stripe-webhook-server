require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const app = express();

const endpointSecret = 'whsec_883bbba51d722444b0126061b0fb347d8ce96f8e513369a76a758987b0c7f43c'

// Middleware para manejar el cuerpo de la solicitud en bruto
app.use('/webhook', express.raw({type: 'application/json'}));

app.post('/webhook', (request, response) => {
    const sig = request.headers['stripe-signature'];

    console.log('Webhook received with signature:', sig);

    let event;

    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
        console.log('Webhook event constructed:', event.type);
    } catch (err) {
        console.error(`Error in webhook signature verification: ${err.message}`);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Aquí puedes añadir la lógica para manejar los diferentes tipos de eventos
        switch (event.type) {
            case 'checkout.session.completed':
                console.log('Checkout session completed event received');
                // Lógica para manejar evento checkout.session.completed
                break;
            // Añadir más casos para otros tipos de eventos según sea necesario
            default:
                console.warn(`Unhandled event type: ${event.type}`);
        }

        response.status(200).send('Event processed');
    } catch (err) {
        console.error(`Error handling event ${event.type}: ${err}`);
        response.status(500).send('Server Error');
    }
});

app.get('/', async (req, res) => {
    res.send('Hello World!');
})

app.listen(process.env.PORT, () => console.log('Server running on port 3003'));
