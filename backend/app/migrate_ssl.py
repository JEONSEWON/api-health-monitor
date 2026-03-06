"""
Migration: Add SSL monitoring columns to monitors table
Run via: railway run --service api-health-monitor python app/migrate_ssl.py
"""
import psycopg2, os

conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute("ALTER TABLE monitors ADD COLUMN IF NOT EXISTS ssl_check BOOLEAN DEFAULT TRUE")
cur.execute("ALTER TABLE monitors ADD COLUMN IF NOT EXISTS ssl_expiry_days INTEGER DEFAULT 14")
cur.execute("ALTER TABLE monitors ADD COLUMN IF NOT EXISTS ssl_expires_at TIMESTAMP")
cur.execute("ALTER TABLE monitors ADD COLUMN IF NOT EXISTS ssl_last_checked TIMESTAMP")
conn.commit()
cur.close()
conn.close()
print('SSL migration complete')
