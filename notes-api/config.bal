import ballerina/os;

configurable string dbHost = envOr("NOTES_DB_HOST", "localhost");
configurable int dbPort = envOrInt("NOTES_DB_PORT", 5432);
configurable string dbUser = envOr("NOTES_DB_USER", "postgres");
configurable string dbPassword = envOr("NOTES_DB_PASSWORD", "postgres");
configurable string dbName = envOr("NOTES_DB_DBNAME", "appdb");

function envOr(string name, string fallback) returns string {
    string value = os:getEnv(name);
    return value.trim() == "" ? fallback : value.trim();
}

function envOrInt(string name, int fallback) returns int {
    int|error parsed = int:fromString(os:getEnv(name).trim());
    return parsed is int ? parsed : fallback;
}
