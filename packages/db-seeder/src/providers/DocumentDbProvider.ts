import { DocumentDbRepository } from "../repositories/DocumentDbRepository";
import { DbProvider } from "./DbProvider";
import { Entity } from "../repositories/types";

export default class DocumentDbProviderImpl implements DbProvider {

    private repo;

    constructor(repo: DocumentDbRepository) {
        this.repo = repo;
    }

    async testConnection(): Promise<boolean> {
        return await this.repo.testConnection();
    }

    async closeConnection(): Promise<void> {
        return await this.repo.closeConnection();
    }

    async getTableNames(): Promise<string[]> {
        return await this.repo.getTableNames();
    }

    async truncateTable(tableName: string): Promise<void> {
        return await this.repo.truncateTable(tableName);
    }

    async truncateTables(): Promise<void> {
        return await this.repo.truncateTables();
    }

    async insert(tableName: string, entity: Entity | Entity[]): Promise<void> {
        if (Array.isArray(entity)) {
            throw new Error("Top level entity must not be an array.");
        }

        return await this.repo.insert(tableName, entity);
    }
}
