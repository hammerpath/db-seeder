import { when } from "jest-when";
import RelationalDbProvider from "../../RelationalDbProvider";
import { RelationalDbRepository } from "../../../repositories/RelationalDbRepository";


export default class RelationalDbProviderFixture {
    repoMock: RelationalDbRepository = {
        testConnection: jest.fn(),
        closeConnection: jest.fn(),
        getTableNames: jest.fn(),
        truncateTable: jest.fn(),
        truncateTables: jest.fn(),
        insert: jest.fn(),
        getPrimaryKeys: jest.fn(),
        getForeignKeys: jest.fn(),
    }

    withPrimaryKeys(primaryKeys: string[]) {
        when(this.repoMock.getPrimaryKeys).mockResolvedValue(primaryKeys);
        return this;
    }

    withForeignKeys(foreignKeys: string[], tableName: string, linkedTableName: string) {
        when(this.repoMock.getForeignKeys).calledWith(tableName, linkedTableName)
            .mockResolvedValue(foreignKeys);
        return this;
    }

    withInsert(pk: string | number, tableName: string, entity: any, primaryKey: string) {
        when(this.repoMock.insert).calledWith(tableName, entity, primaryKey)
            .mockResolvedValue(pk);
        return this;
    }

    createSut() {
        return new RelationalDbProvider(this.repoMock);
    }
}
