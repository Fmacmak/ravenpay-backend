"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = __importDefault(require("./db"));
const axios_1 = __importDefault(require("axios"));
// import { TransactionService } from './services/transaction.service';
// import { WebhookService } from './services/webhooks.service';
// import { AuthenticationService } from './services/authentication.service';
// Load environment variables
dotenv_1.default.config();
// Initialize express
const app = (0, express_1.default)();
// Middleware
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Basic health check route
app.post('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});
app.get('/db/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Simple query to check database connection
        yield db_1.default.select().from('users').limit(1);
        res.status(200).json({ status: 'healthy' });
    }
    catch (error) {
        console.error('Database health check failed:', error);
        res.status(500).json({ status: 'unhealthy', error: 'Database connection failed' });
    }
}));
app.post('/api/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, bank_code, bank, account_name, account_number, narration, reference, currency, } = req.body;
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
        let response = yield axios_1.default.post(config.url, data, { headers: config.headers });
        console.log(response.data);
        res.status(200).json({ message: "Transfer created successfully" });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to execute transfer" });
        return;
    }
}));
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
exports.default = app;
