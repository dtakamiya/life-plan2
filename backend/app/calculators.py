"""
FP1級レベルのライフプランニング計算ロジック
"""
from typing import Optional
from .models import (
    UserProfile, Asset, Liability, MonthlyExpense, LifeEvent,
    InsuranceInfo, InvestmentPlan, PensionInfo, HousingPlan,
    ChildEducationPlan, YearlyFinance, PensionEstimate, InsuranceNeed,
    TaxCalculation, EmploymentType, LifeEventType, EducationType
)
import math


# ===== 税金・社会保険計算 =====

def calculate_social_insurance(annual_income: int, employment_type: EmploymentType) -> dict:
    """社会保険料計算（2024年度基準）"""
    monthly_income = annual_income / 12
    
    if employment_type in [EmploymentType.COMPANY_EMPLOYEE, EmploymentType.CIVIL_SERVANT]:
        # 厚生年金保険料（18.3%の半分 = 9.15%）
        pension_rate = 0.0915
        # 健康保険料（約10%の半分 = 5%、協会けんぽ東京都基準）
        health_rate = 0.05
        # 雇用保険（0.6%）
        employment_rate = 0.006
        # 介護保険（40歳以上、1.82%の半分）
        care_rate = 0.0091
        
        # 標準報酬月額上限（厚生年金: 65万円）
        pension_base = min(monthly_income, 650000)
        # 標準報酬月額上限（健康保険: 139万円）
        health_base = min(monthly_income, 1390000)
        
        pension = int(pension_base * pension_rate * 12)
        health = int(health_base * health_rate * 12)
        employment = int(annual_income * employment_rate)
        care = int(health_base * care_rate * 12)
        
        return {
            "pension": pension,
            "health": health,
            "employment": employment,
            "care": care,
            "total": pension + health + employment + care
        }
    elif employment_type == EmploymentType.SELF_EMPLOYED:
        # 国民年金（月額16,980円 × 12ヶ月）
        pension = 16980 * 12
        # 国民健康保険（所得に応じて、簡易計算）
        health = int(annual_income * 0.08)  # 約8%と仮定
        
        return {
            "pension": pension,
            "health": health,
            "employment": 0,
            "care": 0,
            "total": pension + health
        }
    else:
        # その他（パート、専業主婦など）
        return {
            "pension": 0,
            "health": 0,
            "employment": 0,
            "care": 0,
            "total": 0
        }


def calculate_income_deductions(
    annual_income: int,
    social_insurance: int,
    family_count: int,
    has_spouse: bool,
    spouse_income: int = 0
) -> dict:
    """所得控除計算"""
    deductions = {}
    
    # 基礎控除（所得2400万円以下: 48万円）
    if annual_income <= 24000000:
        deductions["基礎控除"] = 480000
    elif annual_income <= 24500000:
        deductions["基礎控除"] = 320000
    elif annual_income <= 25000000:
        deductions["基礎控除"] = 160000
    else:
        deductions["基礎控除"] = 0
    
    # 給与所得控除
    if annual_income <= 1625000:
        employment_deduction = 550000
    elif annual_income <= 1800000:
        employment_deduction = int(annual_income * 0.4 - 100000)
    elif annual_income <= 3600000:
        employment_deduction = int(annual_income * 0.3 + 80000)
    elif annual_income <= 6600000:
        employment_deduction = int(annual_income * 0.2 + 440000)
    elif annual_income <= 8500000:
        employment_deduction = int(annual_income * 0.1 + 1100000)
    else:
        employment_deduction = 1950000
    deductions["給与所得控除"] = employment_deduction
    
    # 社会保険料控除
    deductions["社会保険料控除"] = social_insurance
    
    # 配偶者控除・配偶者特別控除
    if has_spouse and spouse_income <= 480000:
        deductions["配偶者控除"] = 380000
    elif has_spouse and spouse_income <= 1330000:
        # 配偶者特別控除（簡易計算）
        deductions["配偶者特別控除"] = max(0, 380000 - int((spouse_income - 480000) * 0.5))
    
    # 扶養控除（16歳以上の子供など、簡易計算）
    dependent_count = max(0, family_count - 2)  # 本人と配偶者を除く
    if dependent_count > 0:
        deductions["扶養控除"] = dependent_count * 380000
    
    return deductions


