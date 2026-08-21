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
        getRows: jest.fn(),
        getPrimaryKeys: jest.fn(),
        getForeignKeys: jest.fn(),
        getColumnTypes: jest.fn().mockResolvedValue({}),
    }

    withPrimaryKeys(primaryKeys: string[]) {
        when(this.repoMock.getPrimaryKeys).mockResolvedValue(primaryKeys);
        return this;
    }

    withColumnTypes(columnTypes: Record<string, string>) {
        when(this.repoMock.getColumnTypes).mockResolvedValue(columnTypes);
        return this;
    }

    withForeignKeys(foreignKeys: string[], tableName: string, linkedTableName: string) {
        when(this.repoMock.getForeignKeys).calledWith(tableName, linkedTableName)
            .mockResolvedValue(foreignKeys);
        return this;
    }

    withInsert(pkValues: Record<string, string | number>, tableName: string, entity: any, primaryKeys: string[]) {
        when(this.repoMock.insert).calledWith(tableName, entity, primaryKeys)
            .mockResolvedValue(pkValues);
        return this;
    }

    createSut() {
        return new RelationalDbProvider(this.repoMock);
    }
}
