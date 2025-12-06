"""
FP一級レベルの計算ロジック
"""
from typing import List
from datetime import date
from .models import (
    LifePlan, YearlySimulation, SimulationResult,
    Gender, InsuranceType
)


def calculate_income_tax(income: int) -> int:
    """
    所得税を計算（簡易版）
    実際のFP一級では、より詳細な計算が必要
    """
    if income <= 195:
        return int(income * 0.05)
    elif income <= 330:
        return int(195 * 0.05 + (income - 195) * 0.10)
    elif income <= 695:
        return int(195 * 0.05 + 135 * 0.10 + (income - 330) * 0.20)
    elif income <= 900:
        return int(195 * 0.05 + 135 * 0.10 + 365 * 0.20 + (income - 695) * 0.23)
    elif income <= 1800:
        return int(195 * 0.05 + 135 * 0.10 + 365 * 0.20 + 205 * 0.23 + (income - 900) * 0.33)
    elif income <= 4000:
        return int(195 * 0.05 + 135 * 0.10 + 365 * 0.20 + 205 * 0.23 + 900 * 0.33 + (income - 1800) * 0.40)
    else:
        return int(195 * 0.05 + 135 * 0.10 + 365 * 0.20 + 205 * 0.23 + 900 * 0.33 + 2200 * 0.40 + (income - 4000) * 0.45)


def calculate_resident_tax(income: int) -> int:
    """
    住民税を計算（簡易版）
    """
    return int(income * 0.10)


def calculate_social_insurance(income: int) -> int:
    """
    社会保険料を計算（簡易版：健康保険・厚生年金・雇用保険）
    """
    # 健康保険料: 約5%
    # 厚生年金保険料: 約9.15%
    # 雇用保険料: 約0.3%
    return int(income * 0.1445)


def calculate_net_income(income: int) -> int:
    """
    手取り収入を計算
    """
    income_tax = calculate_income_tax(income)
    resident_tax = calculate_resident_tax(income)
    social_insurance = calculate_social_insurance(income)
    return income - income_tax - resident_tax - social_insurance


def calculate_pension_amount(age: int, pension_start_age: int = 65) -> int:
    """
    年金受給額を計算（簡易版）
    実際のFP一級では、加入期間や給与などを考慮した詳細な計算が必要
    """
    if age < pension_start_age:
        return 0
    # 簡易計算：基礎年金 + 厚生年金（仮）
    return 80  # 万円/年（簡易値）


def calculate_retirement_benefit(age: int, payment_age: int, amount: int) -> int:
    """
    退職金の支給を計算
    """
    if age == payment_age:
        return amount
    return 0


def calculate_asset_growth(current_assets: int, return_rate: float = 0.03) -> int:
    """
    資産の運用利回りを計算
    """
    return int(current_assets * return_rate)


def calculate_life_event_cost(year: int, life_events: List) -> int:
    """
    ライフイベントによる支出を計算
    """
    total_cost = 0
    for event in life_events:
        if event.year == year and event.amount:
            total_cost += event.amount
    return total_cost


