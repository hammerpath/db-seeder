import { DbAdapter, Entity } from "../adapters/DbAdapter";
import { createApp, startServer } from '../server';

export type {
    DbAdapter,
    Entity
};

export { createApp, startServer };

let registeredAdapter: DbAdapter | undefined;

export function registerAdapter(adapter: DbAdapter) {
    registeredAdapter = adapter;
}

export function getAdapter(): DbAdapter {
    if (!registeredAdapter) {
        throw new Error('No database adapter registered. Please register an adapter before starting the server.');
    }
    return registeredAdapter;
}