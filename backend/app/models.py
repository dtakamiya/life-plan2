"""
FP1級レベルのライフプランニングモデル定義
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"


class EmploymentType(str, Enum):
    COMPANY_EMPLOYEE = "company_employee"  # 会社員
    CIVIL_SERVANT = "civil_servant"  # 公務員
    SELF_EMPLOYED = "self_employed"  # 自営業
    PART_TIME = "part_time"  # パート・アルバイト
    HOMEMAKER = "homemaker"  # 専業主婦・主夫
    RETIRED = "retired"  # 退職者


class MaritalStatus(str, Enum):
    SINGLE = "single"
    MARRIED = "married"
    DIVORCED = "divorced"
    WIDOWED = "widowed"


class LifeEventType(str, Enum):
    MARRIAGE = "marriage"  # 結婚
    CHILDBIRTH = "childbirth"  # 出産
    HOUSE_PURCHASE = "house_purchase"  # 住宅購入
    CAR_PURCHASE = "car_purchase"  # 車購入
    CHILD_EDUCATION = "child_education"  # 子供の教育
    CHILD_MARRIAGE = "child_marriage"  # 子供の結婚
    RETIREMENT = "retirement"  # 退職
    TRAVEL = "travel"  # 旅行
    HOME_RENOVATION = "home_renovation"  # リフォーム
    OTHER = "other"  # その他


class EducationType(str, Enum):
    PUBLIC = "public"  # 公立
    PRIVATE = "private"  # 私立


class FamilyMember(BaseModel):
    """家族構成員"""
    name: str
    age: int
    relationship: str  # 本人, 配偶者, 子, 親など
    annual_income: int = 0  # 年収
    employment_type: Optional[EmploymentType] = None


class LifeEvent(BaseModel):
    """ライフイベント"""
    event_type: LifeEventType
    year: int  # 発生年（西暦）
    age: int  # 本人の年齢
    cost: int  # 費用
    description: Optional[str] = None


class Asset(BaseModel):
    """資産"""
    cash_deposits: int = 0  # 現金・預金
    stocks: int = 0  # 株式
    investment_trusts: int = 0  # 投資信託
    bonds: int = 0  # 債券
    real_estate: int = 0  # 不動産
    insurance_surrender_value: int = 0  # 保険解約返戻金
    other_assets: int = 0  # その他資産


class Liability(BaseModel):
    """負債"""
    housing_loan: int = 0  # 住宅ローン
    car_loan: int = 0  # 自動車ローン
    education_loan: int = 0  # 教育ローン
    credit_card: int = 0  # クレジットカード
    other_loans: int = 0  # その他ローン


class MonthlyExpense(BaseModel):
    """月間支出"""
    housing: int = 0  # 住居費
    utilities: int = 0  # 水道光熱費
    food: int = 0  # 食費
    transportation: int = 0  # 交通費
    communication: int = 0  # 通信費
    insurance: int = 0  # 保険料
    education: int = 0  # 教育費
    entertainment: int = 0  # 娯楽費
    clothing: int = 0  # 被服費
    medical: int = 0  # 医療費
    other: int = 0  # その他


class InsuranceInfo(BaseModel):
    """保険情報"""
    life_insurance_amount: int = 0  # 生命保険金額
    medical_insurance: bool = False  # 医療保険加入
    cancer_insurance: bool = False  # がん保険加入
    disability_insurance: bool = False  # 就業不能保険加入
    monthly_premium: int = 0  # 月間保険料


class InvestmentPlan(BaseModel):
    """投資計画"""
    monthly_investment: int = 0  # 月額積立額
    expected_return_rate: float = 3.0  # 期待利回り（%）
    risk_tolerance: str = "moderate"  # low, moderate, high


class PensionInfo(BaseModel):
    """年金情報"""
    enrollment_months_national: int = 0  # 国民年金加入月数
    enrollment_months_employee: int = 0  # 厚生年金加入月数
    average_salary: int = 0  # 平均標準報酬月額
    ideco_monthly: int = 0  # iDeCo月額
    corporate_pension: bool = False  # 企業年金あり


class HousingPlan(BaseModel):
    """住宅計画"""
    is_owner: bool = False  # 持ち家
    purchase_year: Optional[int] = None  # 購入予定年
    purchase_price: int = 0  # 購入価格
    down_payment: int = 0  # 頭金
    loan_years: int = 35  # ローン年数
    interest_rate: float = 1.0  # 金利（%）


class ChildEducationPlan(BaseModel):
    """子供の教育計画"""
    child_age: int
    kindergarten: EducationType = EducationType.PUBLIC
    elementary: EducationType = EducationType.PUBLIC
    junior_high: EducationType = EducationType.PUBLIC
    high_school: EducationType = EducationType.PUBLIC
    university: EducationType = EducationType.PUBLIC
    university_type: str = "文系"  # 文系, 理系, 医歯薬系


class UserProfile(BaseModel):
    """ユーザープロファイル"""
    name: str
    age: int
    gender: Gender
    birth_year: int
    employment_type: EmploymentType
    marital_status: MaritalStatus
    annual_income: int  # 年収
    bonus_months: float = 2.0  # ボーナス月数
    retirement_age: int = 65  # 定年退職年齢
    life_expectancy: int = 90  # 想定寿命
    family_members: list[FamilyMember] = []


class LifePlanRequest(BaseModel):
    """ライフプラン作成リクエスト"""
    profile: UserProfile
    assets: Asset
    liabilities: Liability
    monthly_expenses: MonthlyExpense
    life_events: list[LifeEvent] = []
    insurance: InsuranceInfo
    investment: InvestmentPlan
    pension: PensionInfo
    housing: Optional[HousingPlan] = None
    child_education_plans: list[ChildEducationPlan] = []


class YearlyFinance(BaseModel):
    """年間財務情報"""
    year: int
    age: int
    income: int  # 収入
    income_after_tax: int  # 税引後収入
    expenses: int  # 支出
    life_event_cost: int  # ライフイベント費用
    savings: int  # 年間貯蓄額
    total_assets: int  # 資産残高
    investment_return: int  # 投資収益
    pension_income: int = 0  # 年金収入
    notes: list[str] = []  # 備考（ライフイベントなど）


class PensionEstimate(BaseModel):
    """年金試算"""
    basic_pension: int  # 老齢基礎年金（年額）
    employee_pension: int  # 老齢厚生年金（年額）
    total_pension: int  # 合計（年額）
    start_age: int = 65  # 受給開始年齢


class InsuranceNeed(BaseModel):
    """必要保障額"""
    death_benefit_needed: int  # 必要死亡保障額
    current_coverage: int  # 現在の保障額
    gap: int  # 不足額
    emergency_fund_needed: int  # 緊急資金必要額
    calculation_details: dict  # 計算詳細


class TaxCalculation(BaseModel):
    """税金計算結果"""
    gross_income: int  # 総収入
    income_deductions: int  # 所得控除
    taxable_income: int  # 課税所得
    income_tax: int  # 所得税
    resident_tax: int  # 住民税
    social_insurance: int  # 社会保険料
    net_income: int  # 手取り収入


class LifePlanResponse(BaseModel):
    """ライフプラン結果"""
    yearly_finances: list[YearlyFinance]
    pension_estimate: PensionEstimate
    insurance_need: InsuranceNeed
    tax_calculation: TaxCalculation
    total_lifetime_income: int  # 生涯収入
    total_lifetime_expenses: int  # 生涯支出
    final_assets: int  # 最終資産
    risk_assessment: dict  # リスク評価
    recommendations: list[str]  # 改善提案
