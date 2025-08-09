import { TruncateSingleTableOptions, TruncateAllTablesOptions } from "../repositories/RelationalRepository";

export interface RelationalDbProvider {
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
   * @param entity A JSON formated entity to insert. 
   */
  insert(tableName: string, entity: Entity | Entity[]): Promise<void>;
}

export type Entity = {
  [key: string]: string | number | Entity;
}
