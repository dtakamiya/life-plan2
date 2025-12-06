"""
FP1級レベル ライフプランニングWebアプリ - バックエンドAPI
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from .models import (
    LifePlanRequest, LifePlanResponse, UserProfile, Asset, Liability,
    MonthlyExpense, LifeEvent, InsuranceInfo, InvestmentPlan, PensionInfo,
    HousingPlan, ChildEducationPlan, YearlyFinance, PensionEstimate,
    InsuranceNeed, TaxCalculation, EmploymentType, Gender, MaritalStatus,
    LifeEventType, EducationType, FamilyMember
)
from .calculators import (
    calculate_tax, calculate_social_insurance, calculate_pension,
    estimate_future_pension, calculate_insurance_need, calculate_housing_loan,
    simulate_investment, calculate_yearly_cashflow, assess_risks,
    generate_recommendations, calculate_detailed_education_cost
)

app = FastAPI(
    title="ライフプランニングAPI",
    description="FP1級レベルのライフプランニング計算を提供するAPI",
    version="1.0.0"
)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/life-plan", response_model=LifePlanResponse)
async def create_life_plan(request: LifePlanRequest):
    """ライフプラン作成API"""
    try:
        # 社会保険料計算
        social_insurance = calculate_social_insurance(
            request.profile.annual_income,
            request.profile.employment_type
        )
        
        # 税金計算
        family_count = len(request.profile.family_members) + 1
        tax_calculation = calculate_tax(
            request.profile,
            social_insurance["total"],
            family_count
        )
        
        # 年金試算
        pension_estimate = estimate_future_pension(
            request.profile,
            request.pension
        )
        
        # キャッシュフロー計算
        yearly_finances = calculate_yearly_cashflow(
            request.profile,
            request.assets,
            request.liabilities,
            request.monthly_expenses,
            request.life_events,
            request.investment,
            pension_estimate,
            request.housing
        )
        
        # 保険必要保障額計算
        insurance_need = calculate_insurance_need(
            request.profile,
            request.monthly_expenses,
            request.assets,
            request.liabilities,
            request.insurance,
            pension_estimate
        )
        
        # リスク評価
        risk_assessment = assess_risks(
            yearly_finances,
            request.profile,
            request.insurance,
            insurance_need
        )
        
        # 改善提案
        recommendations = generate_recommendations(
            yearly_finances,
            request.profile,
            request.investment,
            insurance_need,
            risk_assessment
        )
        
        # 生涯収支計算
        total_lifetime_income = sum(yf.income for yf in yearly_finances)
        total_lifetime_expenses = sum(yf.expenses for yf in yearly_finances)
        final_assets = yearly_finances[-1].total_assets if yearly_finances else 0
        
        return LifePlanResponse(
            yearly_finances=yearly_finances,
            pension_estimate=pension_estimate,
            insurance_need=insurance_need,
            tax_calculation=tax_calculation,
            total_lifetime_income=total_lifetime_income,
            total_lifetime_expenses=total_lifetime_expenses,
            final_assets=final_assets,
            risk_assessment=risk_assessment,
            recommendations=recommendations
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/tax-calculation")
async def calculate_tax_api(
    annual_income: int,
    employment_type: EmploymentType,
    family_count: int = 1,
    has_spouse: bool = False,
    spouse_income: int = 0
):
    """税金計算API"""
    social_insurance = calculate_social_insurance(annual_income, employment_type)
    
    # 簡易プロファイル作成
    profile = UserProfile(
        name="計算用",
        age=40,
        gender=Gender.MALE,
        birth_year=1984,
        employment_type=employment_type,
        marital_status=MaritalStatus.MARRIED if has_spouse else MaritalStatus.SINGLE,
        annual_income=annual_income,
        family_members=[]
    )
    
    tax = calculate_tax(profile, social_insurance["total"], family_count)
    
    return {
        "social_insurance": social_insurance,
        "tax": tax
    }


@app.post("/api/pension-simulation")
async def simulate_pension(
    age: int,
    employment_type: EmploymentType,
    annual_income: int,
    enrollment_months_national: int = 0,
    enrollment_months_employee: int = 0
):
    """年金シミュレーションAPI"""
    profile = UserProfile(
        name="計算用",
        age=age,
        gender=Gender.MALE,
        birth_year=2024 - age,
        employment_type=employment_type,
        marital_status=MaritalStatus.SINGLE,
        annual_income=annual_income,
        family_members=[]
    )
    
    pension_info = PensionInfo(
        enrollment_months_national=enrollment_months_national,
        enrollment_months_employee=enrollment_months_employee,
        average_salary=annual_income // 12 // 1.5
    )
    
    pension = estimate_future_pension(profile, pension_info)
    
    return {
        "pension": pension,
        "monthly_pension": pension.total_pension // 12
    }


@app.post("/api/housing-loan")
async def calculate_housing_loan_api(
    purchase_price: int,
    down_payment: int,
    loan_years: int = 35,
    interest_rate: float = 1.0
):
    """住宅ローン計算API"""
    housing = HousingPlan(
        is_owner=True,
        purchase_price=purchase_price,
        down_payment=down_payment,
        loan_years=loan_years,
        interest_rate=interest_rate
    )
    
    result = calculate_housing_loan(housing)
    return result


@app.post("/api/investment-simulation")
async def simulate_investment_api(
    initial_amount: int = 0,
    monthly_investment: int = 30000,
    years: int = 20,
    return_rate: float = 5.0
):
    """資産運用シミュレーションAPI"""
    result = simulate_investment(
        initial_amount,
        monthly_investment,
        years,
        return_rate
    )
    return result


@app.post("/api/education-cost")
async def calculate_education_cost_api(
    child_age: int,
    kindergarten: EducationType = EducationType.PUBLIC,
    elementary: EducationType = EducationType.PUBLIC,
    junior_high: EducationType = EducationType.PUBLIC,
    high_school: EducationType = EducationType.PUBLIC,
    university: EducationType = EducationType.PUBLIC,
    university_type: str = "文系"
):
    """教育費計算API"""
    plan = ChildEducationPlan(
        child_age=child_age,
        kindergarten=kindergarten,
        elementary=elementary,
        junior_high=junior_high,
        high_school=high_school,
        university=university,
        university_type=university_type
    )
    
    result = calculate_detailed_education_cost(plan)
    return result


@app.get("/api/life-events/templates")
async def get_life_event_templates():
    """ライフイベントテンプレート取得API"""
    return {
        "templates": [
            {
                "event_type": LifeEventType.MARRIAGE,
                "name": "結婚",
                "typical_cost": 3500000,
                "description": "結婚式・披露宴費用"
            },
            {
                "event_type": LifeEventType.CHILDBIRTH,
                "name": "出産",
                "typical_cost": 500000,
                "description": "出産費用（出産一時金42万円控除後）"
            },
            {
                "event_type": LifeEventType.HOUSE_PURCHASE,
                "name": "住宅購入",
                "typical_cost": 40000000,
                "description": "住宅購入費用（マンション・戸建て）"
            },
            {
                "event_type": LifeEventType.CAR_PURCHASE,
                "name": "車購入",
                "typical_cost": 3000000,
                "description": "自動車購入費用"
            },
            {
                "event_type": LifeEventType.CHILD_EDUCATION,
                "name": "子供の進学",
                "typical_cost": 1000000,
                "description": "入学金・準備費用"
            },
            {
                "event_type": LifeEventType.CHILD_MARRIAGE,
                "name": "子供の結婚",
                "typical_cost": 1000000,
                "description": "結婚援助費用"
            },
            {
                "event_type": LifeEventType.HOME_RENOVATION,
                "name": "リフォーム",
                "typical_cost": 5000000,
                "description": "住宅リフォーム費用"
            },
            {
                "event_type": LifeEventType.TRAVEL,
                "name": "旅行",
                "typical_cost": 500000,
                "description": "海外旅行など"
            },
            {
                "event_type": LifeEventType.RETIREMENT,
                "name": "退職",
                "typical_cost": 0,
                "description": "退職（退職金収入あり）"
            }
        ]
    }


@app.get("/api/defaults")
async def get_default_values():
    """デフォルト値取得API"""
    return {
        "monthly_expenses": {
            "housing": 80000,
            "utilities": 15000,
            "food": 60000,
            "transportation": 15000,
            "communication": 10000,
            "insurance": 20000,
            "education": 0,
            "entertainment": 30000,
            "clothing": 10000,
            "medical": 5000,
            "other": 20000
        },
        "investment": {
            "monthly_investment": 30000,
            "expected_return_rate": 4.0,
            "risk_tolerance": "moderate"
        },
        "insurance": {
            "life_insurance_amount": 30000000,
            "monthly_premium": 15000
        },
        "typical_retirement_bonus": {
            "company_employee": 20000000,
            "civil_servant": 22000000
        }
    }


# サンプルデータ生成用エンドポイント
@app.get("/api/sample-profile")
async def get_sample_profile():
    """サンプルプロファイル取得"""
    return {
        "profile": {
            "name": "山田太郎",
            "age": 35,
            "gender": "male",
            "birth_year": 1989,
            "employment_type": "company_employee",
            "marital_status": "married",
            "annual_income": 6000000,
            "bonus_months": 4.0,
            "retirement_age": 65,
            "life_expectancy": 90,
            "family_members": [
                {
                    "name": "山田花子",
                    "age": 33,
                    "relationship": "配偶者",
                    "annual_income": 1200000,
                    "employment_type": "part_time"
                },
                {
                    "name": "山田一郎",
                    "age": 5,
                    "relationship": "子",
                    "annual_income": 0
                }
            ]
        },
        "assets": {
            "cash_deposits": 5000000,
            "stocks": 1000000,
            "investment_trusts": 500000,
            "bonds": 0,
            "real_estate": 0,
            "insurance_surrender_value": 500000,
            "other_assets": 0
        },
        "liabilities": {
            "housing_loan": 0,
            "car_loan": 500000,
            "education_loan": 0,
            "credit_card": 0,
            "other_loans": 0
        },
        "monthly_expenses": {
            "housing": 100000,
            "utilities": 15000,
            "food": 70000,
            "transportation": 20000,
            "communication": 12000,
            "insurance": 25000,
            "education": 30000,
            "entertainment": 25000,
            "clothing": 10000,
            "medical": 5000,
            "other": 20000
        },
        "life_events": [
            {
                "event_type": "house_purchase",
                "year": 2027,
                "age": 38,
                "cost": 5000000,
                "description": "マイホーム購入頭金"
            },
            {
                "event_type": "car_purchase",
                "year": 2029,
                "age": 40,
                "cost": 3000000,
                "description": "車買い替え"
            }
        ],
        "insurance": {
            "life_insurance_amount": 20000000,
            "medical_insurance": True,
            "cancer_insurance": False,
            "disability_insurance": False,
            "monthly_premium": 15000
        },
        "investment": {
            "monthly_investment": 30000,
            "expected_return_rate": 4.0,
            "risk_tolerance": "moderate"
        },
        "pension": {
            "enrollment_months_national": 24,
            "enrollment_months_employee": 156,
            "average_salary": 350000,
            "ideco_monthly": 12000,
            "corporate_pension": False
        },
        "housing": {
            "is_owner": False,
            "purchase_year": 2027,
            "purchase_price": 45000000,
            "down_payment": 5000000,
            "loan_years": 35,
            "interest_rate": 1.2
        },
        "child_education_plans": [
            {
                "child_age": 5,
                "kindergarten": "public",
                "elementary": "public",
                "junior_high": "public",
                "high_school": "public",
                "university": "private",
                "university_type": "文系"
            }
        ]
    }
