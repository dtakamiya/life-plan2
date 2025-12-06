## ライフプランニング API

FastAPI で提供する FP1 級レベルの資産シミュレーション API です。  
`/plan` へ世帯プロフィール・キャッシュフロー・ゴール情報を送ると、長期の資産推移、ゴールの達成状況、ストレステスト結果を返します。

### セットアップ

```bash
# 依存関係のインストール
cd backend
poetry install

# 開発サーバー
poetry run uvicorn app.main:app --reload --port 8000
```

Poetry を使わずに動かす場合は `pip install "fastapi[standard]"` でも可です。

### エンドポイント

| メソッド | パス    | 内容                    |
|----------|---------|-------------------------|
| GET      | /healthz| 死活監視                |
| POST     | /plan   | ライフプラン試算 (JSON) |

#### `/plan` リクエスト例

```json
{
  "profile": {
    "current_age": 35,
    "retirement_age": 60,
    "life_expectancy": 95,
    "household_size": 3,
    "dependents": 1,
    "marital_status": "married"
  },
  "cashflow": {
    "annual_income": 9000000,
    "income_growth_rate": 0.02,
    "annual_expenses": 5400000,
    "expense_growth_rate": 0.012,
    "current_savings": 12000000,
    "monthly_investment": 80000,
    "investment_return_rate": 0.04,
    "inflation_rate": 0.015,
    "retirement_income_rate": 0.6,
    "retirement_expense_rate": 0.85
  },
  "goals": [
    {
      "name": "大学進学",
      "goal_type": "education",
      "year": 2040,
      "amount": 6000000,
      "priority": "high"
    }
  ],
  "protection": {
    "emergency_fund_months": 6,
    "insurance_coverage": 30000000,
    "desired_insurance_multiple": 8,
    "risk_tolerance": "balanced"
  },
  "stress": {
    "income_drop_pct": 0.2,
    "market_drop_pct": 0.12,
    "duration_years": 3
  }
}
```

主要レスポンス項目:

- `summary`: 健全度スコア、FIRE 推定年齢、生活防衛資金/保険ギャップなど
- `timeline`: 毎年の資産残高、収入、支出、ゴール支出
- `goals`: 各ゴールの達成率
- `warnings` / `recommendations`: リスク通知と推奨アクション
- `stress_test`: 所得・市場ショック下でのアウトカム

### 自動テスト

```bash
cd backend
poetry run pytest
```

シンプルな API なので、開発中は `fastapi.testclient` を使ったスモークテストでも十分です。
