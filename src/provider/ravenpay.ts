import axios from 'axios';
import qs from 'qs';

export class RavenPayProvider {
    private readonly baseUrl = 'https://integrations.getravenbank.com/v1';
    private readonly apiKey: string;

    constructor() {
        const apiKey = process.env.RAVENPAY_API_KEY;
        if (!apiKey) {
            throw new Error('RAVENPAY_API_KEY is required');
        }
        this.apiKey = apiKey;
    }

    private getHeaders() {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }

    async generateBankAccount(params: {
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
        amount: number;
    }) {
        try {
            const data = qs.stringify({
                first_name: params.firstName,
                last_name: params.lastName,
                phone: params.phone,
                amount: params.amount.toString(),
                email: params.email
            });

            const response = await axios({
                method: 'post',
                url: `${this.baseUrl}/pwbt/generate_account`,
                headers: this.getHeaders(),
                data
            });

            return response.data;
        } catch (error) {
            console.error('RavenPay generate account error:', error);
            throw error;
        }
    }

    async generateTransferVirtualAccount() {
        // 'https://integrations.getravenbank.com/v1/web/generate_virtual_account' 

    }

    async getAccountBalance(accountNumber: string) {
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseUrl}/pwbt/balance/${accountNumber}`,
                headers: this.getHeaders()
            });

            return response.data;
        } catch (error) {
            console.error('RavenPay get balance error:', error);
            throw error;
        }
    }

    async transferFunds(params: {
        fromAccount: string;
        bank: string;
        bankCode: string;
        accountNumber: string;
        amount: number;
        narration?: string;
    }) {
        try {
            const data = qs.stringify({
                bank: params.bank,
                bank_code: params.bankCode,
                amount: params.amount.toString(),
                account_number: params.accountNumber,   
                narration: params.narration || 'Bulk Fund Transfer',
                reference: `TRF-${Date.now()}-${Math.random().toString(36).substring(7)}`
            });

            const response = await axios({
                method: 'post',
                url: `${this.baseUrl}/transfers/create`,
                headers: this.getHeaders(),
                data
            });

            return response.data;
        } catch (error) {
            console.error('RavenPay transfer error:', error);
            throw error;
        }
    }

    async getTransactionHistory(accountNumber: string, params?: {
        page?: number;
        perPage?: number;
        startDate?: string;
        endDate?: string;
    }) {
        try {
            const queryParams = qs.stringify(params);
            const response = await axios({
                method: 'get',
                url: `${this.baseUrl}/pwbt/transactions/${accountNumber}?${queryParams}`,
                headers: this.getHeaders()
            });

            return response.data;
        } catch (error) {
            console.error('RavenPay transaction history error:', error);
            throw error;
        }
    }

    async verifyBankAccount(accountNumber: string) {
        try {
            const response = await axios({
                method: 'get',
                url: `${this.baseUrl}/pwbt/verify_account/${accountNumber}`,
                headers: this.getHeaders()
            });

            return response.data;
        } catch (error) {
            console.error('RavenPay verify account error:', error);
            throw error;
        }
    }
}


