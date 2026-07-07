export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type Entity = {
    [key: string]: JsonValue;
}
