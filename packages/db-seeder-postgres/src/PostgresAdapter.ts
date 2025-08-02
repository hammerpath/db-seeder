import { Pool } from "pg";
import { DbAdapter, Entity } from "db-seeder";

export default class PostgresAdapter implements DbAdapter {
  private pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async testConnection(): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      return false;
    }
  }

  async getTableNames(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';
      `);

    return result.rows.map((row) => row.table_name);
  }

  async truncateTable(tableName: string): Promise<void> {
    await this.pool.query(`TRUNCATE TABLE ${tableName};`);
  }

  async truncateTables(): Promise<void> {
    const tableNames = await this.getTableNames();

    tableNames.forEach(async (tableName) => {
      await this.truncateTable(tableName);
    });
  }

  async insert(tableName: string, entity: Entity | Entity[]): Promise<void> {
    if (Array.isArray(entity)) {
      // TODO - currently no support for foreign keys
      for (let i = 0; i < entity.length; i++) {
        const { keys, values } = this.getKeysAndValuesForEntity(entity[i]);

        await this.pool.query(
          `INSERT INTO ${tableName}(${keys.join(",")}) VALUES(${values.join(",")});`
        );
      }
    } else {
      const replacements: Replecement[] = [];

      for (const [key, value] of Object.entries(entity)) {
        if (Array.isArray(value)) {
          const foreignKeys = await this.getForeignKeys(tableName, key);

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

          const { keys: keysOfForeign, values: valuesOfForeign } =
            this.getKeysAndValuesForEntity(value[0]);

          if (valuesOfForeign.some((val) => Array.isArray(val))) {
            throw new Error("No support for foreign key inside a foreign key");
          }

          const primaryKeys = await this.getPrimaryKeysForTable(key);

          if (primaryKeys.length === 0) {
            throw new Error(`No primary key found for table ${key}`);
          }

          if (primaryKeys.length > 1) {
            throw new Error("No support for composite keys");
          }

          const foreignKeyInsertResult = await this.pool.query(
            `INSERT INTO ${key}(${keysOfForeign.join(",")}) VALUES(${valuesOfForeign.join(",")}) RETURNING ${primaryKeys[0]};`
          );

          if (
            foreignKeyInsertResult.rows.length === 0 ||
            foreignKeyInsertResult.rows.length > 1
          ) {
            throw new Error("Invalid amount of primary keys for the column");
          }

          replacements.push({
            foreignKeyValue: foreignKeyInsertResult.rows[0][primaryKeys[0]],
            foreignKeyColumn: foreignKeys[0],
            foreignKeyTableReference: key,
          });
        }
      }

      const formattedEntity = this.formatValuesForDb(entity, replacements);

      await this.pool.query(
        `INSERT INTO ${tableName}(${Object.keys(formattedEntity).join(",")}) VALUES(${Object.values(formattedEntity).join(",")});`
      );
    }
  }

  private async getForeignKeys(
    tableName: string,
    linkedTableName: string
  ): Promise<string[]> {
    const result = await this.pool.query(
      `SELECT
    kcu.column_name
FROM
    information_schema.table_constraints tc
JOIN
    information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.constraint_schema = kcu.constraint_schema
JOIN
    information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.constraint_schema = rc.constraint_schema
JOIN
    information_schema.constraint_column_usage ccu
    ON rc.unique_constraint_name = ccu.constraint_name
    AND rc.unique_constraint_schema = ccu.constraint_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = '${tableName}'
    AND ccu.table_name = '${linkedTableName}';`
    );

    return result.rows.map((res) => res.column_name);
  }

  private getKeysAndValuesForEntity(entity: Entity) {
    let keys = [];
    let values = [];

    for (const prop in entity) {
      const value = entity[prop];
      keys.push(prop);

      if (typeof value === "string" || value instanceof String) {
        values.push(`'${value}'`);
      } else {
        values.push(value);
      }
    }

    return {
      keys,
      values,
    };
  }

  private formatValuesForDb(entity: Entity, replacements: Replecement[]) {
    let obj: Record<string, any> = {};
    for (const [key, value] of Object.entries(entity)) {
      const replacement = replacements.find(
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

  private async getPrimaryKeysForTable(tableName: string): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT
    kcu.column_name
FROM
    information_schema.table_constraints tc
JOIN
    information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.constraint_schema = kcu.constraint_schema
WHERE
    tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_name = '${tableName}';
      `);

    return result.rows.map((res) => res.column_name);
  }
}

type Replecement = {
  foreignKeyValue: number | string;
  foreignKeyColumn: string;
  foreignKeyTableReference: string;
};