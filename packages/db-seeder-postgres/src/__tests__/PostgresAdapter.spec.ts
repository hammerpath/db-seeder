import PostgresAdapterFixture from "./fixtures/PostgresAdapterFixture";

describe("insert", () => {
    test("inserts an entity into the database", async () => {
        const primaryKeyColumn = "id";
        const entity = { id: 1, value: 123 };
        const tableName = "entity_table";

        const fixture = new PostgresAdapterFixture()
            .withPrimaryKeys([primaryKeyColumn]);
        const sut = fixture.createSut();

        await sut.insert(tableName, entity);

        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(tableName, entity, primaryKeyColumn);
    });

    test("inserts an entity inside an array into the database", async () => {
        const primaryKeyColumn = "id";
        const entity = { id: 1, value: 123 };
        const payload = [
            entity
        ];
        const tableName = "entity_table";

        const fixture = new PostgresAdapterFixture()
            .withPrimaryKeys([primaryKeyColumn]);
        const sut = fixture.createSut();

        await sut.insert(tableName, payload);

        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(tableName, entity, primaryKeyColumn);
    });

    test("inserts a foreign key entity into the database", async () => {
        const primaryKeyColumn = "id";
        const foreignEntity = { id: 1, value: 456 };
        const entity = { id: 1, value: 123 };
        const payload = {
            ...entity,
            foreign_entity_table: [foreignEntity],
        }
        const expectedEntity = {
            ...entity,
            foreign_key: 1
        }
        const tableName = "entity_table";
        const foreignTableName = "foreign_entity_table";

        const fixture = new PostgresAdapterFixture()
            .withPrimaryKeys([primaryKeyColumn])
            .withForeignKeys(["foreign_key"], tableName, foreignTableName)
            .withInsert(1, foreignTableName, foreignEntity, primaryKeyColumn);
        const sut = fixture.createSut();

        await sut.insert(tableName, payload);

        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(foreignTableName, foreignEntity, primaryKeyColumn);
        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
    });

    test("inserts two foreign key entities into the database", async () => {
        // TODO - this should not work
        const primaryKeyColumn = "id";
        const foreignEntityFirst = { id: 1, value: 123 };
        const foreignEntitySecond = { id: 2, value: 456 };
        const entity = { id: 1, value: 123 };
        const payload = {
            ...entity,
            foreign_entity_table: [foreignEntityFirst, foreignEntitySecond],
        }
        const expectedEntity = {
            ...entity,
            foreign_key: 1
        }
        const tableName = "entity_table";
        const foreignTableName = "foreign_entity_table";

        const fixture = new PostgresAdapterFixture()
            .withPrimaryKeys([primaryKeyColumn])
            .withForeignKeys(["foreign_key"], tableName, foreignTableName);
        const sut = fixture.createSut();

        await sut.insert(tableName, payload);

        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(foreignTableName, foreignEntityFirst, primaryKeyColumn);
        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(foreignTableName, foreignEntitySecond, primaryKeyColumn);
        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
    });

    test("inserts an entity inside an array with a foreign key into the database", async () => {
        const primaryKeyColumn = "id";
        const foreignEntity = { id: 1, value: 123 };
        const entity = { id: 1, value: 123 };
        const payload = [
            { ...entity, foreign_entity_table: [foreignEntity] }
        ]
        const expectedEntity = {
            ...entity,
            foreign_key: 1
        }
        const tableName = "entity_table";
        const foreignTableName = "foreign_entity_table";

        const fixture = new PostgresAdapterFixture()
            .withPrimaryKeys([primaryKeyColumn])
            .withForeignKeys(["foreign_key"], tableName, foreignTableName)
            .withInsert(1, foreignTableName, foreignEntity, primaryKeyColumn);;
        const sut = fixture.createSut();

        await sut.insert(tableName, payload);

        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(foreignTableName, foreignEntity, primaryKeyColumn);
        expect(fixture.repoMock.insert)
            .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
    });
});
