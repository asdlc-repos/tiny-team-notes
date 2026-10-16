import ballerina/sql;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// Connected on first use so that module init (and the unit tests) need no database.
postgresql:Client? dbHandle = ();

function getDb() returns postgresql:Client|error {
    postgresql:Client? existing = dbHandle;
    if existing is postgresql:Client {
        return existing;
    }
    postgresql:Client created = check new (dbHost, dbUser, dbPassword, dbName, dbPort);
    check initDb(created);
    dbHandle = created;
    return created;
}

type NoteRow record {|
    string id;
    string body;
    string authorId;
    string authorName;
    string createdAt;
|};

type CountRow record {|
    int total;
|};

function initDb(postgresql:Client dbClient) returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS notes (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            body text NOT NULL,
            author_id text NOT NULL,
            author_name text NOT NULL,
            created_at timestamptz NOT NULL DEFAULT now()
        )`);
    _ = check dbClient->execute(`
        CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC)`);
}

function countNotes() returns int|error {
    postgresql:Client dbClient = check getDb();
    CountRow row = check dbClient->queryRow(`SELECT count(*) AS total FROM notes`);
    return row.total;
}

function listNoteRows(int 'limit, int offset) returns NoteRow[]|error {
    postgresql:Client dbClient = check getDb();
    stream<NoteRow, sql:Error?> rows = dbClient->query(`
        SELECT id::text AS id, body, author_id AS "authorId", author_name AS "authorName",
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"
        FROM notes ORDER BY created_at DESC, id DESC LIMIT ${'limit} OFFSET ${offset}`);
    return from NoteRow row in rows
        select row;
}

function insertNote(string body, string authorId, string authorName) returns NoteRow|error {
    postgresql:Client dbClient = check getDb();
    return dbClient->queryRow(`
        INSERT INTO notes (body, author_id, author_name) VALUES (${body}, ${authorId}, ${authorName})
        RETURNING id::text AS id, body, author_id AS "authorId", author_name AS "authorName",
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt"`);
}
