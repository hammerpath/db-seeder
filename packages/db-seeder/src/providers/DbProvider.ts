import { TruncateSingleTableOptions, TruncateAllTablesOptions } from "../repositories/RelationalDbRepository";
import { Entity } from "../repositories/types";

export interface DbProvider {
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
   * @param entity A JSON formated entity to insert. 
   */
  insert(tableName: string, entity: Entity | Entity[]): Promise<void>;
  /**
   * Get all rows from the specified database table.
   * @param tableName The name of the table to get rows from.
   */
  getRows(tableName: string): Promise<Entity[]>;
}
