import { DbProvider } from "./DbProvider";
import { TruncateSingleTableOptions, TruncateAllTablesOptions, RelationalDbRepository } from "../repositories/RelationalDbRepository";
import { Entity, JsonValue } from "../repositories/types";

export default class RelationalDbProvider implements DbProvider {
  private repo;

  constructor(repo: RelationalDbRepository) {
    this.repo = repo;
  }

  async closeConnection(): Promise<void> {
    await this.repo.closeConnection();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.repo.testConnection();
      return true;
    } catch (error) {
      return false;
    }
  }

  async getTableNames(): Promise<string[]> {
    return await this.repo.getTableNames();
  }

  async truncateTable(tableName: string, options: TruncateSingleTableOptions): Promise<void> {
    await this.repo.truncateTable(tableName, options);
  }

  async truncateTables(options: TruncateAllTablesOptions): Promise<void> {
    await this.repo.truncateTables(options);
  }

  private isEntity(val: unknown): val is Entity {
    return typeof val === 'object' && val !== null;
  }

  private isJsonColumn(columnTypes: Record<string, string>, key: string): boolean {
    return ['json', 'jsonb'].includes(columnTypes[key]);
  }

  private async unwrapAndInsert(tableName: string, entity: Entity): Promise<Record<string, string | number>> {
    const columnTypes = await this.repo.getColumnTypes(tableName);

    const foreignEntities = Object.entries(entity).filter(
      (entry): entry is [string, Entity] => this.isEntity(entry[1]) && !this.isJsonColumn(columnTypes, entry[0])
    );
    const fks = [];
    for (const [key, value] of foreignEntities) {
      const result = await this.unwrapAndInsert(key, value);
      const foreignKeys = await this.repo.getForeignKeys(tableName, key);

      if (foreignKeys.length == 0) {
        throw new Error(
          `Could not find any foreign key reference to table ${key}`
        );
      }

      if (foreignKeys.length > 1) {
        throw new Error(
          "No support for multiple foreign keys referencing the same table."
        );
      }

      const childPkColumns = Object.keys(result);
      if (childPkColumns.length > 1) {
        throw new Error(
          `Cannot use composite-primary-key table '${key}' as a nested foreign-key reference from '${tableName}'`
        );
      }

      fks.push({
        [foreignKeys[0]]: result[childPkColumns[0]]
      });

    }

    const pks = await this.repo.getPrimaryKeys(tableName);

    if (pks.length === 0) {
      throw new Error(`No primary key found for table ${tableName}`);
    }

    const foreignEntityKeys = foreignEntities.map(([key]) => key);
    const entityWithoutPayloadForeignKeys = Object.fromEntries(
      Object.entries(entity).filter(([key]) => !foreignEntityKeys.includes(key))
    );

    const entityWithForeignKeys = {
      ...entityWithoutPayloadForeignKeys,
      ...fks.reduce((acc, cur) => {
        return {
          ...acc,
          ...cur
        };
      }, {})
    }

    const formattedEntity = this.formatValuesForDb(entityWithForeignKeys, columnTypes);

    const result = await this.repo.insert(tableName, formattedEntity, pks);

    return result;
  }

  async insert(tableName: string, entity: Entity | Entity[]): Promise<void> {
    if (Array.isArray(entity)) {
      for (const [, value] of Object.entries(entity)) {
        await this.unwrapAndInsert(tableName, value);
      }
    } else {
      await this.unwrapAndInsert(tableName, entity);
    }
  }

  async getRows(tableName: string): Promise<Entity[]> {
    return await this.repo.getRows(tableName);
  }

  private formatValuesForDb(entity: Entity, columnTypes: Record<string, string>): Record<string, string | number> {
    return Object.fromEntries(
      Object.entries(entity).map(([key, value]) => [key, this.formatValueForDb(key, value, columnTypes)])
    );
  }

  private formatValueForDb(key: string, value: JsonValue, columnTypes: Record<string, string>): string | number {
    if (this.isJsonColumn(columnTypes, key)) {
      return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
    }

    if (typeof value === "number") {
      return value;
    }

    return `'${value}'`;
  }
}