def calculate_income_tax(taxable_income: int) -> int:
    """所得税計算（2024年度税率）"""
    if taxable_income <= 0:
        return 0
    elif taxable_income <= 1950000:
        tax = int(taxable_income * 0.05)
    elif taxable_income <= 3300000:
        tax = int(taxable_income * 0.1 - 97500)
    elif taxable_income <= 6950000:
        tax = int(taxable_income * 0.2 - 427500)
    elif taxable_income <= 9000000:
        tax = int(taxable_income * 0.23 - 636000)
    elif taxable_income <= 18000000:
        tax = int(taxable_income * 0.33 - 1536000)
    elif taxable_income <= 40000000:
        tax = int(taxable_income * 0.4 - 2796000)
    else:
        tax = int(taxable_income * 0.45 - 4796000)
    
    # 復興特別所得税（2.1%）
    return int(tax * 1.021)


def calculate_resident_tax(taxable_income: int) -> int:
    """住民税計算（所得割10% + 均等割5,000円）"""
    if taxable_income <= 0:
        return 5000
    return int(taxable_income * 0.1) + 5000


def calculate_tax(
    profile: UserProfile,
    social_insurance: int,
    family_count: int
) -> TaxCalculation:
    """税金総合計算"""
    annual_income = profile.annual_income
    
    # 配偶者情報
    has_spouse = profile.marital_status.value == "married"
    spouse_income = 0
    for member in profile.family_members:
        if member.relationship == "配偶者":
            spouse_income = member.annual_income
            break
    
    # 所得控除計算
    deductions = calculate_income_deductions(
        annual_income, social_insurance, family_count, has_spouse, spouse_income
    )
    total_deductions = sum(deductions.values())
    
    # 課税所得
    taxable_income = max(0, annual_income - total_deductions)
    
    # 税額計算
    income_tax = calculate_income_tax(taxable_income)
    resident_tax = calculate_resident_tax(taxable_income)
    
    # 手取り
    net_income = annual_income - income_tax - resident_tax - social_insurance
    
    return TaxCalculation(
        gross_income=annual_income,
        income_deductions=total_deductions,
        taxable_income=taxable_income,
        income_tax=income_tax,
        resident_tax=resident_tax,
        social_insurance=social_insurance,
        net_income=net_income
    )


# ===== 年金計算 =====

def calculate_pension(profile: UserProfile, pension_info: PensionInfo) -> PensionEstimate:
    """年金計算（2024年度基準）"""
    
    # 老齢基礎年金（満額: 816,000円/年、40年加入時）
    # 加入月数に応じて按分
    total_months = pension_info.enrollment_months_national + pension_info.enrollment_months_employee
    max_months = 480  # 40年 × 12ヶ月
    basic_pension = int(816000 * min(total_months, max_months) / max_months)
    
    # 老齢厚生年金（報酬比例部分）
    # 計算式: 平均標準報酬月額 × 5.481/1000 × 加入月数
    if pension_info.enrollment_months_employee > 0 and pension_info.average_salary > 0:
        employee_pension = int(
            pension_info.average_salary * (5.481 / 1000) * pension_info.enrollment_months_employee
        )
    else:
        employee_pension = 0
    
    # 経過的加算（簡易計算）
    transitional_addition = 0
    
    total_pension = basic_pension + employee_pension + transitional_addition
    
    return PensionEstimate(
        basic_pension=basic_pension,
        employee_pension=employee_pension,
        total_pension=total_pension,
        start_age=65
    )


