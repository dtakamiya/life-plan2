from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    UserProfile, Income, Expense, Asset, Liability, Insurance,
    EducationPlan, HousingLoan, RetirementPlan, LifePlanRequest, LifePlanResponse
)
from .database import init_db, get_db_connection
from .calculator import generate_life_plan
import json

app = FastAPI(title="FP一級ライフプランニングAPI")

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.on_event("startup")
async def startup_event():
    """アプリケーション起動時にデータベースを初期化"""
    init_db()


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/lifeplan/calculate", response_model=list[LifePlanResponse])
async def calculate_life_plan(request: LifePlanRequest):
    """ライフプランを計算"""
    try:
        results = generate_life_plan(
            user_profile=request.user_profile,
            incomes=request.incomes,
            expenses=request.expenses,
            assets=request.assets,
            liabilities=request.liabilities,
            insurances=request.insurances,
            education_plans=request.education_plans,
            housing_loans=request.housing_loans,
            retirement_plans=request.retirement_plans,
            projection_years=request.projection_years
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/user/profile")
async def create_user_profile(profile: UserProfile):
    """ユーザープロフィールを作成"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO user_profiles (name, birth_date, gender, occupation, spouse_name, spouse_birth_date, children)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                profile.name,
                profile.birth_date,
                profile.gender,
                profile.occupation,
                profile.spouse_name,
                profile.spouse_birth_date,
                json.dumps(profile.children)
            ))
            user_id = cur.fetchone()["id"]
            return {"id": user_id, **profile.dict()}


@app.get("/api/user/profile/{user_id}")
async def get_user_profile(user_id: int):
    """ユーザープロフィールを取得"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM user_profiles WHERE id = %s", (user_id,))
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="User not found")
            row["children"] = json.loads(row["children"]) if row["children"] else []
            return row


@app.post("/api/incomes")
async def create_income(income: Income):
    """収入情報を作成"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO incomes (user_id, category, amount, frequency, start_date, end_date, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                income.user_id,
                income.category,
                income.amount,
                income.frequency,
                income.start_date,
                income.end_date,
                income.notes
            ))
            income_id = cur.fetchone()["id"]
            return {"id": income_id, **income.dict()}


@app.get("/api/incomes/{user_id}")
async def get_incomes(user_id: int):
    """ユーザーの収入情報を取得"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM incomes WHERE user_id = %s ORDER BY start_date", (user_id,))
            return cur.fetchall()


@app.post("/api/expenses")
async def create_expense(expense: Expense):
    """支出情報を作成"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO expenses (user_id, category, amount, frequency, start_date, end_date, notes)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                expense.user_id,
                expense.category,
                expense.amount,
                expense.frequency,
                expense.start_date,
                expense.end_date,
                expense.notes
            ))
            expense_id = cur.fetchone()["id"]
            return {"id": expense_id, **expense.dict()}


@app.get("/api/expenses/{user_id}")
async def get_expenses(user_id: int):
    """ユーザーの支出情報を取得"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM expenses WHERE user_id = %s ORDER BY start_date", (user_id,))
            return cur.fetchall()


@app.post("/api/assets")
async def create_asset(asset: Asset):
    """資産情報を作成"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO assets (user_id, category, name, current_value, expected_return_rate, notes)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                asset.user_id,
                asset.category,
                asset.name,
                asset.current_value,
                asset.expected_return_rate,
                asset.notes
            ))
            asset_id = cur.fetchone()["id"]
            return {"id": asset_id, **asset.dict()}


@app.get("/api/assets/{user_id}")
async def get_assets(user_id: int):
    """ユーザーの資産情報を取得"""
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM assets WHERE user_id = %s", (user_id,))
            return cur.fetchall()
