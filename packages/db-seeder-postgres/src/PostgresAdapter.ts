import { DbAdapter, Entity } from "db-seeder";
import { Repository } from "./repositories/Repository";

export default class PostgresAdapter implements DbAdapter {
  private repo;

  constructor(repo: Repository) {
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

  private async unwrapAndInsert(tableName: string, entity: Entity): Promise<string | number> {
    // Deal with the foreign keys first.
    const arrayValues = Object.entries(entity).filter(([, val]) => Array.isArray(val)) as [string, any[]][];
    const fks = [];
    for (const [key, value] of arrayValues) {
      for (const entity of value) {
        const result = await this.unwrapAndInsert(key, entity);
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
    }

    const pks = await this.repo.getPrimaryKeys(tableName);

    if (pks.length === 0) {
      throw new Error(`No primary key found for table ${tableName}`);
    }

    if (pks.length > 1) {
      throw new Error("No support for composite keys");
    }

    const entityWithoutPayloadForeignKeys = Object.fromEntries(
      Object.entries(entity).filter(([key]) => !arrayValues.map(([key]) => key).includes(key))
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
    // TODO - format before insert
    const result = await this.repo.insert(tableName, entityWithForeignKeys, pks[0]);

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


  private formatValuesForDb(entity: Entity, replacements?: Replecement[]) {
    let obj: Record<string, any> = {};
    for (const [key, value] of Object.entries(entity)) {
      const replacement = replacements?.find(
        (r) => r.foreignKeyTableReference === key
      );
      let k = replacement?.foreignKeyColumn ?? key;

      let val = replacement?.foreignKeyValue ?? value;
      if (typeof value === "string" || value instanceof String) {
        val = `'${value}'`;
      }

      obj[k] = val;
    }

    return obj;
  }
}

type Replecement = {
  foreignKeyValue: number | string;
  foreignKeyColumn: string;
  foreignKeyTableReference: string;
};