def estimate_future_pension(profile: UserProfile, current_pension_info: PensionInfo) -> PensionEstimate:
    """将来の年金を予測"""
    current_age = profile.age
    retirement_age = profile.retirement_age
    
    # 現在から退職までの追加加入月数
    remaining_years = max(0, min(retirement_age, 60) - current_age)
    additional_months = remaining_years * 12
    
    # 将来の加入月数を計算
    if profile.employment_type in [EmploymentType.COMPANY_EMPLOYEE, EmploymentType.CIVIL_SERVANT]:
        future_employee_months = current_pension_info.enrollment_months_employee + additional_months
        future_national_months = current_pension_info.enrollment_months_national
        # 平均報酬を現在の収入から推定
        avg_salary = profile.annual_income // 12 // 1.5  # ボーナス考慮
    elif profile.employment_type == EmploymentType.SELF_EMPLOYED:
        future_employee_months = current_pension_info.enrollment_months_employee
        future_national_months = current_pension_info.enrollment_months_national + additional_months
        avg_salary = current_pension_info.average_salary
    else:
        future_employee_months = current_pension_info.enrollment_months_employee
        future_national_months = current_pension_info.enrollment_months_national
        avg_salary = current_pension_info.average_salary
    
    # 将来の年金額を計算
    total_months = future_national_months + future_employee_months
    basic_pension = int(816000 * min(total_months, 480) / 480)
    
    if future_employee_months > 0 and avg_salary > 0:
        employee_pension = int(avg_salary * (5.481 / 1000) * future_employee_months)
    else:
        employee_pension = 0
    
    return PensionEstimate(
        basic_pension=basic_pension,
        employee_pension=employee_pension,
        total_pension=basic_pension + employee_pension,
        start_age=65
    )


# ===== 保険必要保障額計算 =====

def calculate_insurance_need(
    profile: UserProfile,
    monthly_expenses: MonthlyExpense,
    assets: Asset,
    liabilities: Liability,
    insurance: InsuranceInfo,
    pension_estimate: PensionEstimate
) -> InsuranceNeed:
    """必要保障額計算（遺族生活資金法）"""
    
    # 家族情報
    has_spouse = profile.marital_status.value == "married"
    children = [m for m in profile.family_members if m.relationship == "子"]
    youngest_child_age = min([c.age for c in children]) if children else 0
    
    # 遺族の生活費必要額
    monthly_living = (
        monthly_expenses.food +
        monthly_expenses.utilities +
        monthly_expenses.transportation +
        monthly_expenses.communication +
        monthly_expenses.medical +
        monthly_expenses.clothing +
        monthly_expenses.entertainment +
        monthly_expenses.other
    )
    
    # 子供が独立するまでの期間
    if children:
        years_until_independence = max(0, 22 - youngest_child_age)
        # 遺族生活費（子供がいる間は70%、その後は50%）
        living_with_children = int(monthly_living * 0.7 * 12 * years_until_independence)
        
        # 子供独立後の配偶者生活費
        if has_spouse:
            spouse_age = profile.age  # 簡易計算
            years_after_independence = max(0, 85 - spouse_age - years_until_independence)
            living_after_children = int(monthly_living * 0.5 * 12 * years_after_independence)
        else:
            living_after_children = 0
        
        total_living_cost = living_with_children + living_after_children
    elif has_spouse:
        # 子供なし、配偶者のみ
        years = max(0, 85 - profile.age)
        total_living_cost = int(monthly_living * 0.5 * 12 * years)
    else:
        total_living_cost = 0
    
    # 教育費
    education_cost = sum([
        estimate_education_cost(c.age) for c in children
    ])
    
    # 住宅費（住宅ローンは団信でカバーされる場合を想定）
    housing_cost = 0  # 団信ありの場合
    
    # 葬儀費用
    funeral_cost = 3000000
    
    # 緊急資金
    emergency_fund = monthly_living * 6
    
    # 必要資金合計
    total_needs = total_living_cost + education_cost + housing_cost + funeral_cost + emergency_fund
    
    # 遺族年金（概算）
    survivor_pension = estimate_survivor_pension(profile, pension_estimate)
    survivor_pension_total = survivor_pension * max(0, 85 - profile.age)
    
    # 現在の資産
    current_assets = (
        assets.cash_deposits +
        assets.stocks +
        assets.investment_trusts +
        assets.bonds +
        assets.insurance_surrender_value
    )
    
    # 必要保障額 = 必要資金 - 準備済み資金
    death_benefit_needed = max(0, total_needs - survivor_pension_total - current_assets)
    
    # 現在の保障額
    current_coverage = insurance.life_insurance_amount
    
    # 不足額
    gap = max(0, death_benefit_needed - current_coverage)
    
    return InsuranceNeed(
        death_benefit_needed=death_benefit_needed,
        current_coverage=current_coverage,
        gap=gap,
        emergency_fund_needed=emergency_fund,
        calculation_details={
            "total_living_cost": total_living_cost,
            "education_cost": education_cost,
            "funeral_cost": funeral_cost,
            "survivor_pension_total": survivor_pension_total,
            "current_assets": current_assets
        }
    )


