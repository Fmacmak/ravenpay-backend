"use strict";
// import { Application, Request, Response } from "express";
// import db from "../db";
// import { auth } from "../middleware/auth";
// import { RavenPayProvider } from '../provider/ravenpay';
// interface receipts {
//     action: string,
//     status: 'success' | 'fail'
//     reason: string,
//     details?: string
// }
// export class TransactionService {
//     private static ravenPay = new RavenPayProvider();
//     public static async registerRoutes(app: Application) {
//         app.post('/accounts', auth, TransactionService.createBankAccount);
//         app.get('/accounts/:accountId/balance', auth, TransactionService.getBalance);
//         app.post('/accounts/transfer', auth, TransactionService.transferFunds);
//         app.get('/accounts/:accountId/transactions', auth, TransactionService.getTransactions);
//         app.post('/accounts/bulk-transfer', TransactionService.bulkTransfer ); //deducts from main balance, all the total in n seperate transfers. 
//         app.get('/beneficiaries', auth, TransactionService.getBeneficiaries);
//         app.post('/beneficiaries', auth, TransactionService.saveBeneficiary);
//     }
//     public static async createBankAccount(req: Request, res: Response) {
//         try {
//             const userId = req.user?.id;
//             const { firstName, lastName, phone, email } = req.body;
//             // Create Raven bank account
//             const ravenAccount = await TransactionService.ravenPay.generateBankAccount({
//                 firstName,
//                 lastName,
//                 phone,
//                 email,
//                 amount: 0 // Initial balance
//             });
//             // Store in local database
//             const [accountId] = await db('bank_accounts').insert({
//                 user_id: userId,
//                 account_number: ravenAccount.account_number,
//                 balance: 0
//             });
//             const account = await db('bank_accounts')
//                 .where('id', accountId)
//                 .first();
//             res.status(201).json({
//                 status: 'ok',
//                 account: {
//                     ...account,
//                     raven_details: ravenAccount
//                 }
//             });
//         } catch (error) {
//             console.error('Create account error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
//     public static async getBalance(req: Request, res: Response) {
//         try {
//             const { accountId } = req.params;
//             const userId = req.user?.id;
//             const account = await db('bank_accounts')
//                 .where({
//                     'id': accountId,
//                     'user_id': userId
//                 })
//                 .first();
//             if (!account) {
//                 return res.status(404).json({ status: 'error', message: 'Account not found' });
//             }
//             res.status(200).json({
//                 status: 'ok',
//                 balance: account.balance
//             });
//         } catch (error) {
//             console.error('Get balance error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
//     public static async transferFunds(req: Request, res: Response) {
//         try {
//             const { fromAccountId, toAccountId, amount, description } = req.body;
//             const userId = req?.user?.id;
//             // Start transaction
//             await db.transaction(async (trx) => {
//                 // Verify from account belongs to user
//                 const fromAccount = await trx('bank_accounts')
//                     .where({
//                         'id': fromAccountId,
//                         'user_id': userId
//                     })
//                     .first();
//                 if (!fromAccount) {
//                     throw new Error('Source account not found');
//                 }
//                 if (fromAccount.balance < amount) {
//                     throw new Error('Insufficient funds');
//                 }
//                 // Verify destination account exists
//                 const toAccount = await trx('bank_accounts')
//                     .where('id', toAccountId)
//                     .first();
//                 if (!toAccount) {
//                     throw new Error('Destination account not found');
//                 }
//                 // Update balances
//                 await trx('bank_accounts')
//                     .where('id', fromAccountId)
//                     .decrement('balance', amount);
//                 await trx('bank_accounts')
//                     .where('id', toAccountId)
//                     .increment('balance', amount);
//                 // Record transaction
//                 await trx('transactions').insert({
//                     from_account_id: fromAccountId,
//                     to_account_id: toAccountId,
//                     amount,
//                     type: 'transfer',
//                     description
//                 });
//             });
//             res.status(200).json({
//                 status: 'ok',
//                 message: 'Transfer successful'
//             });
//         } catch (error) {
//             console.error('Transfer error:', error);
//             res.status(400).json({ 
//                 status: 'error', 
//                 message: error.message || 'Transfer failed' 
//             });
//         }
//     }
//     public static async getTransactions(req: Request, res: Response) {
//         try {
//             const { accountId } = req.params;
//             const userId = req.user?.id;
//             // Verify account belongs to user
//             const account = await db('bank_accounts')
//                 .where({
//                     'id': accountId,
//                     'user_id': userId
//                 })
//                 .first();
//             if (!account) {
//                 return res.status(404).json({ status: 'error', message: 'Account not found' });
//             }
//             // Get all transactions involving this account
//             const transactions = await db('transactions')
//                 .where('from_account_id', accountId)
//                 .orWhere('to_account_id', accountId)
//                 .orderBy('created_at', 'desc');
//             res.status(200).json({
//                 status: 'ok',
//                 transactions
//             });
//         } catch (error) {
//             console.error('Get transactions error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
//     public static async bulkTransfer(req: Request, res: Response){
//         try {
//             console.log(req.body); //array of the bank accounts to transfer to, account number, bank code, amount
//             const bulkRecipients = req.body;
//             const receipts: receipts[] = [];
//             for (let individual of bulkRecipients){ //track if any fail and reason why they fail 
//                 try {
//                     await TransactionService.ravenPay.transferFunds(individual);
//                     receipts.push({
//                         action: "transfer",
//                         status: "success",
//                         details: JSON.stringify(individual),
//                         reason: "Transaction completed successfully"
//                     })
//                 }catch(error){
//                     console.log("Failed individual bulk transfer", error);
//                     receipts.push({
//                         action: "transfer",
//                         status: "fail",
//                         reason: String(error),
//                         details: JSON.stringify(individual)
//                     })
//                 }
//                 res.status(200).json({
//                     status: 'ok',
//                     message: 'bulk transfers complete',
//                     receipts: receipts
//                 });
//             }
//         } catch (error) {
//             console.error('bulk transfer error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
//     public static async getBeneficiaries(req: Request, res: Response) {
//         try {
//             const userId = req.user?.id;
//             const beneficiaries = await db('beneficiaries')
//                 .where('user_id', userId)
//                 .select();
//             res.json({ status: 'ok', beneficiaries });
//         } catch (error) {
//             console.error('Get beneficiaries error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
//     public static async saveBeneficiary(req: Request, res: Response) {
//         try {
//             const userId = req.user?.id;
//             const { account_number, bank_code, bank_name, account_name } = req.body;
//             const [beneficiaryId] = await db('beneficiaries').insert({
//                 user_id: userId,
//                 account_number,
//                 bank_code,
//                 bank_name,
//                 account_name
//             });
//             res.status(201).json({
//                 status: 'ok',
//                 beneficiary: {
//                     id: beneficiaryId,
//                     account_number,
//                     bank_code,
//                     bank_name,
//                     account_name
//                 }
//             });
//         } catch (error) {
//             console.error('Save beneficiary error:', error);
//             res.status(500).json({ status: 'error', message: 'Internal server error' });
//         }
//     }
// }
