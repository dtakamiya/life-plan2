from datetime import date, datetime
from typing import List
from .models import (
    UserProfile, Income, Expense, Asset, Liability, Insurance,
    EducationPlan, HousingLoan, RetirementPlan, LifePlanResponse
)


def calculate_age(birth_date: date, target_date: date) -> int:
    """年齢を計算"""
    return (target_date.year - birth_date.year - 
            ((target_date.month, target_date.day) < (birth_date.month, birth_date.day)))


def calculate_annual_income(incomes: List[Income], year: int) -> int:
    """年間収入を計算"""
    total = 0
    target_date = date(year, 1, 1)
    
    for income in incomes:
        if income.start_date.year > year:
            continue
        if income.end_date and income.end_date.year < year:
            continue
        
        if income.frequency == "monthly":
            total += income.amount * 12
        elif income.frequency == "yearly":
            total += income.amount
        elif income.frequency == "one_time":
            if income.start_date.year == year:
                total += income.amount
    
    return total


def calculate_annual_expense(expenses: List[Expense], year: int) -> int:
    """年間支出を計算"""
    total = 0
    target_date = date(year, 1, 1)
    
    for expense in expenses:
        if expense.start_date.year > year:
            continue
        if expense.end_date and expense.end_date.year < year:
            continue
        
        if expense.frequency == "monthly":
            total += expense.amount * 12
        elif expense.frequency == "yearly":
            total += expense.amount
        elif expense.frequency == "one_time":
            if expense.start_date.year == year:
                total += expense.amount
    
    return total


def calculate_insurance_expense(insurances: List[Insurance], year: int) -> int:
    """年間保険料を計算"""
    total = 0
    
    for insurance in insurances:
        if insurance.start_date.year > year:
            continue
        if insurance.end_date and insurance.end_date.year < year:
            continue
        
        if insurance.frequency == "monthly":
            total += insurance.premium * 12
        elif insurance.frequency == "yearly":
            total += insurance.premium
    
    return total


def calculate_liability_payment(liabilities: List[Liability], year: int) -> int:
    """年間負債返済額を計算"""
    total = 0
    
    for liability in liabilities:
        if liability.start_date.year > year or liability.end_date.year < year:
            continue
        total += liability.monthly_payment * 12
    
    return total


def calculate_housing_loan_payment(loans: List[HousingLoan], year: int) -> int:
    """年間住宅ローン返済額を計算"""
    total = 0
    
    for loan in loans:
        loan_end_year = loan.start_date.year + loan.loan_period_years
        if loan.start_date.year > year or loan_end_year <= year:
            continue
        total += loan.monthly_payment * 12
    
    return total


def calculate_education_cost(plans: List[EducationPlan], year: int) -> int:
    """年間教育費を計算"""
    total = 0
    
    for plan in plans:
        if plan.start_year <= year <= plan.end_year:
            # 教育費を期間で均等配分
            years = plan.end_year - plan.start_year + 1
            total += plan.expected_cost // years
    
    return total


def calculate_asset_value(assets: List[Asset], year: int, start_year: int) -> int:
    """資産価値を計算（複利計算）"""
    total = 0
    
    for asset in assets:
        years_passed = year - start_year
        if years_passed < 0:
            total += asset.current_value
        else:
            # 複利計算: 元本 * (1 + 利回り)^年数
            value = asset.current_value * ((1 + asset.expected_return_rate / 100) ** years_passed)
            total += int(value)
    
    return total


def calculate_liability_balance(liabilities: List[Liability], year: int) -> int:
    """負債残高を計算"""
    total = 0
    
    for liability in liabilities:
        if liability.start_date.year > year:
            continue
        if liability.end_date.year < year:
            continue
        
        # 簡易計算: 残高から年間返済額を引く
        years_passed = year - liability.start_date.year
        if years_passed > 0:
            remaining = liability.remaining_balance - (liability.monthly_payment * 12 * years_passed)
            total += max(0, remaining)
        else:
            total += liability.remaining_balance
    
    return total


def calculate_housing_loan_balance(loans: List[HousingLoan], year: int) -> int:
    """住宅ローン残高を計算"""
    total = 0
    
    for loan in loans:
        if loan.start_date.year > year:
            continue
        
        loan_end_year = loan.start_date.year + loan.loan_period_years
        if loan_end_year <= year:
            continue
        
        years_passed = year - loan.start_date.year
        if years_passed > 0:
            remaining = loan.loan_amount - (loan.monthly_payment * 12 * years_passed)
            total += max(0, remaining)
        else:
            total += loan.loan_amount
    
    return total


