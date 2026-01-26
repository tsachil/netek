import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './config/passport'; // Import passport config
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import accountRoutes from './routes/accounts';
import transactionRoutes from './routes/transactions';
import pg from 'pg';
const pgSession = require('connect-pg-simple')(session);

dotenv.config();

if (!process.env.SESSION_SECRET) {
    throw new Error('FATAL: SESSION_SECRET is not defined.');
}

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('FATAL: Google OAuth credentials are missing.');
}

const app = express();
const port = process.env.PORT || 5000;
const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL
});

app.use(cors({
  origin: 'http://localhost:3030', // Allow frontend
  credentials: true
}));
app.use(express.json());

app.use(session({
  store: new pgSession({
    pool: pgPool,
    tableName: 'Session', // Use the capitalized table name from Prisma
    createTableIfMissing: false
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
      secure: false, // Set to true in production
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  } 
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Banker Dashboard API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
