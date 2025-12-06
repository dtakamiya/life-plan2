import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import type { Income, Expense, UserProfile } from "../types";
import { api } from "../lib/api";

interface IncomeExpensePageProps {
  profile: UserProfile | null;
  onDataChange: () => void;
}

export function IncomeExpensePage({ profile, onDataChange }: IncomeExpensePageProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newIncome, setNewIncome] = useState<Partial<Income>>({
    category: "salary",
    amount: 0,
    frequency: "monthly",
    start_date: new Date().toISOString().split("T")[0],
  });
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: "housing",
    amount: 0,
    frequency: "monthly",
    start_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;
    try {
      const [incomeData, expenseData] = await Promise.all([
        api.getIncomes(profile.id),
        api.getExpenses(profile.id),
      ]);
      setIncomes(incomeData);
      setExpenses(expenseData);
    } catch (error) {
      console.error("データの読み込みに失敗しました:", error);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      alert("まずプロフィールを登録してください");
      return;
    }
    try {
      await api.createIncome({ ...newIncome, user_id: profile.id } as Income);
      setNewIncome({
        category: "salary",
        amount: 0,
        frequency: "monthly",
        start_date: new Date().toISOString().split("T")[0],
      });
      loadData();
      onDataChange();
    } catch (error) {
      alert("エラーが発生しました: " + (error as Error).message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      alert("まずプロフィールを登録してください");
      return;
    }
    try {
      await api.createExpense({ ...newExpense, user_id: profile.id } as Expense);
      setNewExpense({
        category: "housing",
        amount: 0,
        frequency: "monthly",
        start_date: new Date().toISOString().split("T")[0],
      });
      loadData();
      onDataChange();
    } catch (error) {
      alert("エラーが発生しました: " + (error as Error).message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="income">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="income">収入</TabsTrigger>
          <TabsTrigger value="expense">支出</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>収入の登録</CardTitle>
              <CardDescription>収入情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddIncome} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>カテゴリ</Label>
                    <Select
                      value={newIncome.category}
                      onValueChange={(value) => setNewIncome({ ...newIncome, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salary">給与</SelectItem>
                        <SelectItem value="bonus">賞与</SelectItem>
                        <SelectItem value="business">事業収入</SelectItem>
                        <SelectItem value="investment">投資収入</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>金額</Label>
                    <Input
                      type="number"
                      value={newIncome.amount || ""}
                      onChange={(e) => setNewIncome({ ...newIncome, amount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>頻度</Label>
                    <Select
                      value={newIncome.frequency}
                      onValueChange={(value) => setNewIncome({ ...newIncome, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">月額</SelectItem>
                        <SelectItem value="yearly">年額</SelectItem>
                        <SelectItem value="one_time">一時的</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>開始日</Label>
                    <Input
                      type="date"
                      value={newIncome.start_date}
                      onChange={(e) => setNewIncome({ ...newIncome, start_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit">追加</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>収入一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>頻度</TableHead>
                    <TableHead>開始日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{income.category}</TableCell>
                      <TableCell>{formatCurrency(income.amount)}</TableCell>
                      <TableCell>{income.frequency === "monthly" ? "月額" : income.frequency === "yearly" ? "年額" : "一時的"}</TableCell>
                      <TableCell>{income.start_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>支出の登録</CardTitle>
              <CardDescription>支出情報を入力してください</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>カテゴリ</Label>
                    <Select
                      value={newExpense.category}
                      onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="housing">住宅費</SelectItem>
                        <SelectItem value="food">食費</SelectItem>
                        <SelectItem value="transport">交通費</SelectItem>
                        <SelectItem value="education">教育費</SelectItem>
                        <SelectItem value="insurance">保険料</SelectItem>
                        <SelectItem value="tax">税金</SelectItem>
                        <SelectItem value="other">その他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>金額</Label>
                    <Input
                      type="number"
                      value={newExpense.amount || ""}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>頻度</Label>
                    <Select
                      value={newExpense.frequency}
                      onValueChange={(value) => setNewExpense({ ...newExpense, frequency: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">月額</SelectItem>
                        <SelectItem value="yearly">年額</SelectItem>
                        <SelectItem value="one_time">一時的</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>開始日</Label>
                    <Input
                      type="date"
                      value={newExpense.start_date}
                      onChange={(e) => setNewExpense({ ...newExpense, start_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <Button type="submit">追加</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>支出一覧</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>頻度</TableHead>
                    <TableHead>開始日</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>{formatCurrency(expense.amount)}</TableCell>
                      <TableCell>{expense.frequency === "monthly" ? "月額" : expense.frequency === "yearly" ? "年額" : "一時的"}</TableCell>
                      <TableCell>{expense.start_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