def calculate_retirement_savings(plans: List[RetirementPlan], year: int, start_year: int) -> int:
    """退職金・年金積立額を計算"""
    total = 0
    
    for plan in plans:
        if year < plan.retirement_age:
            years_passed = year - start_year
            if years_passed > 0:
                # 積立額を複利計算（簡易版: 年利2%と仮定）
                savings = plan.current_retirement_savings
                for y in range(years_passed):
                    savings = int(savings * 1.02) + (plan.monthly_contribution * 12)
                total += savings
            else:
                total += plan.current_retirement_savings
        else:
            # 退職後は退職金と年金を資産として計算
            if year == plan.retirement_age:
                total += plan.expected_retirement_benefit
            # 年金は収入として計算されるため、ここでは資産として扱わない
    
    return total


def generate_life_plan(
    user_profile: UserProfile,
    incomes: List[Income],
    expenses: List[Expense],
    assets: List[Asset],
    liabilities: List[Liability],
    insurances: List[Insurance],
    education_plans: List[EducationPlan],
    housing_loans: List[HousingLoan],
    retirement_plans: List[RetirementPlan],
    projection_years: int = 30
) -> List[LifePlanResponse]:
    """ライフプランを生成"""
    current_year = date.today().year
    start_year = current_year
    end_year = current_year + projection_years
    
    results = []
    cumulative_assets = sum(asset.current_value for asset in assets)
    
    for year in range(start_year, end_year + 1):
        age = calculate_age(user_profile.birth_date, date(year, 1, 1))
        events = []
        
        # 収入計算
        annual_income = calculate_annual_income(incomes, year)
        
        # 退職後の年金収入を追加
        for plan in retirement_plans:
            if year >= plan.retirement_age:
                annual_income += plan.monthly_pension * 12
                if year == plan.retirement_age:
                    events.append(f"{user_profile.name}が{plan.retirement_age}歳で退職")
        
        # 支出計算
        annual_expense = calculate_annual_expense(expenses, year)
        annual_expense += calculate_insurance_expense(insurances, year)
        annual_expense += calculate_liability_payment(liabilities, year)
        annual_expense += calculate_housing_loan_payment(housing_loans, year)
        annual_expense += calculate_education_cost(education_plans, year)
        
        # 教育費イベント
        for plan in education_plans:
            if plan.start_year == year:
                events.append(f"{plan.child_name}の{plan.education_type}教育開始（年間{plan.expected_cost // (plan.end_year - plan.start_year + 1):,}円）")
        
        # キャッシュフロー
        net_cashflow = annual_income - annual_expense
        
        # 資産計算（前年の資産 + キャッシュフロー + 資産運用リターン）
        if year > start_year:
            # 前年の結果から資産を取得
            prev_result = results[-1]
            cumulative_assets = prev_result.total_assets
            
            # キャッシュフローを加算
            cumulative_assets += net_cashflow
            
            # 資産運用リターンを計算（前年の資産に対して）
            asset_return = 0
            for asset in assets:
                years_passed = year - start_year
                if years_passed > 0:
                    # 前年の資産価値に対してリターンを適用
                    prev_asset_value = asset.current_value * ((1 + asset.expected_return_rate / 100) ** (years_passed - 1))
                    asset_return += int(prev_asset_value * (asset.expected_return_rate / 100))
                else:
                    asset_return += int(asset.current_value * (asset.expected_return_rate / 100))
            
            cumulative_assets += asset_return
            
            # 退職金積立の増加分を加算
            prev_retirement = calculate_retirement_savings(retirement_plans, year - 1, start_year)
            current_retirement = calculate_retirement_savings(retirement_plans, year, start_year)
            cumulative_assets += (current_retirement - prev_retirement)
        else:
            # 初年度は初期資産と退職金積立
            cumulative_assets = sum(asset.current_value for asset in assets)
            cumulative_assets += calculate_retirement_savings(retirement_plans, year, start_year)
        
        # 負債計算
        total_liabilities = calculate_liability_balance(liabilities, year)
        total_liabilities += calculate_housing_loan_balance(housing_loans, year)
        
        # 純資産
        net_worth = cumulative_assets - total_liabilities
        
        results.append(LifePlanResponse(
            year=year,
            age=age,
            total_income=annual_income,
            total_expense=annual_expense,
            net_cashflow=net_cashflow,
            total_assets=cumulative_assets,
            total_liabilities=total_liabilities,
            net_worth=net_worth,
            events=events
        ))
    
    return results
