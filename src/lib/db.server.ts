// MySQL connection pool for Hostinger (Node runtime)
import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function cleanEnv(value: string | undefined): string | undefined {
  const cleaned = value?.trim().replace(/^['"]|['"]$/g, "");
  return cleaned || undefined;
}

export function getPool(): mysql.Pool {
  if (pool) return pool;
  const rawHost = cleanEnv(process.env.DB_HOST) || "127.0.0.1";
  const host = rawHost === "localhost" || rawHost === "::1" ? "127.0.0.1" : rawHost;
  const user = cleanEnv(process.env.DB_USER);
  const password = cleanEnv(process.env.DB_PASS);
  const database = cleanEnv(process.env.DB_NAME);
  if (!user || !password || !database) {
    throw new Error("DB_USER / DB_PASS / DB_NAME env variables missing");
  }
  pool = mysql.createPool({
    host,
    port: Number(process.env.DB_PORT || 3306),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    charset: "utf8mb4",
    timezone: "Z",
  });
  return pool;
}

export async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params);
  return rows as T[];
}

export async function qOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await q<T>(sql, params);
  return rows[0] ?? null;
}

export async function exec(sql: string, params: any[] = []): Promise<mysql.ResultSetHeader> {
  const [result] = await getPool().execute(sql, params);
  return result as mysql.ResultSetHeader;
}
