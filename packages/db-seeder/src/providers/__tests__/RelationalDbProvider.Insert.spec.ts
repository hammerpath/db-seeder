import RelationalDbProviderFixture from "./fixtures/RelationalDbProviderFixture"

describe("insert", () => {
    describe("entities without relations", () => {
        test("inserts an entity with an integer value into the database", async () => {
            const primaryKeyColumn = "id";
            const entity = { id: 1, value: 123 };
            const tableName = "entity_table";

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys([primaryKeyColumn]);
            const sut = fixture.createSut();

            await sut.insert(tableName, entity);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(1);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, entity, primaryKeyColumn);
        });

        test("insert an entity with a primary key that already exists", () => {
            expect(true).toBe(false);
        });

        test("inserts an entity with a string value into the database", async () => {
            const primaryKeyColumn = "id";
            const entity = { id: 1, value: "123" };
            const tableName = "entity_table";
            const expectedEntity = { id: 1, value: "'123'" };

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys([primaryKeyColumn]);
            const sut = fixture.createSut();

            await sut.insert(tableName, entity);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(1);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
        });

        test("inserts two entities into the database", async () => {
            const primaryKeyColumn = "id";
            const entity1 = { id: 1, value: 123 };
            const entity2 = { id: 2, value: 456 };
            const payload = [
                entity1,
                entity2
            ];
            const tableName = "entity_table";

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys([primaryKeyColumn]);
            const sut = fixture.createSut();

            await sut.insert(tableName, payload);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(2);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, entity1, primaryKeyColumn);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, entity2, primaryKeyColumn);
        });
    });

    describe("foreign keys", () => {
        test("inserts a foreign key entity into the database", async () => {
            const primaryKeyColumn = "id";
            const foreignEntity = { id: 1, value: 456 };
            const entity = { id: 1, value: 123 };
            const payload = {
                ...entity,
                foreign_entity_table: { ...foreignEntity },
            }
            const expectedEntity = {
                ...entity,
                foreign_key: 1
            }
            const tableName = "entity_table";
            const foreignTableName = "foreign_entity_table";

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys([primaryKeyColumn])
                .withForeignKeys(["foreign_key"], tableName, foreignTableName)
                .withInsert(1, foreignTableName, foreignEntity, primaryKeyColumn);
            const sut = fixture.createSut();

            await sut.insert(tableName, payload);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(2);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(foreignTableName, foreignEntity, primaryKeyColumn);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
        });

        test("inserts an entity inside an array with a foreign key into the database", async () => {
            const primaryKeyColumn = "id";
            const foreignEntity = { id: 1, value: 456 };
            const entity = { id: 1, value: 123 };
            const payload = [
                { ...entity, foreign_entity_table: { ...foreignEntity } }
            ]
            const expectedEntity = {
                ...entity,
                foreign_key: 1
            }
            const tableName = "entity_table";
            const foreignTableName = "foreign_entity_table";

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys([primaryKeyColumn])
                .withForeignKeys(["foreign_key"], tableName, foreignTableName)
                .withInsert(1, foreignTableName, foreignEntity, primaryKeyColumn);;
            const sut = fixture.createSut();

            await sut.insert(tableName, payload);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(2);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(foreignTableName, foreignEntity, primaryKeyColumn);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeyColumn);
        });
    });
});
