import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import db  from './db';
import axios from 'axios';
import qs from 'qs';

// import { TransactionService } from './services/transaction.service';
// import { WebhookService } from './services/webhooks.service';
// import { AuthenticationService } from './services/authentication.service';

// Load environment variables
dotenv.config();

// Initialize express
const app: Application = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Basic health check route
app.post('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.get('/db/health', async (req: Request, res: Response) => {
    try {
        // Simple query to check database connection
        await db.select().from('users').limit(1);
        res.status(200).json({ status: 'healthy' });
    } catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
});

app.post('/api/transfer', async (req: Request, res: Response) => {

  try {
    const {
      amount,
      bank_code,
      bank,
      account_name,
      account_number,
      narration,
      reference,
      currency,
    } = req.body;

    console.log(req.body);
    // Validate required fields
    if (!amount || !bank_code || !bank || !account_name || !account_number || !reference || !currency) {
       res.status(400).json({
        status: 'fail',
        message: '(amount) not found in request body || (bank) not found in request body || (account_number) not found in request body || (account_name) not found in request body || (bank_code) not found in request body || (reference) not found in request body || (currency) not found in request body'
      });
      return;
    }

    let data = {
      amount: amount,
      bank_code: bank_code,
      bank: bank,
      account_number: account_number,
      account_name: account_name,
      narration: narration,
      reference: reference,
      currency: currency,
    };

    console.log(data);
    let config = {
      method: "post",
      url: "https://integrations.getravenbank.com/v1/transfers/create",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RAVENPAY_SECRET_KEY}`
      },
      data: data,
    };

    let response = await axios.post(config.url, data, {headers: config.headers})
    console.log(response.data);
  
    res.status(200).json({ message: "Transfer created successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to execute transfer" });
    return;
  }
});

// //register routes
// AuthenticationService.registerRoutes(app);
// TransactionService.registerRoutes(app);
// WebhookService.registerRoutes(app); 



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

export default app;
