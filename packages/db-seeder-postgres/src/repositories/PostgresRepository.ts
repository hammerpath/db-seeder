import { Pool } from "pg";
import type { RelationalRepository } from "db-seeder-server";

export default class PostgresRepository implements RelationalRepository {
    private pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
    }

    async testConnection(): Promise<boolean> {
        await this.pool.query("SELECT 1;");
        return true;
    }

    async getTableNames(): Promise<string[]> {
        const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';
      `);

        return result.rows.map((row) => row.table_name);
    }

    async truncateTable(tableName: string): Promise<void> {
        await this.pool.query(`TRUNCATE TABLE ${tableName};`);
    }

    async truncateTables(): Promise<void> {
        const tableNames = await this.getTableNames();

        tableNames.forEach(async (tableName) => {
            await this.truncateTable(tableName);
        });
    }

    async insert(tableName: string, values: Record<string, string | number>, primaryKey: string): Promise<number | string> {
        const result = await this.pool.query(
            `INSERT INTO ${tableName}(${Object.keys(values).join(",")}) VALUES(${Object.values(values).join(",")}) RETURNING ${primaryKey};`
        );

        return result.rows[0][primaryKey];
    }

    async getPrimaryKeys(tableName: string): Promise<string[]> {
        const result = await this.pool.query(`
            SELECT
          kcu.column_name
      FROM
          information_schema.table_constraints tc
      JOIN
          information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.constraint_schema = kcu.constraint_schema
      WHERE
          tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_name = '${tableName}';
            `);

        return result.rows.map((res) => res.column_name);
    }

    async getForeignKeys(tableName: string, linkedTableName: string): Promise<string[]> {
        const result = await this.pool.query(
            `SELECT
          kcu.column_name
      FROM
          information_schema.table_constraints tc
      JOIN
          information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.constraint_schema = kcu.constraint_schema
      JOIN
          information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
          AND tc.constraint_schema = rc.constraint_schema
      JOIN
          information_schema.constraint_column_usage ccu
          ON rc.unique_constraint_name = ccu.constraint_name
          AND rc.unique_constraint_schema = ccu.constraint_schema
      WHERE
          tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = '${tableName}'
          AND ccu.table_name = '${linkedTableName}';`
        );

        return result.rows.map((res) => res.column_name);
    }
}
