import {MongoClient} from "mongodb";
import type { DocumentDbRepository, Entity } from "db-seeder-server";

export default class MongoDbRepository implements DocumentDbRepository {
    private client: MongoClient;
    private databaseName: string;

    constructor(connectionString: string, databaseName: string) {
        this.client = new MongoClient(connectionString);
        this.databaseName = databaseName;
    }

    async testConnection(): Promise<boolean> {
      await this.client.connect();
      return true;
    }

    async closeConnection(): Promise<void> {
      await this.client.close();
    }

    async getTableNames(): Promise<string[]> {
        const db = this.client.db(this.databaseName);
        const collections = await db.collections();
        return collections.map((collection) => collection.collectionName);
    }

    async truncateTable(tableName: string): Promise<void> {
        const db = this.client.db(this.databaseName);
        await db.collection(tableName).deleteMany({});
    }

    async truncateTables(): Promise<void> {
        const tableNames = await this.getTableNames();

        tableNames.forEach(async (tableName) => {
            await this.truncateTable(tableName);
        });
    }

    async insert(tableName: string, values: Record<string, string | number | Entity>): Promise<void> {
        const db = this.client.db(this.databaseName);
        await db.collection(tableName).insertOne(values);
    }

    async getRows(tableName: string): Promise<Entity[]> {
        const db = this.client.db(this.databaseName);
        return await db.collection(tableName).find().toArray();
    }
}
    
