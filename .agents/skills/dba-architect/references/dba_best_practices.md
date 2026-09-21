# UMANI DBA & Performance Standards

This document serves as the absolute truth for database performance and structuring standards within the UMANI platform.

## 1. Core DBA Philosophy: "Simplicity is Scalable"
Do not jump to caching, sharding, or complex microservices. A well-normalized PostgreSQL schema with proper indexing can easily handle millions of rows and thousands of TPS. 

**Before Optimizing, Ask:**
1. Does it solve a problem we have right now?
2. Can we change this later? (Is the architecture loosely coupled?)
3. Is it measurable? (Are we basing this on `pg_stat_statements`?)

## 2. Diagnosing Bottlenecks
*   **`EXPLAIN ANALYZE`:** The single most important tool. Look for `Seq Scan` (Sequential Scans) on large tables. Ensure the planner is utilizing indexes properly.
*   **`pg_stat_statements`:** Must be enabled to find the top 10 slowest or most frequently executed queries.

## 3. Indexing Strategies
*   **B-Tree**: The default index. Use for equality (`=`) and range (`<`, `>`) filtering on UUIDs, timestamps, and numeric IDs.
*   **Partial Indexes**: e.g., `CREATE INDEX idx_active_users ON users (id) WHERE status = 'active';`. Highly recommended to save disk space and update overhead.
*   **GiST**: Mandatory for `daterange` overlapping logic. UMANI explicitly relies on GiST for zero double-booking concurrency.
*   **GIN**: Mandatory for searching inside `jsonb` columns or arrays.

## 4. Query Anti-Patterns
*   **Avoid `SELECT *`**: Always specify columns. `SELECT *` wastes network bandwidth and memory, especially if the table schema changes or includes large text/jsonb blobs.
*   **N+1 Query Problem**: Avoid looping over results to make more database queries. Use `JOIN` or Supabase's built-in PostgREST relationship querying.
*   **Correlated Subqueries**: Replace nested subqueries that run per-row with proper `LEFT JOIN` or `INNER JOIN` logic where possible.
