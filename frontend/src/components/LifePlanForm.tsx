import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LifePlan, Insurance, LifeEvent } from "../types/lifeplan";

interface LifePlanFormProps {
  onSubmit: (plan: LifePlan) => void;
}

export function LifePlanForm({ onSubmit }: LifePlanFormProps) {
  const [plan, setPlan] = useState<LifePlan>({
    profile: {
      name: "",
      birth_date: "",
      gender: "male",
      children: [],
    },
    income: {
      annual_salary: 0,
      bonus: 0,
      other_income: 0,
      retirement_age: 65,
    },
    expense: {
      living_expenses: 0,
      housing_expenses: 0,
      education_expenses: 0,
      insurance_premiums: 0,
      other_expenses: 0,
    },
    assets: {
      cash: 0,
      stocks: 0,
      bonds: 0,
      real_estate: 0,
      other_assets: 0,
    },
    liabilities: {
      mortgage: 0,
      other_loans: 0,
    },
    insurances: [],
    life_events: [],
  });

  const [newInsurance, setNewInsurance] = useState<Insurance>({
    type: "life",
    coverage_amount: 0,
    annual_premium: 0,
  });

  const [newLifeEvent, setNewLifeEvent] = useState<LifeEvent>({
    type: "marriage",
    year: new Date().getFullYear(),
    amount: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(plan);
  };

  const addInsurance = () => {
    setPlan({
      ...plan,
      insurances: [...plan.insurances, { ...newInsurance }],
    });
    setNewInsurance({
      type: "life",
      coverage_amount: 0,
      annual_premium: 0,
    });
  };

  const addLifeEvent = () => {
    setPlan({
      ...plan,
      life_events: [...plan.life_events, { ...newLifeEvent }],
    });
    setNewLifeEvent({
      type: "marriage",
      year: new Date().getFullYear(),
      amount: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="profile">基本情報</TabsTrigger>
          <TabsTrigger value="income">収入</TabsTrigger>
          <TabsTrigger value="expense">支出</TabsTrigger>
          <TabsTrigger value="assets">資産</TabsTrigger>
          <TabsTrigger value="insurance">保険</TabsTrigger>
          <TabsTrigger value="events">ライフイベント</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
              <CardDescription>あなたの基本情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  value={plan.profile.name}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      profile: { ...plan.profile, name: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">生年月日</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={plan.profile.birth_date}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      profile: { ...plan.profile, birth_date: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">性別</Label>
                <select
                  id="gender"
                  className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1"
                  value={plan.profile.gender}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      profile: { ...plan.profile, gender: e.target.value as "male" | "female" },
                    })
                  }
                >
                  <option value="male">男性</option>
                  <option value="female">女性</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouse_name">配偶者名（任意）</Label>
                <Input
                  id="spouse_name"
                  value={plan.profile.spouse_name || ""}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      profile: { ...plan.profile, spouse_name: e.target.value || undefined },
                    })
                  }
                />
              </div>
              {plan.profile.spouse_name && (
                <div className="space-y-2">
                  <Label htmlFor="spouse_birth_date">配偶者生年月日</Label>
                  <Input
                    id="spouse_birth_date"
                    type="date"
                    value={plan.profile.spouse_birth_date || ""}
                    onChange={(e) =>
                      setPlan({
                        ...plan,
                        profile: { ...plan.profile, spouse_birth_date: e.target.value || undefined },
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income">
          <Card>
            <CardHeader>
              <CardTitle>収入情報</CardTitle>
              <CardDescription>年間の収入を入力してください（万円）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annual_salary">年収</Label>
                <Input
                  id="annual_salary"
                  type="number"
                  value={plan.income.annual_salary}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      income: { ...plan.income, annual_salary: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bonus">ボーナス</Label>
                <Input
                  id="bonus"
                  type="number"
                  value={plan.income.bonus}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      income: { ...plan.income, bonus: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_income">その他収入</Label>
                <Input
                  id="other_income"
                  type="number"
                  value={plan.income.other_income}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      income: { ...plan.income, other_income: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retirement_age">退職予定年齢</Label>
                <Input
                  id="retirement_age"
                  type="number"
                  value={plan.income.retirement_age}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      income: { ...plan.income, retirement_age: parseInt(e.target.value) || 65 },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense">
          <Card>
            <CardHeader>
              <CardTitle>支出情報</CardTitle>
              <CardDescription>年間の支出を入力してください（万円）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="living_expenses">生活費</Label>
                <Input
                  id="living_expenses"
                  type="number"
                  value={plan.expense.living_expenses}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      expense: { ...plan.expense, living_expenses: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="housing_expenses">住宅費</Label>
                <Input
                  id="housing_expenses"
                  type="number"
                  value={plan.expense.housing_expenses}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      expense: { ...plan.expense, housing_expenses: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="education_expenses">教育費</Label>
                <Input
                  id="education_expenses"
                  type="number"
                  value={plan.expense.education_expenses}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      expense: { ...plan.expense, education_expenses: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance_premiums">保険料</Label>
                <Input
                  id="insurance_premiums"
                  type="number"
                  value={plan.expense.insurance_premiums}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      expense: { ...plan.expense, insurance_premiums: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="other_expenses">その他支出</Label>
                <Input
                  id="other_expenses"
                  type="number"
                  value={plan.expense.other_expenses}
                  onChange={(e) =>
                    setPlan({
                      ...plan,
                      expense: { ...plan.expense, other_expenses: parseInt(e.target.value) || 0 },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>資産・負債</CardTitle>
              <CardDescription>現在の資産と負債を入力してください（万円）</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">資産</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cash">現金・預金</Label>
                    <Input
                      id="cash"
                      type="number"
                      value={plan.assets.cash}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          assets: { ...plan.assets, cash: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stocks">株式</Label>
                    <Input
                      id="stocks"
                      type="number"
                      value={plan.assets.stocks}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          assets: { ...plan.assets, stocks: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonds">債券</Label>
                    <Input
                      id="bonds"
                      type="number"
                      value={plan.assets.bonds}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          assets: { ...plan.assets, bonds: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="real_estate">不動産</Label>
                    <Input
                      id="real_estate"
                      type="number"
                      value={plan.assets.real_estate}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          assets: { ...plan.assets, real_estate: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_assets">その他資産</Label>
                    <Input
                      id="other_assets"
                      type="number"
                      value={plan.assets.other_assets}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          assets: { ...plan.assets, other_assets: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">負債</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mortgage">住宅ローン残高</Label>
                    <Input
                      id="mortgage"
                      type="number"
                      value={plan.liabilities.mortgage}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          liabilities: { ...plan.liabilities, mortgage: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other_loans">その他ローン</Label>
                    <Input
                      id="other_loans"
                      type="number"
                      value={plan.liabilities.other_loans}
                      onChange={(e) =>
                        setPlan({
                          ...plan,
                          liabilities: { ...plan.liabilities, other_loans: parseInt(e.target.value) || 0 },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance">
          <Card>
            <CardHeader>
              <CardTitle>保険情報</CardTitle>
              <CardDescription>加入している保険を追加してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 border p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="insurance_type">保険種類</Label>
                  <select
                    id="insurance_type"
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1"
                    value={newInsurance.type}
                    onChange={(e) =>
                      setNewInsurance({
                        ...newInsurance,
                        type: e.target.value as Insurance["type"],
                      })
                    }
                  >
                    <option value="life">生命保険</option>
                    <option value="medical">医療保険</option>
                    <option value="disability">障害保険</option>
                    <option value="nursing">介護保険</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverage_amount">保険金額（万円）</Label>
                  <Input
                    id="coverage_amount"
                    type="number"
                    value={newInsurance.coverage_amount}
                    onChange={(e) =>
                      setNewInsurance({
                        ...newInsurance,
                        coverage_amount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual_premium">年間保険料（万円）</Label>
                  <Input
                    id="annual_premium"
                    type="number"
                    value={newInsurance.annual_premium}
                    onChange={(e) =>
                      setNewInsurance({
                        ...newInsurance,
                        annual_premium: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button type="button" onClick={addInsurance}>
                  保険を追加
                </Button>
              </div>
              {plan.insurances.length > 0 && (
                <div className="space-y-2">
                  <Label>追加済み保険</Label>
                  <div className="space-y-2">
                    {plan.insurances.map((insurance, index) => (
                      <div key={index} className="p-2 bg-zinc-100 rounded text-sm">
                        {insurance.type === "life" && "生命保険"}
                        {insurance.type === "medical" && "医療保険"}
                        {insurance.type === "disability" && "障害保険"}
                        {insurance.type === "nursing" && "介護保険"}
                        : {insurance.coverage_amount}万円 / 年間{insurance.annual_premium}万円
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>ライフイベント</CardTitle>
              <CardDescription>将来のライフイベントを追加してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 border p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="event_type">イベント種類</Label>
                  <select
                    id="event_type"
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1"
                    value={newLifeEvent.type}
                    onChange={(e) =>
                      setNewLifeEvent({
                        ...newLifeEvent,
                        type: e.target.value as LifeEvent["type"],
                      })
                    }
                  >
                    <option value="marriage">結婚</option>
                    <option value="birth">出産</option>
                    <option value="education">教育費</option>
                    <option value="house_purchase">住宅購入</option>
                    <option value="retirement">退職</option>
                    <option value="death">死亡</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_year">発生年</Label>
                  <Input
                    id="event_year"
                    type="number"
                    value={newLifeEvent.year}
                    onChange={(e) =>
                      setNewLifeEvent({
                        ...newLifeEvent,
                        year: parseInt(e.target.value) || new Date().getFullYear(),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_amount">必要金額（万円）</Label>
                  <Input
                    id="event_amount"
                    type="number"
                    value={newLifeEvent.amount || 0}
                    onChange={(e) =>
                      setNewLifeEvent({
                        ...newLifeEvent,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <Button type="button" onClick={addLifeEvent}>
                  イベントを追加
                </Button>
              </div>
              {plan.life_events.length > 0 && (
                <div className="space-y-2">
                  <Label>追加済みイベント</Label>
                  <div className="space-y-2">
                    {plan.life_events.map((event, index) => (
                      <div key={index} className="p-2 bg-zinc-100 rounded text-sm">
                        {event.year}年:{" "}
                        {event.type === "marriage" && "結婚"}
                        {event.type === "birth" && "出産"}
                        {event.type === "education" && "教育費"}
                        {event.type === "house_purchase" && "住宅購入"}
                        {event.type === "retirement" && "退職"}
                        {event.type === "death" && "死亡"}
                        {event.amount && ` - ${event.amount}万円`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" size="lg">
          シミュレーション実行
        </Button>
      </div>
    </form>
  );
}
