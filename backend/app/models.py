from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class InsuranceType(str, Enum):
    LIFE = "life"  # 生命保険
    MEDICAL = "medical"  # 医療保険
    DISABILITY = "disability"  # 障害保険
    NURSING = "nursing"  # 介護保険


class LifeEventType(str, Enum):
    MARRIAGE = "marriage"  # 結婚
    BIRTH = "birth"  # 出産
    EDUCATION = "education"  # 教育費
    HOUSE_PURCHASE = "house_purchase"  # 住宅購入
    RETIREMENT = "retirement"  # 退職
    DEATH = "death"  # 死亡


# ユーザー基本情報
class UserProfile(BaseModel):
    name: str
    birth_date: date
    gender: Gender
    spouse_name: Optional[str] = None
    spouse_birth_date: Optional[date] = None
    children: List[date] = []  # 子供の生年月日リスト


# 収入情報
class Income(BaseModel):
    annual_salary: int = Field(description="年収（万円）")
    bonus: int = Field(default=0, description="ボーナス（万円）")
    other_income: int = Field(default=0, description="その他収入（万円）")
    retirement_age: int = Field(default=65, description="退職予定年齢")


# 支出情報
class Expense(BaseModel):
    living_expenses: int = Field(description="生活費（万円/年）")
    housing_expenses: int = Field(default=0, description="住宅費（万円/年）")
    education_expenses: int = Field(default=0, description="教育費（万円/年）")
    insurance_premiums: int = Field(default=0, description="保険料（万円/年）")
    other_expenses: int = Field(default=0, description="その他支出（万円/年）")


# 資産情報
class Asset(BaseModel):
    cash: int = Field(default=0, description="現金・預金（万円）")
    stocks: int = Field(default=0, description="株式（万円）")
    bonds: int = Field(default=0, description="債券（万円）")
    real_estate: int = Field(default=0, description="不動産（万円）")
    other_assets: int = Field(default=0, description="その他資産（万円）")


# 負債情報
class Liability(BaseModel):
    mortgage: int = Field(default=0, description="住宅ローン残高（万円）")
    other_loans: int = Field(default=0, description="その他ローン（万円）")


# 保険情報
class Insurance(BaseModel):
    type: InsuranceType
    coverage_amount: int = Field(description="保険金額（万円）")
    annual_premium: int = Field(description="年間保険料（万円）")
    term: Optional[int] = Field(default=None, description="保険期間（年）")


# 年金情報
class Pension(BaseModel):
    basic_pension: int = Field(description="基礎年金額（万円/年）")
    employee_pension: Optional[int] = Field(default=None, description="厚生年金額（万円/年）")
    corporate_pension: Optional[int] = Field(default=None, description="企業年金額（万円/年）")
    start_age: int = Field(default=65, description="受給開始年齢")


# 退職金情報
class RetirementBenefit(BaseModel):
    amount: int = Field(description="退職金総額（万円）")
    payment_age: int = Field(default=65, description="支給年齢")


# ライフイベント
class LifeEvent(BaseModel):
    type: LifeEventType
    year: int = Field(description="発生年")
    amount: Optional[int] = Field(default=None, description="必要金額（万円）")
    description: Optional[str] = None


# ライフプラン全体
class LifePlan(BaseModel):
    profile: UserProfile
    income: Income
    expense: Expense
    assets: Asset
    liabilities: Liability
    insurances: List[Insurance] = []
    pension: Optional[Pension] = None
    retirement_benefit: Optional[RetirementBenefit] = None
    life_events: List[LifeEvent] = []


# シミュレーション結果（年次）
class YearlySimulation(BaseModel):
    year: int
    age: int
    income: int
    expense: int
    assets: int
    liabilities: int
    net_worth: int
    tax: int


# シミュレーション結果全体
class SimulationResult(BaseModel):
    yearly_data: List[YearlySimulation]
    retirement_age: int
    retirement_assets: int
    pension_shortfall: Optional[int] = None
