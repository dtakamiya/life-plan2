import psycopg
from psycopg.rows import dict_row
import os
from contextlib import contextmanager

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/lifeplan")


@contextmanager
def get_db_connection():
    """データベース接続のコンテキストマネージャー"""
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """データベーステーブルの初期化"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            # ユーザープロフィールテーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_profiles (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    birth_date DATE NOT NULL,
                    gender VARCHAR(20) NOT NULL,
                    occupation VARCHAR(255),
                    spouse_name VARCHAR(255),
                    spouse_birth_date DATE,
                    children JSONB DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 収入テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS incomes (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    category VARCHAR(50) NOT NULL,
                    amount INTEGER NOT NULL,
                    frequency VARCHAR(20) NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 支出テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS expenses (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    category VARCHAR(50) NOT NULL,
                    amount INTEGER NOT NULL,
                    frequency VARCHAR(20) NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 資産テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS assets (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    category VARCHAR(50) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    current_value INTEGER NOT NULL,
                    expected_return_rate FLOAT DEFAULT 0.0,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 負債テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS liabilities (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    category VARCHAR(50) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    remaining_balance INTEGER NOT NULL,
                    monthly_payment INTEGER NOT NULL,
                    interest_rate FLOAT NOT NULL,
                    start_date DATE NOT NULL,
                    end_date DATE NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 保険テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS insurances (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    type VARCHAR(50) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    premium INTEGER NOT NULL,
                    frequency VARCHAR(20) NOT NULL,
                    coverage_amount INTEGER,
                    start_date DATE NOT NULL,
                    end_date DATE,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 教育資金計画テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS education_plans (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    child_name VARCHAR(255) NOT NULL,
                    education_type VARCHAR(50) NOT NULL,
                    expected_cost INTEGER NOT NULL,
                    start_year INTEGER NOT NULL,
                    end_year INTEGER NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 住宅ローンテーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS housing_loans (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    property_name VARCHAR(255) NOT NULL,
                    loan_amount INTEGER NOT NULL,
                    interest_rate FLOAT NOT NULL,
                    loan_period_years INTEGER NOT NULL,
                    start_date DATE NOT NULL,
                    monthly_payment INTEGER NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # 退職金・年金計画テーブル
            cur.execute("""
                CREATE TABLE IF NOT EXISTS retirement_plans (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES user_profiles(id) ON DELETE CASCADE,
                    retirement_age INTEGER NOT NULL,
                    expected_retirement_benefit INTEGER NOT NULL,
                    monthly_pension INTEGER NOT NULL,
                    current_retirement_savings INTEGER NOT NULL,
                    monthly_contribution INTEGER NOT NULL,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
