import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './config/passport'; // Import passport config
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import accountRoutes from './routes/accounts';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using https
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/accounts', accountRoutes);

app.get('/', (req, res) => {
  res.send('Banker Dashboard API is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