def estimate_survivor_pension(profile: UserProfile, pension_estimate: PensionEstimate) -> int:
    """遺族年金概算（年額）"""
    # 遺族基礎年金（子供がいる場合）：約100万円/年
    # 遺族厚生年金：老齢厚生年金の3/4
    children = [m for m in profile.family_members if m.relationship == "子"]
    
    if profile.employment_type in [EmploymentType.COMPANY_EMPLOYEE, EmploymentType.CIVIL_SERVANT]:
        survivor_employee_pension = int(pension_estimate.employee_pension * 0.75)
        if children:
            survivor_basic_pension = 1000000
        else:
            survivor_basic_pension = 0
        return survivor_basic_pension + survivor_employee_pension
    else:
        if children:
            return 1000000
        return 0


def estimate_education_cost(child_age: int) -> int:
    """教育費概算（公立中心の場合）"""
    total = 0
    current_age = child_age
    
    # 幼稚園（3-5歳）: 公立約50万円
    if current_age < 6:
        years = max(0, 6 - max(3, current_age))
        total += years * 167000
    
    # 小学校（6-11歳）: 公立約200万円
    if current_age < 12:
        years = max(0, 12 - max(6, current_age))
        total += years * 333000
    
    # 中学校（12-14歳）: 公立約150万円
    if current_age < 15:
        years = max(0, 15 - max(12, current_age))
        total += years * 500000
    
    # 高校（15-17歳）: 公立約150万円
    if current_age < 18:
        years = max(0, 18 - max(15, current_age))
        total += years * 500000
    
    # 大学（18-21歳）: 国公立約250万円
    if current_age < 22:
        years = max(0, 22 - max(18, current_age))
        total += years * 625000
    
    return total


# ===== 教育費詳細計算 =====

EDUCATION_COSTS = {
    "kindergarten": {
        EducationType.PUBLIC: 165000,
        EducationType.PRIVATE: 309000
    },
    "elementary": {
        EducationType.PUBLIC: 353000,
        EducationType.PRIVATE: 1666000
    },
    "junior_high": {
        EducationType.PUBLIC: 539000,
        EducationType.PRIVATE: 1437000
    },
    "high_school": {
        EducationType.PUBLIC: 513000,
        EducationType.PRIVATE: 1054000
    },
    "university": {
        "国公立文系": 2425000,
        "国公立理系": 2425000,
        "私立文系": 4070000,
        "私立理系": 5510000,
        "私立医歯薬系": 24000000
    }
}


def calculate_detailed_education_cost(plan: ChildEducationPlan) -> dict:
    """詳細教育費計算"""
    costs = {}
    
    # 幼稚園（3年間）
    costs["幼稚園"] = EDUCATION_COSTS["kindergarten"][plan.kindergarten] * 3
    
    # 小学校（6年間）
    costs["小学校"] = EDUCATION_COSTS["elementary"][plan.elementary] * 6
    
    # 中学校（3年間）
    costs["中学校"] = EDUCATION_COSTS["junior_high"][plan.junior_high] * 3
    
    # 高校（3年間）
    costs["高校"] = EDUCATION_COSTS["high_school"][plan.high_school] * 3
    
    # 大学（4年間、医歯薬は6年間）
    univ_key = f"{'国公立' if plan.university == EducationType.PUBLIC else '私立'}{plan.university_type}"
    if univ_key in EDUCATION_COSTS["university"]:
        costs["大学"] = EDUCATION_COSTS["university"][univ_key]
    else:
        costs["大学"] = EDUCATION_COSTS["university"]["私立文系"]
    
    costs["合計"] = sum(costs.values())
    
    return costs


