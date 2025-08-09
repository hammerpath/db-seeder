export interface RelationalRepository {
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
    truncateTable(tableName: string, options?: TruncateSingleTableOptions): Promise<void>;
    /**
   * Truncate all tables in the database.
   */
    truncateTables(options?: TruncateAllTablesOptions): Promise<void>;

    /**
   * Insert a row in the specified database table.
   * @param tableName The name of the table to insert into.
   * @param values A JSON formated entity to insert. 
   * @param primaryKey The name of the primary key column.
   */
    insert(tableName: string, values: Record<string, string | number>, primaryKey: string): Promise<number | string>;

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
}

export type TruncateSingleTableOptions = {
    cascade?: boolean,
    restartIdentity?: boolean
}

export type TruncateAllTablesOptions = Omit<TruncateSingleTableOptions, "cascade">;
