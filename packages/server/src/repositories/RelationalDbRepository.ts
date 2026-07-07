import { Entity } from "./types";

export interface RelationalDbRepository {
    /**
   * Test the connection to the database.
   */
    testConnection(): Promise<boolean>;
    /**
   * Close the connection to the database.
   */
    closeConnection(): Promise<void>;

    /**
   * Get all the names of the tables in the database.
   */
    getTableNames(): Promise<string[]>;

    /**
   * Truncate a single table in the database.
   * @param tableName The name of the table to truncate.
   */
    truncateTable(tableName: string, options: TruncateSingleTableOptions): Promise<void>;
    /**
   * Truncate all tables in the database.
   */
    truncateTables(options: TruncateAllTablesOptions): Promise<void>;

    /**
   * Insert a row in the specified database table.
   * @param tableName The name of the table to insert into.
   * @param values A JSON formated entity to insert.
   * @param primaryKeys The names of the primary key columns. Pass one column for
   *                   tables with a single-column PK, or multiple for composite PKs.
   * @returns A record mapping each primary key column to the inserted row's value
   *          for that column. For a single-column PK this is e.g. `{ id: 42 }`;
   *          for a composite PK e.g. `{ order_key: "O-001", row_position: 1 }`.
   */
    insert(tableName: string, values: Record<string, string | number>, primaryKeys: string[]): Promise<Record<string, string | number>>;
    /**
   * Get all rows from the specified database table.
   * @param tableName The name of the table to get rows from.
   */
    getRows(tableName: string): Promise<Entity[]>;

    /**
   * Get the primary keys of the specified table.
   * @param tableName The name of the table to get the primary keys from.
   */
    getPrimaryKeys(tableName: string): Promise<string[]>;
    /**
   * Get the foreign keys of the specified table.
   * @param tableName The name of the table to get the foreign keys from.
   * @param linkedTableName The name of the linked table.
   */
    getForeignKeys(tableName: string, linkedTableName: string): Promise<string[]>;

    /**
   * Get the column data types of the specified table, keyed by column name.
   * @param tableName The name of the table to inspect.
   * @returns A record mapping each column name to its database data type,
   *          e.g. `{ id: "integer", metadata: "jsonb" }`.
   */
    getColumnTypes(tableName: string): Promise<Record<string, string>>;
}

export type TruncateSingleTableOptions = {
    cascade: boolean,
    restartIdentity: boolean
}

export type TruncateAllTablesOptions = Omit<TruncateSingleTableOptions, "cascade">;