def simulate_life_plan(plan: LifePlan, end_age: int = 100) -> SimulationResult:
    """
    ライフプランをシミュレーション
    """
    yearly_data = []
    current_age = (date.today() - plan.profile.birth_date).days // 365
    current_assets = (
        plan.assets.cash + plan.assets.stocks + plan.assets.bonds +
        plan.assets.real_estate + plan.assets.other_assets
    )
    current_liabilities = plan.liabilities.mortgage + plan.liabilities.other_loans
    
    retirement_age = plan.income.retirement_age
    retirement_assets = 0
    
    for year_offset in range(end_age - current_age + 1):
        year = date.today().year + year_offset
        age = current_age + year_offset
        
        # 収入計算
        if age < retirement_age:
            gross_income = plan.income.annual_salary + plan.income.bonus + plan.income.other_income
            net_income = calculate_net_income(gross_income)
        else:
            # 退職後
            net_income = 0
            if plan.pension:
                net_income += calculate_pension_amount(age, plan.pension.start_age)
            if plan.retirement_benefit:
                net_income += calculate_retirement_benefit(
                    age, plan.retirement_benefit.payment_age, plan.retirement_benefit.amount
                )
        
        # 支出計算
        expense = plan.expense.living_expenses + plan.expense.housing_expenses
        expense += plan.expense.education_expenses + plan.expense.insurance_premiums
        expense += plan.expense.other_expenses
        
        # ライフイベントによる支出
        life_event_cost = calculate_life_event_cost(year, plan.life_events)
        expense += life_event_cost
        
        # 資産の運用収益
        asset_growth = calculate_asset_growth(current_assets)
        
        # 資産・負債の更新
        if age < retirement_age:
            current_assets += net_income - expense + asset_growth
        else:
            current_assets += net_income - expense + asset_growth
        
        # 負債の返済（簡易：年間一定額）
        if current_liabilities > 0:
            annual_repayment = min(plan.liabilities.mortgage // 30, current_liabilities)
            current_liabilities -= annual_repayment
            current_assets -= annual_repayment
        
        # 税額計算
        if age < retirement_age:
            gross_income = plan.income.annual_salary + plan.income.bonus + plan.income.other_income
            tax = calculate_income_tax(gross_income) + calculate_resident_tax(gross_income)
        else:
            tax = 0
        
        net_worth = current_assets - current_liabilities
        
        yearly_data.append(YearlySimulation(
            year=year,
            age=age,
            income=net_income,
            expense=expense,
            assets=current_assets,
            liabilities=current_liabilities,
            net_worth=net_worth,
            tax=tax
        ))
        
        if age == retirement_age:
            retirement_assets = current_assets
    
    # 退職後の不足額を計算
    pension_shortfall = None
    if retirement_age < end_age:
        # 退職後の年間必要額を計算
        annual_need = plan.expense.living_expenses + plan.expense.housing_expenses
        annual_pension = 0
        if plan.pension:
            annual_pension = plan.pension.basic_pension
            if plan.pension.employee_pension:
                annual_pension += plan.pension.employee_pension
        
        if annual_need > annual_pension:
            shortfall_per_year = annual_need - annual_pension
            years_in_retirement = end_age - retirement_age
            pension_shortfall = shortfall_per_year * years_in_retirement
    
    return SimulationResult(
        yearly_data=yearly_data,
        retirement_age=retirement_age,
        retirement_assets=retirement_assets,
        pension_shortfall=pension_shortfall
    )


def calculate_inheritance_tax(assets: int, heirs: int = 1) -> int:
    """
    相続税を計算（簡易版）
    実際のFP一級では、基礎控除、配偶者控除、各種特例などを考慮
    """
    # 基礎控除: 3000万円 + 600万円 × 法定相続人数
    basic_deduction = 3000 + (600 * heirs)
    taxable_amount = max(0, assets - basic_deduction)
    
    if taxable_amount <= 0:
        return 0
    
    # 相続税の速算表（簡易版）
    if taxable_amount <= 1000:
        return int(taxable_amount * 0.10)
    elif taxable_amount <= 3000:
        return int(1000 * 0.10 + (taxable_amount - 1000) * 0.15)
    elif taxable_amount <= 5000:
        return int(1000 * 0.10 + 2000 * 0.15 + (taxable_amount - 3000) * 0.20)
    elif taxable_amount <= 10000:
        return int(1000 * 0.10 + 2000 * 0.15 + 2000 * 0.20 + (taxable_amount - 5000) * 0.30)
    elif taxable_amount <= 20000:
        return int(1000 * 0.10 + 2000 * 0.15 + 2000 * 0.20 + 5000 * 0.30 + (taxable_amount - 10000) * 0.40)
    else:
        return int(1000 * 0.10 + 2000 * 0.15 + 2000 * 0.20 + 5000 * 0.30 + 10000 * 0.40 + (taxable_amount - 20000) * 0.50)
