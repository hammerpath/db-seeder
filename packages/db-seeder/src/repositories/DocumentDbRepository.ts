import { Entity } from "./types";

export interface DocumentDbRepository {
    testConnection(): Promise<boolean>;
    closeConnection(): Promise<void>;
    getTableNames(): Promise<string[]>;
    truncateTable(tableName: string): Promise<void>;
    truncateTables(): Promise<void>;
    insert(tableName: string, values: Record<string, string | number | Entity>): Promise<void>;
}