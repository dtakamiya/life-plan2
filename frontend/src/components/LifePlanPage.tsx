import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { UserProfile, Income, Expense, Asset, LifePlanResponse } from "../types";
import { api } from "../lib/api";

interface LifePlanPageProps {
  profile: UserProfile | null;
  incomes: Income[];
  expenses: Expense[];
  assets: Asset[];
  onDataChange?: () => void;
}

export function LifePlanPage({ profile, incomes, expenses, assets, onDataChange }: LifePlanPageProps) {
  const [lifePlan, setLifePlan] = useState<LifePlanResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectionYears, setProjectionYears] = useState(30);

  const calculateLifePlan = async () => {
    if (!profile) {
      alert("まずプロフィールを登録してください");
      return;
    }

    setLoading(true);
    try {
      const result = await api.calculateLifePlan({
        user_profile: profile,
        incomes: incomes,
        expenses: expenses,
        assets: assets,
        liabilities: [],
        insurances: [],
        education_plans: [],
        housing_loans: [],
        retirement_plans: [],
        projection_years: projectionYears,
      });
      setLifePlan(result);
    } catch (error) {
      alert("エラーが発生しました: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = lifePlan.map((item) => ({
    year: item.year,
    age: item.age,
    純資産: item.net_worth,
    総資産: item.total_assets,
    総負債: item.total_liabilities,
    収入: item.total_income,
    支出: item.total_expense,
    キャッシュフロー: item.net_cashflow,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ライフプラン計算</CardTitle>
          <CardDescription>将来の資産形成をシミュレーションします</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>予測年数</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={projectionYears}
                onChange={(e) => setProjectionYears(parseInt(e.target.value) || 30)}
                className="w-32"
              />
            </div>
            <Button onClick={calculateLifePlan} disabled={loading} className="mt-6">
              {loading ? "計算中..." : "ライフプランを計算"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {lifePlan.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>資産推移グラフ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="純資産" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="総資産" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="総負債" stroke="#ffc658" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>キャッシュフロー推移グラフ</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="収入" stroke="#82ca9d" strokeWidth={2} />
                  <Line type="monotone" dataKey="支出" stroke="#ff7300" strokeWidth={2} />
                  <Line type="monotone" dataKey="キャッシュフロー" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ライフプラン表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>年</TableHead>
                      <TableHead>年齢</TableHead>
                      <TableHead>収入</TableHead>
                      <TableHead>支出</TableHead>
                      <TableHead>キャッシュフロー</TableHead>
                      <TableHead>総資産</TableHead>
                      <TableHead>総負債</TableHead>
                      <TableHead>純資産</TableHead>
                      <TableHead>イベント</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lifePlan.map((item) => (
                      <TableRow key={item.year}>
                        <TableCell>{item.year}</TableCell>
                        <TableCell>{item.age}歳</TableCell>
                        <TableCell>{formatCurrency(item.total_income)}</TableCell>
                        <TableCell>{formatCurrency(item.total_expense)}</TableCell>
                        <TableCell className={item.net_cashflow >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(item.net_cashflow)}
                        </TableCell>
                        <TableCell>{formatCurrency(item.total_assets)}</TableCell>
                        <TableCell>{formatCurrency(item.total_liabilities)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(item.net_worth)}</TableCell>
                        <TableCell className="text-sm">{item.events.join(", ")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
