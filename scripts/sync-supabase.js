import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: 'db.zpyjixhgpftgxgtjfsca.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '+AgriBNV!@#7',
  ssl: {
    rejectUnauthorized: false
  }
};

async function runSync() {
  const client = new pg.Client(dbConfig);

  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');

  try {
    const setupSqlPath = path.resolve(__dirname, '../supabase/setup.sql');
    const reviewsSqlPath = path.resolve(__dirname, '../supabase/migrations/20260714084846_add_reviews_table.sql');

    const setupSql = fs.readFileSync(setupSqlPath, 'utf8');
    const reviewsSql = fs.readFileSync(reviewsSqlPath, 'utf8');

    console.log('Applying setup.sql (tables, enums, triggers, RLS, storage, realtime)...');
    await client.query(setupSql);
    console.log('setup.sql applied successfully!');

    console.log('Applying reviews migration...');
    // Make sure reviews view uses security_invoker = true
    const reviewsSqlClean = reviewsSql.replace(
      /CREATE VIEW public\.property_ratings AS/i,
      'CREATE OR REPLACE VIEW public.property_ratings WITH (security_invoker = true) AS'
    );
    await client.query(reviewsSqlClean);
    console.log('reviews migration applied successfully!');

    // Verify all tables and views in public schema
    console.log('\n--- VERIFYING PUBLIC SCHEMA TABLES & VIEWS ---');
    const tablesRes = await client.query(`
      SELECT table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_type, table_name;
    `);

    console.table(tablesRes.rows);

    // Verify RLS policies
    console.log('\n--- VERIFYING RLS POLICIES ---');
    const policiesRes = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
      ORDER BY tablename, policyname;
    `);

    console.table(policiesRes.rows);

    // Verify storage buckets
    console.log('\n--- VERIFYING STORAGE BUCKETS ---');
    const bucketsRes = await client.query(`
      SELECT id, name, public FROM storage.buckets;
    `);
    console.table(bucketsRes.rows);

    console.log('\nSync completed successfully!');
  } catch (err) {
    console.error('Error during sync:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSync();
