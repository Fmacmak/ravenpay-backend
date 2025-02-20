import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('kyc_status', ['pending', 'approved', 'rejected']).defaultTo('pending');
    table.timestamps(true, true);
  });

  // Bank accounts table
  await knex.schema.createTable('bank_accounts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.decimal('balance', 15, 2).defaultTo(0);
    table.string('account_number').unique().notNullable();
    table.timestamps(true, true);
  });

  // Transactions table
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('from_account_id').references('id').inTable('bank_accounts');
    table.uuid('to_account_id').references('id').inTable('bank_accounts');
    table.decimal('amount', 15, 2).notNullable();
    table.enum('type', ['deposit', 'withdrawal', 'transfer']).notNullable();
    table.string('description').nullable();
    table.timestamps(true, true);
  });

  // Beneficiaries table
  await knex.schema.createTable('beneficiaries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('UUID()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('account_number').notNullable();
    table.string('bank_code').notNullable();
    table.string('bank_name').notNullable();
    table.string('account_name').notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order to handle foreign key constraints
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('beneficiaries');
  await knex.schema.dropTableIfExists('bank_accounts');
  await knex.schema.dropTableIfExists('users');
}

