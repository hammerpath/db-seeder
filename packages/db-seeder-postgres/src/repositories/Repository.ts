import { DbAdapter } from "db-seeder";

export interface Repository {
    getTableNames(): Promise<string[]>;

    truncateTable(tableName: string): Promise<void>;
    truncateTables(): Promise<void>;

    insert(tableName: string, values: Record<string, string | number>, primaryKey: string): Promise<number | string>;

    getPrimaryKeys(tableName: string): Promise<string[]>;
    getForeignKeys(tableName: string, linkedTableName: string): Promise<string[]>;
}