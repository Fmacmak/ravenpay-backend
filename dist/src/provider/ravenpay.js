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
exports.RavenPayProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
class RavenPayProvider {
    constructor() {
        this.baseUrl = 'https://integrations.getravenbank.com/v1';
        const apiKey = process.env.RAVENPAY_API_KEY;
        if (!apiKey) {
            throw new Error('RAVENPAY_API_KEY is required');
        }
        this.apiKey = apiKey;
    }
    getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }
    generateBankAccount(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = qs_1.default.stringify({
                    first_name: params.firstName,
                    last_name: params.lastName,
                    phone: params.phone,
                    amount: params.amount.toString(),
                    email: params.email
                });
                const response = yield (0, axios_1.default)({
                    method: 'post',
                    url: `${this.baseUrl}/pwbt/generate_account`,
                    headers: this.getHeaders(),
                    data
                });
                return response.data;
            }
            catch (error) {
                console.error('RavenPay generate account error:', error);
                throw error;
            }
        });
    }
    generateTransferVirtualAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            // 'https://integrations.getravenbank.com/v1/web/generate_virtual_account' 
        });
    }
    getAccountBalance(accountNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, axios_1.default)({
                    method: 'get',
                    url: `${this.baseUrl}/pwbt/balance/${accountNumber}`,
                    headers: this.getHeaders()
                });
                return response.data;
            }
            catch (error) {
                console.error('RavenPay get balance error:', error);
                throw error;
            }
        });
    }
    transferFunds(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = qs_1.default.stringify({
                    bank: params.bank,
                    bank_code: params.bankCode,
                    amount: params.amount.toString(),
                    account_number: params.accountNumber,
                    narration: params.narration || 'Bulk Fund Transfer',
                    reference: `TRF-${Date.now()}-${Math.random().toString(36).substring(7)}`
                });
                const response = yield (0, axios_1.default)({
                    method: 'post',
                    url: `${this.baseUrl}/transfers/create`,
                    headers: this.getHeaders(),
                    data
                });
                return response.data;
            }
            catch (error) {
                console.error('RavenPay transfer error:', error);
                throw new Error("failed becasue bank was not available");
            }
        });
    }
    getTransactionHistory(accountNumber, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const queryParams = qs_1.default.stringify(params);
                const response = yield (0, axios_1.default)({
                    method: 'get',
                    url: `${this.baseUrl}/pwbt/transactions/${accountNumber}?${queryParams}`,
                    headers: this.getHeaders()
                });
                return response.data;
            }
            catch (error) {
                console.error('RavenPay transaction history error:', error);
                throw error;
            }
        });
    }
    verifyBankAccount(accountNumber) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield (0, axios_1.default)({
                    method: 'get',
                    url: `${this.baseUrl}/pwbt/verify_account/${accountNumber}`,
                    headers: this.getHeaders()
                });
                return response.data;
            }
            catch (error) {
                console.error('RavenPay verify account error:', error);
                throw error;
            }
        });
    }
}
exports.RavenPayProvider = RavenPayProvider;
