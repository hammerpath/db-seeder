module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.spec.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