# ===== 住宅ローン計算 =====

def calculate_housing_loan(housing: HousingPlan) -> dict:
    """住宅ローン計算（元利均等返済）"""
    loan_amount = housing.purchase_price - housing.down_payment
    if loan_amount <= 0:
        return {
            "monthly_payment": 0,
            "total_payment": 0,
            "total_interest": 0
        }
    
    # 月利
    monthly_rate = housing.interest_rate / 100 / 12
    # 返済回数
    num_payments = housing.loan_years * 12
    
    if monthly_rate == 0:
        monthly_payment = loan_amount / num_payments
    else:
        # 元利均等返済の月額
        monthly_payment = loan_amount * monthly_rate * (1 + monthly_rate) ** num_payments / \
                          ((1 + monthly_rate) ** num_payments - 1)
    
    total_payment = monthly_payment * num_payments
    total_interest = total_payment - loan_amount
    
    return {
        "loan_amount": loan_amount,
        "monthly_payment": int(monthly_payment),
        "total_payment": int(total_payment),
        "total_interest": int(total_interest),
        "annual_payment": int(monthly_payment * 12)
    }


# ===== 資産運用シミュレーション =====

def simulate_investment(
    initial_amount: int,
    monthly_investment: int,
    years: int,
    return_rate: float
) -> dict:
    """資産運用シミュレーション（複利計算）"""
    monthly_rate = return_rate / 100 / 12
    months = years * 12
    
    # 現在価値（一括投資分）
    pv_lump_sum = initial_amount * (1 + monthly_rate) ** months
    
    # 積立投資分（将来価値）
    if monthly_rate == 0:
        fv_periodic = monthly_investment * months
    else:
        fv_periodic = monthly_investment * ((1 + monthly_rate) ** months - 1) / monthly_rate
    
    total_invested = initial_amount + monthly_investment * months
    final_value = pv_lump_sum + fv_periodic
    total_return = final_value - total_invested
    
    # 年別推移
    yearly_values = []
    current_value = initial_amount
    for year in range(1, years + 1):
        for month in range(12):
            current_value = current_value * (1 + monthly_rate) + monthly_investment
        yearly_values.append({
            "year": year,
            "value": int(current_value),
            "invested": initial_amount + monthly_investment * year * 12
        })
    
    return {
        "total_invested": int(total_invested),
        "final_value": int(final_value),
        "total_return": int(total_return),
        "return_rate_actual": round((final_value / total_invested - 1) * 100, 2) if total_invested > 0 else 0,
        "yearly_values": yearly_values
    }


# ===== キャッシュフロー分析 =====

