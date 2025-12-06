from datetime import datetime
from typing import List, Literal, Optional, Tuple

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator


class GoalInput(BaseModel):
    name: str = Field(..., max_length=64)
    goal_type: Literal["education", "retirement", "housing", "travel", "care", "custom"] = "custom"
    year: int = Field(..., ge=1900, le=2200)
    amount: float = Field(..., gt=0)
    priority: Literal["high", "medium", "low"] = "medium"


class ProfileInput(BaseModel):
    current_age: int = Field(..., ge=18, le=80)
    retirement_age: int = Field(..., ge=40, le=80)
    life_expectancy: int = Field(..., ge=65, le=110)
    household_size: int = Field(1, ge=1, le=10)
    dependents: int = Field(0, ge=0, le=6)
    marital_status: Literal["single", "married", "other"] = "single"
    prefecture: Optional[str] = None


class CashflowInput(BaseModel):
    annual_income: float = Field(..., gt=0, description="現在の世帯年収（税引き前）")
    income_growth_rate: float = Field(0.02, ge=0, le=0.15)
    annual_expenses: float = Field(..., gt=0)
    expense_growth_rate: float = Field(0.01, ge=0, le=0.12)
    current_savings: float = Field(..., ge=0)
    monthly_investment: float = Field(30000, ge=0)
    investment_return_rate: float = Field(0.035, ge=-0.2, le=0.25)
    inflation_rate: float = Field(0.015, ge=0, le=0.08)
    retirement_income_rate: float = Field(
        0.6, ge=0.2, le=1.2, description="リタイア後に現役最終年収の何割を確保するか"
    )
    retirement_expense_rate: float = Field(
        0.85, ge=0.5, le=1.5, description="リタイア後の生活費係数"
    )


class ProtectionInput(BaseModel):
    emergency_fund_months: float = Field(6, gt=0, le=36)
    insurance_coverage: float = Field(0, ge=0)
    desired_insurance_multiple: float = Field(10, gt=1, le=30)
    risk_tolerance: Literal["conservative", "balanced", "growth"] = "balanced"


class StressScenarioInput(BaseModel):
    income_drop_pct: float = Field(0.15, ge=0, le=0.5)
    market_drop_pct: float = Field(0.12, ge=0, le=0.5)
    duration_years: int = Field(3, ge=1, le=10)


class PlanRequest(BaseModel):
    profile: ProfileInput
    cashflow: CashflowInput
    goals: List[GoalInput] = Field(default_factory=list)
    protection: ProtectionInput = Field(default_factory=ProtectionInput)
    stress: StressScenarioInput = Field(default_factory=StressScenarioInput)
    current_year: Optional[int] = None

    @model_validator(mode="after")
    def validate_ages(cls, values: "PlanRequest") -> "PlanRequest":
        profile = values.profile
        if profile.retirement_age <= profile.current_age:
            raise ValueError("retirement_age は current_age より大きい必要があります。")
        if profile.life_expectancy <= profile.retirement_age:
            raise ValueError("life_expectancy は retirement_age より大きい必要があります。")
        return values


class ProjectionPoint(BaseModel):
    year: int
    age: int
    income: float
    expenses: float
    surplus_before_invest: float
    invested_amount: float
    goal_cost: float
    investment_growth: float
    net_cash_flow: float
    assets: float


class GoalStatus(BaseModel):
    name: str
    year: int
    goal_type: str
    inflated_amount: float
    funded_ratio: float
    funded: bool
    priority: str


class PlanSummary(BaseModel):
    sustainability_score: int
    shortfall_year: Optional[int]
    financial_independence_age: Optional[int]
    terminal_assets: float
    emergency_fund_gap: float
    insurance_gap: float
    savings_rate: float


class StressTestResult(BaseModel):
    duration_years: int
    income_drop_pct: float
    market_drop_pct: float
    shortfall_year: Optional[int]
    terminal_assets: float


class PlanResponse(BaseModel):
    summary: PlanSummary
    timeline: List[ProjectionPoint]
    goals: List[GoalStatus]
    warnings: List[str]
    recommendations: List[str]
    stress_test: StressTestResult


