# WorkersHire

A full-stack MERN application to hire skilled workers (Electricians, Plumbers, Painters, Carpenters, etc.) with AI-powered recommendations and Stripe payment integration.

## Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Payments**: Stripe
- **AI**: OpenAI API
- **State Management**: React Context API

## Project Structure

```
WorkersHireMain/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
└── server/          # Node.js backend
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── services/
```

## Setup Instructions

### Backend

```bash
cd server
cp .env.example .env    # Fill in your credentials
npm install
npm run dev             # Runs on http://localhost:5000
```

**Environment Variables (server/.env):**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/workershire
JWT_SECRET=your_jwt_secret_here
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
OPENAI_API_KEY=sk-...
```

### Frontend

```bash
cd client
cp .env.example .env    # Fill in your Stripe public key
npm install
npm start               # Runs on http://localhost:3000
```

**Environment Variables (client/.env):**
```
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
REACT_APP_API_URL=http://localhost:5000/api
```

### Seed Database

```bash
cd server
node seed.js
```

## API Endpoints

| Method | Endpoint                     | Description              | Auth     |
|--------|------------------------------|--------------------------|----------|
| POST   | /api/auth/register           | Register user            | Public   |
| POST   | /api/auth/login              | Login user               | Public   |
| GET    | /api/auth/profile            | Get current user         | Private  |
| GET    | /api/workers                 | List workers (+ filters) | Public   |
| GET    | /api/workers/:id             | Get single worker        | Public   |
| POST   | /api/workers                 | Create worker            | Admin    |
| PUT    | /api/workers/:id             | Update worker            | Admin    |
| DELETE | /api/workers/:id             | Delete worker            | Admin    |
| POST   | /api/bookings                | Create booking           | Private  |
| GET    | /api/bookings                | Get my bookings          | Private  |
| GET    | /api/bookings/:id            | Get booking by ID        | Private  |
| PUT    | /api/bookings/:id            | Update booking status    | Private  |
| DELETE | /api/bookings/:id            | Cancel booking           | Private  |
| POST   | /api/payments/create-intent  | Create Stripe intent     | Private  |
| POST   | /api/payments/confirm        | Confirm payment          | Private  |
| GET    | /api/payments                | Payment history          | Private  |
| POST   | /api/ai/query                | AI chat query            | Private  |
| POST   | /api/ai/recommend            | AI worker recs           | Public   |
| POST   | /api/reviews                 | Create review            | Private  |
| GET    | /api/reviews/worker/:id      | Get worker reviews       | Public   |

## Payment Flow

1. User creates a booking
2. Redirected to Payment page
3. Stripe payment intent created on backend
4. User enters card details (test: 4242 4242 4242 4242)
5. On success → booking status updated to `confirmed`, payment to `paid`

## Features

- ✅ User authentication (JWT)
- ✅ Worker listing with filters (category, location, price, availability)
- ✅ Online booking system
- ✅ Stripe payment integration
- ✅ AI-powered worker recommendations (OpenAI)
- ✅ Booking history with payment status
- ✅ Rating & review system
- ✅ Responsive design (Tailwind CSS)
- ✅ Toast notifications
