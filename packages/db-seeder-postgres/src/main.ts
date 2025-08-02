import { registerAdapter, createApp, startServer } from "db-seeder";
import PostgresAdapter from "./PostgresAdapter";

// Get database configuration from environment variables
const DB_USER = process.env.POSTGRES_USER || 'user';
const DB_PASSWORD = process.env.POSTGRES_PASSWORD || 'abc123';
const DB_NAME = process.env.POSTGRES_DB || 'myDb';
const DB_HOST = process.env.POSTGRES_HOST || 'localhost';
const DB_PORT = process.env.POSTGRES_PORT || '5432';
const PORT = process.env.PORT || 3000;

const connectionString = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

async function main() {
    try {
        console.log('Registering PostgresAdapter...');
        registerAdapter(new PostgresAdapter(connectionString));
        console.log('PostgresAdapter registered successfully');

        const app = createApp();
        await startServer(app);

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();