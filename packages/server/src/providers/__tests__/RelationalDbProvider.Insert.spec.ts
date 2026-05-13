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
                .toHaveBeenCalledWith(tableName, entity, [primaryKeyColumn]);
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
                .toHaveBeenCalledWith(tableName, expectedEntity, [primaryKeyColumn]);
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
                .toHaveBeenCalledWith(tableName, entity1, [primaryKeyColumn]);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, entity2, [primaryKeyColumn]);
        });

        test("inserts an entity into a table with a composite primary key", async () => {
            const primaryKeys = ["post_id", "revision_number"];
            const tableName = "post_revisions";
            const entity = { post_id: 1, revision_number: 1, content: "First draft" };
            const expectedEntity = { post_id: 1, revision_number: 1, content: "'First draft'" };

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys(primaryKeys);
            const sut = fixture.createSut();

            await sut.insert(tableName, entity);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(1);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, primaryKeys);
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
                .withInsert({ [primaryKeyColumn]: 1 }, foreignTableName, foreignEntity, [primaryKeyColumn]);
            const sut = fixture.createSut();

            await sut.insert(tableName, payload);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(2);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(foreignTableName, foreignEntity, [primaryKeyColumn]);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, [primaryKeyColumn]);
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
                .withInsert({ [primaryKeyColumn]: 1 }, foreignTableName, foreignEntity, [primaryKeyColumn]);
            const sut = fixture.createSut();

            await sut.insert(tableName, payload);

            expect(fixture.repoMock.insert)
                .toHaveBeenCalledTimes(2);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(foreignTableName, foreignEntity, [primaryKeyColumn]);
            expect(fixture.repoMock.insert)
                .toHaveBeenCalledWith(tableName, expectedEntity, [primaryKeyColumn]);
        });

        test("throws a clear error when a nested foreign-key target has a composite primary key", async () => {
            const compositePrimaryKeys = ["post_id", "revision_number"];
            const tableName = "posts";
            const compositeChildTable = "post_revisions";
            const payload = {
                title: "Hello",
                content: "World",
                user_id: 1,
                post_revisions: { post_id: 1, revision_number: 1, content: "First draft" }
            };

            const fixture = new RelationalDbProviderFixture()
                .withPrimaryKeys(compositePrimaryKeys)
                .withForeignKeys(["post_id"], tableName, compositeChildTable)
                .withInsert(
                    { post_id: 1, revision_number: 1 },
                    compositeChildTable,
                    { post_id: 1, revision_number: 1, content: "'First draft'" },
                    compositePrimaryKeys
                );
            const sut = fixture.createSut();

            await expect(sut.insert(tableName, payload)).rejects.toThrow(
                "Cannot use composite-primary-key table 'post_revisions' as a nested foreign-key reference from 'posts'"
            );
        });
    });
});