def calculate_yearly_cashflow(
    profile: UserProfile,
    assets: Asset,
    liabilities: Liability,
    monthly_expenses: MonthlyExpense,
    life_events: list[LifeEvent],
    investment: InvestmentPlan,
    pension_estimate: PensionEstimate,
    housing: Optional[HousingPlan]
) -> list[YearlyFinance]:
    """年間キャッシュフロー計算"""
    results = []
    current_year = 2024
    current_age = profile.age
    
    # 初期資産
    total_assets = (
        assets.cash_deposits +
        assets.stocks +
        assets.investment_trusts +
        assets.bonds +
        assets.real_estate +
        assets.insurance_surrender_value +
        assets.other_assets
    )
    
    # 初期負債
    total_liabilities = (
        liabilities.housing_loan +
        liabilities.car_loan +
        liabilities.education_loan +
        liabilities.credit_card +
        liabilities.other_loans
    )
    
    net_assets = total_assets - total_liabilities
    
    # 住宅ローン計算
    housing_loan_payment = 0
    if housing and housing.purchase_year:
        loan_info = calculate_housing_loan(housing)
        housing_loan_payment = loan_info.get("annual_payment", 0)
    
    # 年間支出計算
    annual_expenses = (
        monthly_expenses.housing * 12 +
        monthly_expenses.utilities * 12 +
        monthly_expenses.food * 12 +
        monthly_expenses.transportation * 12 +
        monthly_expenses.communication * 12 +
        monthly_expenses.insurance * 12 +
        monthly_expenses.education * 12 +
        monthly_expenses.entertainment * 12 +
        monthly_expenses.clothing * 12 +
        monthly_expenses.medical * 12 +
        monthly_expenses.other * 12
    )
    
    # シミュレーション期間（現在〜想定寿命）
    simulation_years = profile.life_expectancy - current_age
    
    for i in range(simulation_years):
        year = current_year + i
        age = current_age + i
        notes = []
        
        # 収入計算
        if age < profile.retirement_age:
            # 就労中
            income = profile.annual_income
            # 年齢による昇給（簡易モデル：50歳まで年1%昇給）
            if age < 50:
                income = int(profile.annual_income * (1 + 0.01 * (age - current_age)))
            elif age < 60:
                income = int(profile.annual_income * (1 + 0.01 * (50 - current_age)))
            else:
                # 再雇用（60歳以降は7割）
                income = int(profile.annual_income * 0.7)
        else:
            # 退職後
            income = 0
        
        # 年金収入
        pension_income = 0
        if age >= 65:
            pension_income = pension_estimate.total_pension
            notes.append("年金受給開始")
        
        # 税金・社会保険
        if income > 0:
            social_insurance = calculate_social_insurance(income, profile.employment_type)
            family_count = len(profile.family_members) + 1
            tax = calculate_tax(profile, social_insurance["total"], family_count)
            income_after_tax = tax.net_income
        else:
            income_after_tax = pension_income
            # 年金からの税金（簡易計算）
            if pension_income > 1500000:
                income_after_tax = int(pension_income * 0.9)
        
        # ライフイベント費用
        life_event_cost = 0
        for event in life_events:
            if event.age == age:
                life_event_cost += event.cost
                notes.append(f"{event.event_type.value}: ¥{event.cost:,}")
        
        # 支出
        # 退職後は生活費7割想定
        if age >= profile.retirement_age:
            yearly_expenses = int(annual_expenses * 0.7)
        else:
            yearly_expenses = annual_expenses
        
        # 住宅ローン
        if housing and housing.purchase_year:
            if year >= housing.purchase_year and year < housing.purchase_year + housing.loan_years:
                yearly_expenses += housing_loan_payment
        
        # 総支出
        total_expenses = yearly_expenses + life_event_cost
        
        # 年間収支
        annual_savings = income_after_tax + pension_income - total_expenses
        
        # 投資収益（簡易計算）
        investment_return = 0
        if net_assets > 0 and investment.expected_return_rate > 0:
            investment_return = int(net_assets * investment.expected_return_rate / 100)
        
        # 資産更新
        net_assets = net_assets + annual_savings + investment_return
        
        # 積立投資
        net_assets += investment.monthly_investment * 12
        
        results.append(YearlyFinance(
            year=year,
            age=age,
            income=income + pension_income,
            income_after_tax=income_after_tax + pension_income,
            expenses=total_expenses,
            life_event_cost=life_event_cost,
            savings=annual_savings,
            total_assets=max(0, net_assets),
            investment_return=investment_return,
            pension_income=pension_income,
            notes=notes
        ))
    
    return results


# ===== リスク評価 =====

