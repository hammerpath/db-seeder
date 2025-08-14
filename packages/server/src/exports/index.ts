import { DbProvider } from "../providers/DbProvider";
import RelationalDbProvider from "../providers/RelationalDbProvider";
import { TruncateSingleTableOptions, TruncateAllTablesOptions, RelationalDbRepository } from "../repositories/RelationalDbRepository";
import { createApp, startServer } from '../server';
import { Entity } from "../repositories/types";
import DocumentDbProvider from "../providers/DocumentDbProvider";
import { DocumentDbRepository } from "../repositories/DocumentDbRepository";

export type {
    DbProvider,
    RelationalDbRepository,
    DocumentDbRepository,
    Entity,
    TruncateSingleTableOptions,
    TruncateAllTablesOptions
};

export { createApp, startServer, RelationalDbProvider, DocumentDbProvider };
