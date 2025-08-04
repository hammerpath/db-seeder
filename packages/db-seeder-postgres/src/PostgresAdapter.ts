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

  async insert(tableName: string, entity: Entity | Entity[]): Promise<{ [key: string]: string | number }> {
    if (Array.isArray(entity)) {
      for (const [key, value] of Object.entries(entity)) {
        return await this.insert(tableName, value);
      }
    } else {
      const foreignKeyTables = Object.entries(entity).filter(([key, val]) => Array.isArray(val));
      let foreignKeyInsertResults: { [key: string]: string | number }[] = [];
      // Foreign keys needs to be inserted before the entity
      for (const [foreignKeyTableName, foreignKeyValue] of foreignKeyTables) {
        const foreignKeys = await this.repo.getForeignKeys(tableName, foreignKeyTableName);

        if (foreignKeys.length == 0) {
          throw new Error(
            `Could not find any foreign key reference to table ${foreignKeyTableName}`
          );
        }

        if (foreignKeys.length > 1) {
          throw new Error(
            "No support for multiple foreign keys referencing the same table."
          );
        }

        const result = await this.insert(foreignKeyTableName, foreignKeyValue as Entity[]); // TODO - don't typecast here
        const primaryKeys = await this.repo.getPrimaryKeys(foreignKeyTableName);

        if (primaryKeys.length === 0) {
          throw new Error(`No primary key found for table ${foreignKeyTableName}`);
        }

        if (primaryKeys.length > 1) {
          throw new Error("No support for composite keys");
        }

        foreignKeyInsertResults.push({
          [foreignKeys[0]]: result[primaryKeys[0]]
        });
      }

      const primaryKeys = await this.repo.getPrimaryKeys(tableName);

      if (primaryKeys.length === 0) {
        throw new Error(`No primary key found for table ${tableName}`);
      }

      if (primaryKeys.length > 1) {
        throw new Error("No support for composite keys");
      }

      const entityWithoutPayloadForeignKeys = Object.fromEntries(
        Object.entries(entity).filter(([key]) => !foreignKeyTables.map(([key]) => key).includes(key))
      );

      const entityWithForeignKeys = {
        ...entityWithoutPayloadForeignKeys,
        ...foreignKeyInsertResults.reduce((acc, cur) => {
          return {
            ...acc,
            ...cur
          };
        }, {})
      }

      const formattedEntity = this.formatValuesForDb(entityWithForeignKeys);

      const primaryKey = await this.repo.insert(tableName, formattedEntity, primaryKeys[0]);

      return {
        [primaryKeys[0]]: primaryKey
      }
    }
    throw new Error("test");
  }

  async insertOld(tableName: string, entity: Entity | Entity[]): Promise<void> {


    // TODO - should be removed


    if (Array.isArray(entity)) {
      // TODO - currently no support for foreign keys
      for (let i = 0; i < entity.length; i++) {
        const formattedEntity = this.formatValuesForDb(entity[i]);

        const primaryKeys = await this.repo.getPrimaryKeys(tableName);

        if (primaryKeys.length === 0) {
          throw new Error(`No primary key found for table ${tableName}`);
        }

        if (primaryKeys.length > 1) {
          throw new Error("No support for composite keys");
        }

        await this.repo.insert(tableName, formattedEntity, primaryKeys[0]);
      }
    } else {
      const replacements: Replecement[] = [];

      for (const [key, value] of Object.entries(entity)) {
        if (Array.isArray(value)) {
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

          if (value.length > 1) {
            throw new Error(
              "No support for multiple inserts of a foreign key table"
            );
          }

          const formattedEntity = this.formatValuesForDb(value[0]);

          if (Object.values(formattedEntity).some((val) => Array.isArray(val))) {
            throw new Error("No support for foreign key inside a foreign key");
          }

          const primaryKeys = await this.repo.getPrimaryKeys(key);

          if (primaryKeys.length === 0) {
            throw new Error(`No primary key found for table ${key}`);
          }

          if (primaryKeys.length > 1) {
            throw new Error("No support for composite keys");
          }

          const foreignKeyInsertResult = await this.repo.insert(
            key,
            formattedEntity,
            primaryKeys[0]
          );

          replacements.push({
            foreignKeyValue: foreignKeyInsertResult,
            foreignKeyColumn: foreignKeys[0],
            foreignKeyTableReference: key,
          });
        }
      }
      const primaryKeys = await this.repo.getPrimaryKeys(tableName);

      if (primaryKeys.length === 0) {
        throw new Error(`No primary key found for table ${tableName}`);
      }

      if (primaryKeys.length > 1) {
        throw new Error("No support for composite keys");
      }

      const formattedEntity = this.formatValuesForDb(entity, replacements);

      await this.repo.insert(tableName, formattedEntity, primaryKeys[0]);
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