class LifePlanEngine:
    """シンプルなライフプラン試算エンジン。"""

    def __init__(self, request: PlanRequest):
        self.request = request
        self.current_year = request.current_year or datetime.now().year

    def run(self) -> PlanResponse:
        base_timeline, base_goal_records = self._run_simulation()
        stress_timeline, _ = self._run_simulation(
            income_shock=self.request.stress.income_drop_pct,
            market_shock=self.request.stress.market_drop_pct,
            shock_years=self.request.stress.duration_years,
        )
        summary = self._build_summary(base_timeline)
        goal_statuses = self._build_goal_statuses(base_goal_records)
        warnings, recommendations = self._build_messages(summary, goal_statuses)
        stress_summary = self._build_stress_summary(stress_timeline)
        return PlanResponse(
            summary=summary,
            timeline=base_timeline,
            goals=goal_statuses,
            warnings=warnings,
            recommendations=recommendations,
            stress_test=stress_summary,
        )

    def _run_simulation(
        self,
        income_shock: float = 0.0,
        market_shock: float = 0.0,
        shock_years: int = 0,
    ) -> Tuple[List[ProjectionPoint], List[dict]]:
        profile = self.request.profile
        cashflow = self.request.cashflow
        total_years = profile.life_expectancy - profile.current_age + 1
        assets = cashflow.current_savings
        timeline: List[ProjectionPoint] = []
        goal_records: List[dict] = []
        stress_end = self.current_year + shock_years - 1
        retirement_year_index = profile.retirement_age - profile.current_age
        retirement_income_base = cashflow.annual_income * (
            (1 + cashflow.income_growth_rate) ** max(retirement_year_index, 0)
        )

        for year_idx in range(total_years):
            age = profile.current_age + year_idx
            calendar_year = self.current_year + year_idx
            is_retired = age >= profile.retirement_age
            shock_applies = calendar_year <= stress_end and shock_years > 0

            if not is_retired:
                income = cashflow.annual_income * (
                    (1 + cashflow.income_growth_rate) ** year_idx
                )
            else:
                years_since_retirement = age - profile.retirement_age
                income = retirement_income_base * cashflow.retirement_income_rate * (
                    (1 + cashflow.inflation_rate) ** years_since_retirement
                )

            if shock_applies:
                income *= 1 - income_shock

            expenses = cashflow.annual_expenses * (
                (1 + cashflow.expense_growth_rate) ** year_idx
            )
            if is_retired:
                expenses *= cashflow.retirement_expense_rate

            surplus = income - expenses
            contribution_target = cashflow.monthly_investment * 12
            invested = min(contribution_target, max(surplus, 0))
            net_cash_flow = surplus - invested

            assets += invested + net_cash_flow
            goal_cost = 0.0
            for goal in self.request.goals:
                if goal.year == calendar_year:
                    inflation_years = max(calendar_year - self.current_year, 0)
                    inflated_amount = goal.amount * (
                        (1 + cashflow.inflation_rate) ** inflation_years
                    )
                    goal_cost += inflated_amount
                    goal_records.append(
                        {
                            "goal": goal,
                            "year": calendar_year,
                            "inflated_amount": inflated_amount,
                            "assets_before_goal": assets,
                        }
                    )

            assets -= goal_cost

            effective_return = cashflow.investment_return_rate
            if shock_applies:
                effective_return -= market_shock
            effective_return = max(effective_return, -0.95)

            investment_growth = assets * effective_return
            assets += investment_growth

            timeline.append(
                ProjectionPoint(
                    year=calendar_year,
                    age=age,
                    income=round(income, 2),
                    expenses=round(expenses, 2),
                    surplus_before_invest=round(surplus, 2),
                    invested_amount=round(invested, 2),
                    goal_cost=round(goal_cost, 2),
                    investment_growth=round(investment_growth, 2),
                    net_cash_flow=round(net_cash_flow, 2),
                    assets=round(assets, 2),
                )
            )

        return timeline, goal_records

    def _build_summary(self, timeline: List[ProjectionPoint]) -> PlanSummary:
        protection = self.request.protection
        cashflow = self.request.cashflow
        if not timeline:
            raise ValueError("timeline is empty")

        positive_years = len([point for point in timeline if point.assets >= 0])
        sustainability_score = round(positive_years / len(timeline) * 100)

        shortfall_year = next((point.year for point in timeline if point.assets < 0), None)
        target_assets_for_fire = [
            point.expenses * 25 for point in timeline
        ]  # 4%ルールベース
        fi_age = None
        for point, target in zip(timeline, target_assets_for_fire):
            if point.assets >= target:
                fi_age = point.age
                break

        terminal_assets = timeline[-1].assets
        emergency_target = (cashflow.annual_expenses / 12) * protection.emergency_fund_months
        emergency_gap = max(0.0, emergency_target - cashflow.current_savings)
        insurance_target = cashflow.annual_income * protection.desired_insurance_multiple
        insurance_gap = max(0.0, insurance_target - protection.insurance_coverage)

        total_income = sum(point.income for point in timeline)
        total_invested = sum(point.invested_amount for point in timeline)
        savings_rate = round(total_invested / total_income, 3) if total_income else 0.0

        return PlanSummary(
            sustainability_score=sustainability_score,
            shortfall_year=shortfall_year,
            financial_independence_age=fi_age,
            terminal_assets=round(terminal_assets, 2),
            emergency_fund_gap=round(emergency_gap, 2),
            insurance_gap=round(insurance_gap, 2),
            savings_rate=savings_rate,
        )

    def _build_goal_statuses(self, goal_records: List[dict]) -> List[GoalStatus]:
        statuses: List[GoalStatus] = []
        for record in goal_records:
            goal: GoalInput = record["goal"]
            inflated_amount = record["inflated_amount"]
            assets_before = record["assets_before_goal"]
            funded_ratio = min(assets_before / inflated_amount, 2.0) if inflated_amount else 0.0
            statuses.append(
                GoalStatus(
                    name=goal.name,
                    year=record["year"],
                    goal_type=goal.goal_type,
                    inflated_amount=round(inflated_amount, 2),
                    funded_ratio=round(funded_ratio, 2),
                    funded=assets_before >= inflated_amount,
                    priority=goal.priority,
                )
            )
        return statuses

    def _build_messages(
        self, summary: PlanSummary, goals: List[GoalStatus]
    ) -> Tuple[List[str], List[str]]:
        warnings: List[str] = []
        recommendations: List[str] = []

        if summary.shortfall_year:
            warnings.append(f"{summary.shortfall_year}年に資産がマイナス圏へ突入する見込みです。")
            recommendations.append("支出の見直しまたはリタイア年齢の再設定を検討してください。")

        if summary.emergency_fund_gap > 0:
            months = self.request.protection.emergency_fund_months
            warnings.append("生活防衛資金が推奨額を下回っています。")
            recommendations.append(
                f"少なくとも{months}か月分の生活費を現金で確保しましょう。"
            )

        if summary.insurance_gap > 0:
            recommendations.append("生命保険・収入保障保険の上乗せを検討してください。")

        underfunded_goals = [goal for goal in goals if not goal.funded]
        if underfunded_goals:
            warn_names = ", ".join(goal.name for goal in underfunded_goals)
            warnings.append(f"以下のゴールが未達です: {warn_names}")
            recommendations.append("優先度の低いゴールから金額・時期の調整を検討してください。")

        if not warnings:
            recommendations.append("現状のキャッシュフローを維持できれば計画は概ね健全です。")

        risk_note = {
            "conservative": "守り重視の配分を維持しつつ、インフレ耐性を確保しましょう。",
            "balanced": "バランス型ポートフォリオで長期リターンとブレを両立しましょう。",
            "growth": "株式比率が高い場合は下落局面での耐久資金を別枠で確保しましょう。",
        }
        recommendations.append(risk_note[self.request.protection.risk_tolerance])

        return warnings, recommendations

    def _build_stress_summary(self, timeline: List[ProjectionPoint]) -> StressTestResult:
        shortfall_year = next((point.year for point in timeline if point.assets < 0), None)
        terminal_assets = timeline[-1].assets if timeline else 0.0
        stress = self.request.stress
        return StressTestResult(
            duration_years=stress.duration_years,
            income_drop_pct=stress.income_drop_pct,
            market_drop_pct=stress.market_drop_pct,
            shortfall_year=shortfall_year,
            terminal_assets=round(terminal_assets, 2),
        )


app = FastAPI(title="Life Planning API", version="0.1.0")

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


@app.post("/plan", response_model=PlanResponse)
async def create_plan(request: PlanRequest) -> PlanResponse:
    engine = LifePlanEngine(request)
    return engine.run()
