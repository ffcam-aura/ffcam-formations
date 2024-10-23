import { sql } from '@vercel/postgres';

export async function getDb() {
  return sql;
}
