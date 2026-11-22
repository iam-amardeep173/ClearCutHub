import sqlite3

def create_db():
    # Connect to the SQLite database (this will create the file if it doesn't exist)
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()

    # Create the users table if it doesn't already exist
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );
    """)

    conn.commit()  # Commit changes to the database
    conn.close()  # Close the database connection

if __name__ == "__main__":
    create_db()
    print("Database and users table created.")
