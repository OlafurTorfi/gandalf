# Captain SQL

sql client built with electron

## Installation Instructions:

-   make sure you have node and npm installed
-   clone this repo
-   cd into the clone
-   run

```console
npm install
npm start
```

## Develop

```console
npm run dev
```

# SQLite Support

Captain SQL now supports SQLite databases in addition to PostgreSQL and JT400.

## Setting Up a SQLite Connection

1. **Launch the Application**

2. **Add a New Connection**

    - Click "Add Connection"
    - Select **sqlite** from the connection type dropdown

3. **Configure Connection Settings**

    - **Name**: Give your connection a meaningful name (e.g., "My SQLite DB")
    - **Database File Path**: Enter the full path to your SQLite database file
        - Example: `/Users/username/databases/mydb.sqlite`
        - Example: `./data/local.db` (relative path)
        - For a new database, just specify a path and SQLite will create it
    - **Username**: Not required for SQLite (field will be hidden)
    - **Bookmarks** (optional): Specify a bookmarks file name
    - **Theme**: Choose your preferred color theme

4. **Connect**
    - Click Save
    - Enter your connection and start querying!

## Features Supported

-   ✅ Execute SELECT queries
-   ✅ Execute INSERT, UPDATE, DELETE statements
-   ✅ Transaction support (commit/rollback when auto-commit is disabled)
-   ✅ Browse table schema
-   ✅ Export schema to file
-   ✅ Query history
-   ✅ Bookmarks

## Example SQLite Queries

```sql
-- Create a table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert data
INSERT INTO users (name, email) VALUES
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com');

-- Query data
SELECT * FROM users WHERE name LIKE '%John%';

-- Update data
UPDATE users SET email = 'newemail@example.com' WHERE id = 1;

-- Check table structure
PRAGMA table_info(users);
```

## Notes

-   SQLite doesn't require a username or password for local file access
-   The "Database File Path" field replaces the "Host" field for SQLite connections
-   Auto-commit is supported (enabled by default)
-   Connection properties (used for JT400) are not available for SQLite connections
