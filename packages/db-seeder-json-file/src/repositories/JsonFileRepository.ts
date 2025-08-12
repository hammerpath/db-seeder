import { access, constants } from 'node:fs';
import editJsonFile from 'edit-json-file';
import type { DocumentDbRepository } from 'db-seeder-server';

export default class JsonFileRepository implements DocumentDbRepository {
    private filePath: string;
    constructor(filePath: string) {
        this.filePath = filePath;
    }

    testConnection(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            access(this.filePath, constants.F_OK, (error) => {
                if (error) {
                    console.error(`The file ${this.filePath} does not exist.`);
                    reject(false);
                }
                access(this.filePath, constants.R_OK | constants.W_OK, (error) => {
                    if (error) {
                        console.error(`The file ${this.filePath} is not readable or writable.`);
                        reject(false);
                    }
                    resolve(true);
                });
            });
        });
    }

    closeConnection(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getTableNames(): Promise<string[]> {
        return new Promise((resolve) => {
            const file = editJsonFile(this.filePath);
            const json = file.get();
            const keys = Object.keys(json);
            resolve(keys);
        });
    }

    truncateTable(tableName: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = editJsonFile(this.filePath);
            const json = file.get(tableName);
            if (!Array.isArray(json)) {
                file.set(tableName, {});
            } else {
                file.set(tableName, []);
            }
            file.save((error) => {
                if (error) {
                    console.error(`The file ${this.filePath} could not be saved.`);
                    reject(error);
                }
                resolve();
            });
        });
    }

    truncateTables(): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = editJsonFile(this.filePath);
            const json = file.get();
            const keys = Object.keys(json);
            for (const key of keys) {
                const value = json[key];
                if (!Array.isArray(value)) {
                    file.set(key, {});
                } else {
                    file.set(key, []);
                }
            }
            file.save((error) => {
                if (error) {
                    console.error(`The file ${this.filePath} could not be saved.`);
                    reject(error);
                }
                resolve();
            });
        });
    }

    insert(tableName: string, values: Record<string, string | number>): Promise<void> {
        return new Promise((resolve, reject) => {
            const file = editJsonFile(this.filePath);
            const json = file.get(tableName);
            if (!Array.isArray(json)) {
                file.set(tableName, values);
            } else {
                file.append(tableName, values);
            }
            file.save((error) => {
                if (error) {
                    console.error(`The file ${this.filePath} could not be saved.`);
                    reject(error);
                }
                resolve();
            });
        });
    }
}
