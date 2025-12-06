import { useMemo, useState } from "react"
import type { ChangeEvent } from "react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import {
  useFieldArray,
  useForm,
  type UseFormReturn,
  type FieldPath,
} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Activity,
  AlertTriangle,
  Plus,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  Target,
} from "lucide-react"
import "./App.css"

const currentYear = new Date().getFullYear()

const goalSchema = z.object({
  name: z.string().min(1, "ゴール名を入力してください"),
  goal_type: z.enum(["education", "housing", "retirement", "travel", "care", "custom"]),
  year: z.coerce.number().int().min(currentYear, "今年以降の年を入力してください"),
  amount: z.coerce.number().min(100000, "10万円以上で入力してください"),
  priority: z.enum(["high", "medium", "low"]),
})

const formSchema = z.object({
  profile: z.object({
    current_age: z.coerce.number().int().min(18).max(80),
    retirement_age: z.coerce.number().int().min(40).max(80),
    life_expectancy: z.coerce.number().int().min(70).max(110),
    household_size: z.coerce.number().int().min(1).max(8),
    dependents: z.coerce.number().int().min(0).max(6),
    marital_status: z.enum(["single", "married", "other"]),
    prefecture: z.string().optional(),
  }),
  cashflow: z.object({
    annual_income: z.coerce.number().min(1_000_000),
    income_growth_rate: z.coerce.number().min(0).max(0.15),
    annual_expenses: z.coerce.number().min(1_000_000),
    expense_growth_rate: z.coerce.number().min(0).max(0.12),
    current_savings: z.coerce.number().min(0),
    monthly_investment: z.coerce.number().min(0),
    investment_return_rate: z.coerce.number().min(-0.2).max(0.25),
    inflation_rate: z.coerce.number().min(0).max(0.08),
    retirement_income_rate: z.coerce.number().min(0.3).max(1.2),
    retirement_expense_rate: z.coerce.number().min(0.5).max(1.5),
  }),
  protection: z.object({
    emergency_fund_months: z.coerce.number().min(1).max(36),
    insurance_coverage: z.coerce.number().min(0),
    desired_insurance_multiple: z.coerce.number().min(3).max(20),
    risk_tolerance: z.enum(["conservative", "balanced", "growth"]),
  }),
  stress: z.object({
    income_drop_pct: z.coerce.number().min(0).max(0.5),
    market_drop_pct: z.coerce.number().min(0).max(0.5),
    duration_years: z.coerce.number().int().min(1).max(10),
  }),
  goals: z.array(goalSchema).max(6),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

type ProjectionPoint = {
  year: number
  age: number
  income: number
  expenses: number
  surplus_before_invest: number
  invested_amount: number
  goal_cost: number
  investment_growth: number
  net_cash_flow: number
  assets: number
}

type PlanResponse = {
  summary: {
    sustainability_score: number
    shortfall_year: number | null
    financial_independence_age: number | null
    terminal_assets: number
    emergency_fund_gap: number
    insurance_gap: number
    savings_rate: number
  }
  timeline: ProjectionPoint[]
  goals: Array<{
    name: string
    year: number
    goal_type: string
    inflated_amount: number
    funded_ratio: number
    funded: boolean
    priority: string
  }>
  warnings: string[]
  recommendations: string[]
  stress_test: {
    duration_years: number
    income_drop_pct: number
    market_drop_pct: number
    shortfall_year: number | null
    terminal_assets: number
  }
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"

const currency = (value: number) =>
  new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value)

const percent = (value: number) =>
  `${(value * 100).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}%`

function App() {
  const [plan, setPlan] = useState<PlanResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profile: {
        current_age: 35,
        retirement_age: 60,
        life_expectancy: 95,
        household_size: 3,
        dependents: 1,
        marital_status: "married",
        prefecture: "東京都",
      },
      cashflow: {
        annual_income: 9_000_000,
        income_growth_rate: 0.02,
        annual_expenses: 5_400_000,
        expense_growth_rate: 0.012,
        current_savings: 12_000_000,
        monthly_investment: 80_000,
        investment_return_rate: 0.04,
        inflation_rate: 0.015,
        retirement_income_rate: 0.6,
        retirement_expense_rate: 0.85,
      },
      protection: {
        emergency_fund_months: 6,
        insurance_coverage: 30_000_000,
        desired_insurance_multiple: 8,
        risk_tolerance: "balanced",
      },
      stress: {
        income_drop_pct: 0.2,
        market_drop_pct: 0.12,
        duration_years: 3,
      },
      goals: [
        {
          name: "大学進学",
          goal_type: "education",
          year: currentYear + 15,
          amount: 6_000_000,
          priority: "high",
        },
        {
          name: "住宅リフォーム",
          goal_type: "housing",
          year: currentYear + 8,
          amount: 4_000_000,
          priority: "medium",
        },
      ],
      notes: "",
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "goals",
  })

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_BASE}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile: values.profile,
          cashflow: values.cashflow,
          protection: values.protection,
          stress: values.stress,
          goals: values.goals,
        }),
      })

      if (!response.ok) {
        throw new Error("プランの計算に失敗しました。バックエンドを確認してください。")
      }

      const data: PlanResponse = await response.json()
      setPlan(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました。")
    } finally {
      setIsLoading(false)
    }
  }

  const timelineData = useMemo(() => {
    if (!plan) return []
    return plan.timeline.map((point) => ({
      ...point,
      assets: Math.round(point.assets / 1_000_000),
      income: Math.round(point.income / 1_000_000),
      expenses: Math.round(point.expenses / 1_000_000),
    }))
  }, [plan])

  const summaryCards = plan
    ? [
        {
          label: "健全度スコア",
          value: `${plan.summary.sustainability_score}`,
          unit: "/100",
          icon: Activity,
          accent: "text-emerald-600",
          description: plan.summary.shortfall_year
            ? `${plan.summary.shortfall_year}年に不足リスク`
            : "全期間で資産がプラス圏",
        },
        {
          label: "FIRE推定年齢",
          value: plan.summary.financial_independence_age
            ? `${plan.summary.financial_independence_age}`
            : "--",
          unit: "歳",
          icon: Sparkles,
          accent: "text-indigo-600",
          description: "資産≧生活費25年分のタイミング",
        },
        {
          label: "最終的な金融資産",
          value: currency(plan.summary.terminal_assets),
          icon: TrendingUp,
          accent: "text-sky-600",
          description: `貯蓄率 ${percent(plan.summary.savings_rate)}`,
        },
        {
          label: "生活防衛資金ギャップ",
          value: currency(plan.summary.emergency_fund_gap),
          icon: ShieldCheck,
          accent: "text-amber-600",
          description:
            plan.summary.emergency_fund_gap > 0
              ? "現預金を積み増しましょう"
              : "推奨ラインを満たしています",
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <header className="space-y-4">
          <Badge variant="secondary" className="inline-flex items-center gap-1">
            <Target className="h-3.5 w-3.5" />
            FP1級レベルの試算
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">
              ライフプラン設計スタジオ
            </h1>
            <p className="max-w-3xl text-base text-slate-600">
              年齢・キャッシュフロー・教育や住宅のゴールを入力すると、長期的な資産推移と
              リスクシミュレーションをFP1級レベルで自動算出します。
            </p>
          </div>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[360px,1fr]">
          <Card className="self-start">
            <CardHeader>
              <CardTitle>入力パネル</CardTitle>
              <CardDescription>家計条件を更新して「試算する」を押下</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-500">
                      世帯プロフィール
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField form={form} name="profile.current_age" label="現在年齢" />
                      <NumberField form={form} name="profile.retirement_age" label="リタイア年齢" />
                      <NumberField form={form} name="profile.life_expectancy" label="想定寿命" />
                      <NumberField form={form} name="profile.household_size" label="世帯人数" />
                      <NumberField form={form} name="profile.dependents" label="扶養人数" />
                      <FormField
                        control={form.control}
                        name="profile.marital_status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>婚姻状況</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="single">独身</SelectItem>
                                <SelectItem value="married">既婚</SelectItem>
                                <SelectItem value="other">その他</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="profile.prefecture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>居住エリア（任意）</FormLabel>
                          <FormControl>
                            <Input placeholder="例: 東京都" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-500">
                      キャッシュフロー
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        form={form}
                        name="cashflow.annual_income"
                        label="年間手取り収入"
                        prefix="¥"
                        step="100000"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.annual_expenses"
                        label="年間生活費"
                        prefix="¥"
                        step="100000"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.current_savings"
                        label="現預金・投資残高"
                        prefix="¥"
                        step="100000"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.monthly_investment"
                        label="毎月の積立額"
                        prefix="¥"
                        step="10000"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.income_growth_rate"
                        label="年収成長率"
                        suffix="%"
                        step="0.005"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.expense_growth_rate"
                        label="支出増加率"
                        suffix="%"
                        step="0.005"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.investment_return_rate"
                        label="想定運用利回り"
                        suffix="%"
                        step="0.005"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.inflation_rate"
                        label="インフレ率"
                        suffix="%"
                        step="0.005"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.retirement_income_rate"
                        label="リタイア後収入比率"
                        suffix="%"
                        step="0.05"
                      />
                      <NumberField
                        form={form}
                        name="cashflow.retirement_expense_rate"
                        label="リタイア後生活費係数"
                        suffix="%"
                        step="0.05"
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-500">リスク管理</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <NumberField
                        form={form}
                        name="protection.emergency_fund_months"
                        label="生活防衛資金（月数）"
                        step="1"
                      />
                      <NumberField
                        form={form}
                        name="protection.insurance_coverage"
                        label="現在の保険金額"
                        prefix="¥"
                        step="1000000"
                      />
                      <NumberField
                        form={form}
                        name="protection.desired_insurance_multiple"
                        label="必要保障額（年収倍率）"
                        step="1"
                      />
                      <FormField
                        control={form.control}
                        name="protection.risk_tolerance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>リスク許容度</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="選択" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="conservative">守り重視</SelectItem>
                                <SelectItem value="balanced">バランス</SelectItem>
                                <SelectItem value="growth">積極運用</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-slate-500">ゴール設定</h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            name: "新しいゴール",
                            goal_type: "custom",
                            year: currentYear + 5,
                            amount: 1_000_000,
                            priority: "medium",
                          })
                        }
                        disabled={fields.length >= 6}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        追加
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {fields.length === 0 && (
                        <p className="text-sm text-slate-500">
                          「追加」ボタンから教育・住宅などのゴールを登録してください。
                        </p>
                      )}
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <FormField
                                control={form.control}
                                name={`goals.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs text-slate-500">
                                      ゴール名
                                    </FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`goals.${index}.goal_type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-slate-500">
                                        区分
                                      </FormLabel>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="education">教育</SelectItem>
                                          <SelectItem value="housing">住宅</SelectItem>
                                          <SelectItem value="retirement">老後</SelectItem>
                                          <SelectItem value="travel">旅行</SelectItem>
                                          <SelectItem value="care">介護</SelectItem>
                                          <SelectItem value="custom">その他</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`goals.${index}.priority`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-slate-500">
                                        優先度
                                      </FormLabel>
                                      <Select value={field.value} onValueChange={field.onChange}>
                                        <FormControl>
                                          <SelectTrigger className="h-8">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="high">高</SelectItem>
                                          <SelectItem value="medium">中</SelectItem>
                                          <SelectItem value="low">低</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <FormField
                                  control={form.control}
                                  name={`goals.${index}.year`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-slate-500">
                                        実施年
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          name={field.name}
                                        value={field.value ?? ""}
                                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            field.onChange(
                                              event.target.value === ""
                                                ? undefined
                                                : Number(event.target.value)
                                            )
                                          }
                                          onBlur={field.onBlur}
                                          ref={field.ref}
                                          className="h-8"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`goals.${index}.amount`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs text-slate-500">
                                        金額
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          className="h-8"
                                          name={field.name}
                                          value={field.value ?? ""}
                                          onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                            field.onChange(
                                              event.target.value === ""
                                                ? undefined
                                                : Number(event.target.value)
                                            )
                                          }
                                          onBlur={field.onBlur}
                                          ref={field.ref}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-slate-500">メモ（任意）</h2>
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea rows={3} placeholder="ヒアリングメモや前提条件" {...field} />
                          </FormControl>
                          <FormDescription>計算結果には送信されません。</FormDescription>
                        </FormItem>
                      )}
                    />
                  </section>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "試算中..." : "試算する"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertTitle>エラー</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!plan && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle>まだ試算がありません</CardTitle>
                  <CardDescription>
                    左側の入力を更新し、「試算する」を押してライフプランを生成してください。
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-500">
                  <p>・年間キャッシュフローと資産推移を30年以上先まで可視化</p>
                  <p>・教育/住宅/介護などの大型支出をインフレ込みで反映</p>
                  <p>・生活防衛資金、保険、ストレステストのアドバイスを提示</p>
                </CardContent>
              </Card>
            )}

            {plan && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {summaryCards.map((card) => (
                    <Card key={card.label} className="overflow-hidden">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                          {card.label}
                        </CardTitle>
                        <card.icon className={`h-5 w-5 ${card.accent}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-semibold text-slate-900">
                          {card.value}
                          {card.unit && (
                            <span className="text-base font-medium text-slate-500">
                              {card.unit}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{card.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>プラン詳細</CardTitle>
                        <CardDescription>キャッシュフロー・警告・ストレステスト</CardDescription>
                      </div>
                      <Badge
                        variant={plan.warnings.length ? "destructive" : "secondary"}
                        className="capitalize"
                      >
                        {plan.warnings.length ? "要改善" : "良好"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="chart" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="chart">推移グラフ</TabsTrigger>
                        <TabsTrigger value="timeline">キャッシュフロー表</TabsTrigger>
                        <TabsTrigger value="goals">ゴール別状況</TabsTrigger>
                      </TabsList>
                      <TabsContent value="chart">
                        <div className="h-72 w-full">
                          <ResponsiveContainer>
                            <LineChart data={timelineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis
                                yAxisId="left"
                                label={{ value: "百万円", angle: -90, position: "insideLeft" }}
                              />
                              <Tooltip
                                formatter={(value: number) => `${value.toLocaleString()} 百万円`}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="assets"
                                name="資産"
                                stroke="#2563eb"
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="income"
                                name="収入"
                                stroke="#16a34a"
                                yAxisId="left"
                                strokeDasharray="5 3"
                              />
                              <Line
                                type="monotone"
                                dataKey="expenses"
                                name="支出"
                                stroke="#f97316"
                                yAxisId="left"
                                strokeDasharray="4 4"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </TabsContent>
                      <TabsContent value="timeline">
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-left text-sm">
                            <thead>
                              <tr className="text-slate-500">
                                <th className="px-2 py-1">年</th>
                                <th className="px-2 py-1">年齢</th>
                                <th className="px-2 py-1">資産残高</th>
                                <th className="px-2 py-1">収入</th>
                                <th className="px-2 py-1">支出</th>
                                <th className="px-2 py-1">目標支出</th>
                              </tr>
                            </thead>
                            <tbody>
                              {plan.timeline.slice(0, 12).map((row) => (
                                <tr key={row.year} className="border-t border-slate-100">
                                  <td className="px-2 py-1">{row.year}</td>
                                  <td className="px-2 py-1">{row.age}歳</td>
                                  <td className="px-2 py-1 font-medium">
                                    {currency(row.assets)}
                                  </td>
                                  <td className="px-2 py-1 text-slate-600">
                                    {currency(row.income)}
                                  </td>
                                  <td className="px-2 py-1 text-slate-600">
                                    {currency(row.expenses)}
                                  </td>
                                  <td className="px-2 py-1 text-slate-600">
                                    {row.goal_cost > 0 ? currency(row.goal_cost) : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                      <TabsContent value="goals">
                        <div className="space-y-3">
                          {plan.goals.length === 0 && (
                            <p className="text-sm text-slate-500">登録ゴールはありません。</p>
                          )}
                          {plan.goals.map((goal) => (
                            <div
                              key={`${goal.name}-${goal.year}`}
                              className="flex flex-wrap items-center justify-between rounded-lg border border-slate-100 bg-slate-50/80 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {goal.name}（{goal.year}年）
                                </p>
                                <p className="text-xs text-slate-500">
                                  必要資金 {currency(goal.inflated_amount)}・優先度 {goal.priority}
                                </p>
                              </div>
                              <Badge
                                variant={goal.funded ? "secondary" : "destructive"}
                                className="text-xs"
                              >
                                {goal.funded
                                  ? "達成見込み"
                                  : `達成率 ${Math.round(goal.funded_ratio * 100)}%`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          リスク警告
                        </h3>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {plan.warnings.length === 0 && (
                            <li>重大なリスクは検出されませんでした。</li>
                          )}
                          {plan.warnings.map((warning) => (
                            <li key={warning}>・{warning}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                          <ShieldCheck className="h-4 w-4 text-emerald-500" />
                          推奨アクション
                        </h3>
                        <ul className="space-y-1 text-sm text-slate-600">
                          {plan.recommendations.map((tip) => (
                            <li key={tip}>・{tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-4 text-sm text-indigo-900">
                      <p className="font-semibold">ストレステスト</p>
                      <p className="mt-1">
                        {plan.stress_test.duration_years}年間、収入
                        {percent(plan.stress_test.income_drop_pct)}減＋運用利回り
                        {percent(plan.stress_test.market_drop_pct)}悪化を仮定。
                      </p>
                      <p className="mt-1">
                        最終資産 {currency(plan.stress_test.terminal_assets)} /{" "}
                        {plan.stress_test.shortfall_year
                          ? `${plan.stress_test.shortfall_year}年にマイナス圏へ。`
                          : "資産はプラス圏を維持。"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type NumberFieldProps<TName extends FieldPath<FormValues>> = {
  form: UseFormReturn<FormValues>
  name: TName
  label: string
  prefix?: string
  suffix?: string
  step?: number | string
}

const NumberField = <TName extends FieldPath<FormValues>>({
  form,
  name,
  label,
  prefix,
  suffix,
  step,
}: NumberFieldProps<TName>) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => {
      const normalizedValue =
        typeof field.value === "number" || typeof field.value === "string" ? field.value : ""

      return (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center rounded-md border border-slate-200 bg-white px-3">
              {prefix && <span className="mr-1 text-xs text-slate-400">{prefix}</span>}
              <Input
                type="number"
                name={field.name}
                value={normalizedValue}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  field.onChange(
                    event.target.value === "" ? undefined : Number(event.target.value)
                  )
                }
                onBlur={field.onBlur}
                ref={field.ref}
                step={step}
                className="border-none px-0 focus-visible:ring-0"
              />
              {suffix && <span className="ml-1 text-xs text-slate-400">{suffix}</span>}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )
    }}
  />
)

export default App
