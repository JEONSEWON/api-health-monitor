"""
Migration: Add keyword and keyword_present columns to monitors table
Run once: python -m app.migrate_keyword
"""
from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Check if columns already exist (SQLite)
        try:
            conn.execute(text("ALTER TABLE monitors ADD COLUMN keyword VARCHAR(500)"))
            print("Added: keyword")
        except Exception as e:
            print(f"keyword already exists or error: {e}")
        
        try:
            conn.execute(text("ALTER TABLE monitors ADD COLUMN keyword_present BOOLEAN DEFAULT 1"))
            print("Added: keyword_present")
        except Exception as e:
            print(f"keyword_present already exists or error: {e}")
        
        conn.commit()
        print("Migration complete")

if __name__ == "__main__":
    migrate()