def assess_risks(
    yearly_finances: list[YearlyFinance],
    profile: UserProfile,
    insurance: InsuranceInfo,
    insurance_need: InsuranceNeed
) -> dict:
    """リスク評価"""
    risks = []
    score = 100
    
    # 資産マイナスリスク
    negative_years = [yf for yf in yearly_finances if yf.total_assets < 0]
    if negative_years:
        risks.append({
            "level": "high",
            "category": "資産枯渇リスク",
            "description": f"{negative_years[0].age}歳で資産がマイナスになる可能性があります",
            "suggestion": "支出の見直しまたは追加収入源の検討が必要です"
        })
        score -= 30
    
    # 保険不足リスク
    if insurance_need.gap > 0:
        if insurance_need.gap > 10000000:
            risks.append({
                "level": "high",
                "category": "保険不足リスク",
                "description": f"必要保障額に対して{insurance_need.gap:,}円不足しています",
                "suggestion": "生命保険の見直しを検討してください"
            })
            score -= 20
        else:
            risks.append({
                "level": "medium",
                "category": "保険不足リスク",
                "description": f"必要保障額に対して{insurance_need.gap:,}円不足しています",
                "suggestion": "保険の増額を検討してください"
            })
            score -= 10
    
    # 老後資金リスク
    retirement_age_finance = next(
        (yf for yf in yearly_finances if yf.age == 65), None
    )
    if retirement_age_finance:
        retirement_assets = retirement_age_finance.total_assets
        years_after_65 = profile.life_expectancy - 65
        needed_for_retirement = yearly_finances[-1].expenses * years_after_65 if yearly_finances else 0
        
        if retirement_assets < needed_for_retirement * 0.3:
            risks.append({
                "level": "high",
                "category": "老後資金不足リスク",
                "description": f"65歳時点の資産が{retirement_assets:,}円で、老後資金が不足する可能性があります",
                "suggestion": "iDeCoやNISAの活用、支出削減を検討してください"
            })
            score -= 25
    
    # 緊急資金リスク
    current_finance = yearly_finances[0] if yearly_finances else None
    if current_finance:
        monthly_expenses = current_finance.expenses // 12
        if current_finance.total_assets < monthly_expenses * 6:
            risks.append({
                "level": "medium",
                "category": "緊急資金不足リスク",
                "description": "6ヶ月分の生活費に相当する緊急資金が不足しています",
                "suggestion": "まず6ヶ月分の生活費を確保することを優先してください"
            })
            score -= 10
    
    return {
        "score": max(0, score),
        "risks": risks,
        "level": "high" if score < 50 else "medium" if score < 75 else "low"
    }


# ===== 改善提案 =====

def generate_recommendations(
    yearly_finances: list[YearlyFinance],
    profile: UserProfile,
    investment: InvestmentPlan,
    insurance_need: InsuranceNeed,
    risk_assessment: dict
) -> list[str]:
    """改善提案生成"""
    recommendations = []
    
    # リスクに基づく提案
    for risk in risk_assessment.get("risks", []):
        if risk["level"] == "high":
            recommendations.append(f"【重要】{risk['suggestion']}")
    
    # 投資提案
    if investment.monthly_investment == 0:
        recommendations.append(
            "毎月の積立投資を始めることをお勧めします。NISAを活用すれば非課税で運用できます。"
        )
    elif investment.monthly_investment < 30000:
        recommendations.append(
            "可能であれば、積立投資額を増やすことで老後資金を効率的に準備できます。"
        )
    
    # iDeCo提案
    if profile.employment_type in [EmploymentType.COMPANY_EMPLOYEE, EmploymentType.CIVIL_SERVANT]:
        recommendations.append(
            "iDeCoを活用すると、掛金が全額所得控除となり節税効果があります。"
        )
    elif profile.employment_type == EmploymentType.SELF_EMPLOYED:
        recommendations.append(
            "自営業者はiDeCoの上限が月額68,000円まで。小規模企業共済との併用も効果的です。"
        )
    
    # 保険提案
    if insurance_need.gap > 0:
        recommendations.append(
            f"生命保険の保障額を{insurance_need.gap:,}円程度増やすことを検討してください。"
        )
    
    # 老後資金提案
    final_assets = yearly_finances[-1].total_assets if yearly_finances else 0
    if final_assets < 0:
        deficit = abs(final_assets)
        years_to_retire = max(0, profile.retirement_age - profile.age)
        if years_to_retire > 0:
            monthly_needed = deficit // years_to_retire // 12
            recommendations.append(
                f"老後資金不足を解消するには、毎月約{monthly_needed:,}円の追加貯蓄が必要です。"
            )
    
    # 住居費提案
    # （住居費が収入の30%を超える場合など）
    
    return recommendations[:5]  # 最大5つの提案
