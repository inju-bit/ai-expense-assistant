import psycopg

DB_NAME = "expense_dashboard"

def get_connection():
    return psycopg.connect(
        dbname=DB_NAME
    )