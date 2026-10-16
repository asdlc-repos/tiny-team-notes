# Domain model

The board holds one kind of record, the note. Notes are written once and never changed or removed.

```mermaid
erDiagram
    NOTE {
        uuid id PK
        string body "1 to 280 characters, plain text"
        string authorId "signed-in user's id"
        string authorName "display name at posting time"
        timestamp createdAt "orders the board, newest first"
    }
```

The author is the signed-in team member who posted the note; people are not stored separately, so the note carries the author's id and name.