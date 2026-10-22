import { Pool } from 'pg';

// 개발 서버가 코드를 다시 불러와도 연결 풀은 하나만 쓴다.
const globalForDb = globalThis;

export const pool =
  globalForDb.praisePool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

if (process.env.NODE_ENV !== 'production') globalForDb.praisePool = pool;
