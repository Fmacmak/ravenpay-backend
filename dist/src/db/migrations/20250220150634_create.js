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
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Users table
        yield knex.schema.createTable('users', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
            table.string('email').unique().notNullable();
            table.string('password').notNullable();
            table.string('first_name').notNullable();
            table.string('last_name').notNullable();
            table.enum('kyc_status', ['pending', 'approved', 'rejected']).defaultTo('pending');
            table.timestamps(true, true);
        });
        // Bank accounts table
        yield knex.schema.createTable('bank_accounts', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.decimal('balance', 15, 2).defaultTo(0);
            table.string('account_number').unique().notNullable();
            table.timestamps(true, true);
        });
        // Transactions table
        yield knex.schema.createTable('transactions', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
            table.uuid('from_account_id').references('id').inTable('bank_accounts');
            table.uuid('to_account_id').references('id').inTable('bank_accounts');
            table.decimal('amount', 15, 2).notNullable();
            table.enum('type', ['deposit', 'withdrawal', 'transfer']).notNullable();
            table.string('description').nullable();
            table.timestamps(true, true);
        });
        // Beneficiaries table
        yield knex.schema.createTable('beneficiaries', (table) => {
            table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.string('account_number').notNullable();
            table.string('bank_code').notNullable();
            table.string('bank_name').notNullable();
            table.string('account_name').notNullable();
            table.timestamps(true, true);
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        // Drop tables in reverse order to handle foreign key constraints
        yield knex.schema.dropTableIfExists('transactions');
        yield knex.schema.dropTableIfExists('beneficiaries');
        yield knex.schema.dropTableIfExists('bank_accounts');
        yield knex.schema.dropTableIfExists('users');
    });
}
