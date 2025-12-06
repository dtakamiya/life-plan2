from datetime import date
from typing import Optional
from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    """ユーザープロフィール情報"""
    id: Optional[int] = None
    name: str
    birth_date: date
    gender: str  # "male", "female"
    occupation: str
    spouse_name: Optional[str] = None
    spouse_birth_date: Optional[date] = None
    children: list[dict] = []  # [{"name": str, "birth_date": date}]


class Income(BaseModel):
    """収入情報"""
    id: Optional[int] = None
    user_id: int
    category: str  # "salary", "bonus", "business", "investment", "other"
    amount: int
    frequency: str  # "monthly", "yearly", "one_time"
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None


class Expense(BaseModel):
    """支出情報"""
    id: Optional[int] = None
    user_id: int
    category: str  # "housing", "food", "transport", "education", "insurance", "tax", "other"
    amount: int
    frequency: str  # "monthly", "yearly", "one_time"
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None


class Asset(BaseModel):
    """資産情報"""
    id: Optional[int] = None
    user_id: int
    category: str  # "savings", "investment", "real_estate", "other"
    name: str
    current_value: int
    expected_return_rate: float = 0.0  # 年間期待リターン率（%）
    notes: Optional[str] = None


class Liability(BaseModel):
    """負債情報"""
    id: Optional[int] = None
    user_id: int
    category: str  # "housing_loan", "car_loan", "credit_card", "other"
    name: str
    remaining_balance: int
    monthly_payment: int
    interest_rate: float
    start_date: date
    end_date: date
    notes: Optional[str] = None


class Insurance(BaseModel):
    """保険情報"""
    id: Optional[int] = None
    user_id: int
    type: str  # "life", "health", "property", "other"
    name: str
    premium: int
    frequency: str  # "monthly", "yearly"
    coverage_amount: Optional[int] = None
    start_date: date
    end_date: Optional[date] = None
    notes: Optional[str] = None


class EducationPlan(BaseModel):
    """教育資金計画"""
    id: Optional[int] = None
    user_id: int
    child_name: str
    education_type: str  # "elementary", "junior_high", "high_school", "university", "graduate"
    expected_cost: int
    start_year: int
    end_year: int
    notes: Optional[str] = None


class HousingLoan(BaseModel):
    """住宅ローン情報"""
    id: Optional[int] = None
    user_id: int
    property_name: str
    loan_amount: int
    interest_rate: float
    loan_period_years: int
    start_date: date
    monthly_payment: int
    notes: Optional[str] = None


class RetirementPlan(BaseModel):
    """退職金・年金計画"""
    id: Optional[int] = None
    user_id: int
    retirement_age: int
    expected_retirement_benefit: int
    monthly_pension: int
    current_retirement_savings: int
    monthly_contribution: int
    notes: Optional[str] = None


class LifePlanRequest(BaseModel):
    """ライフプラン計算リクエスト"""
    user_profile: UserProfile
    incomes: list[Income] = []
    expenses: list[Expense] = []
    assets: list[Asset] = []
    liabilities: list[Liability] = []
    insurances: list[Insurance] = []
    education_plans: list[EducationPlan] = []
    housing_loans: list[HousingLoan] = []
    retirement_plans: list[RetirementPlan] = []
    projection_years: int = Field(default=30, ge=1, le=50)


class LifePlanResponse(BaseModel):
    """ライフプラン計算レスポンス"""
    year: int
    age: int
    total_income: int
    total_expense: int
    net_cashflow: int
    total_assets: int
    total_liabilities: int
    net_worth: int
    events: list[str] = []  # その年のイベント（教育費、退職など）
