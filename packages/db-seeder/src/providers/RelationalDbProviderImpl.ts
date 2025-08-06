import { RelationalDbProvider, Entity } from "./RelationalDbProvider";
import { RelationalRepository } from "../repositories/RelationalRepository";

export default class RelationalDbProviderImpl implements RelationalDbProvider {
  private repo;

  constructor(repo: RelationalRepository) {
    this.repo = repo;
  }

  async testConnection(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  async getTableNames(): Promise<string[]> {
    return await this.repo.getTableNames();
  }

  async truncateTable(tableName: string): Promise<void> {
    await this.repo.truncateTable(tableName);
  }

  async truncateTables(): Promise<void> {
    const tableNames = await this.repo.getTableNames();

    tableNames.forEach(async (tableName) => {
      await this.truncateTable(tableName);
    });
  }

  private isEntity(val: unknown): val is Entity {
    return typeof val === 'object' && val !== null;
  }

  private async unwrapAndInsert(tableName: string, entity: Entity): Promise<string | number> {
    const foreignEntities = Object.entries(entity).filter((entry): entry is [string, Entity] => this.isEntity(entry[1]));
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

      fks.push({
        [foreignKeys[0]]: result
      });

    }

    const pks = await this.repo.getPrimaryKeys(tableName);

    if (pks.length === 0) {
      throw new Error(`No primary key found for table ${tableName}`);
    }

    if (pks.length > 1) {
      throw new Error("No support for composite keys");
    }

    const entityWithoutPayloadForeignKeys = Object.fromEntries(
      Object.entries(entity).filter(([key]) => !foreignEntities.map(([key]) => key).includes(key))
    ) as { [k: string]: string | number }; // TODO dont cast this

    const entityWithForeignKeys = {
      ...entityWithoutPayloadForeignKeys,
      ...fks.reduce((acc, cur) => {
        return {
          ...acc,
          ...cur
        };
      }, {})
    }

    const formattedEntity = this.formatValuesForDb(entityWithForeignKeys);

    const result = await this.repo.insert(tableName, formattedEntity, pks[0]);

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

  private formatValuesForDb(entity: Entity) {
    let obj: Record<string, any> = {};
    for (const [key, value] of Object.entries(entity)) {
      let val = value;
      if (typeof value === "string" || value instanceof String) {
        val = `'${value}'`;
      }

      obj[key] = val;
    }

    return obj;
  }
}
