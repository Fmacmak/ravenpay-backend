import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import db  from './db';


import { TransactionService } from './services/transaction.service';
import { WebhookService } from './services/webhooks.service';
import { AuthenticationService } from './services/authentication.service';

// Load environment variables
dotenv.config();

// Initialize express
const app: Application = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
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

//register routes
AuthenticationService.registerRoutes(app);
TransactionService.registerRoutes(app);
WebhookService.registerRoutes(app); 



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
