import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Receipt, Home, Zap, Utensils, Car, Phone, Shield, GraduationCap, PartyPopper, Shirt, Heart, MoreHorizontal } from 'lucide-react';
import { useLifePlan } from '@/contexts/LifePlanContext';
import { formatCurrency } from '@/lib/utils';
import type { MonthlyExpense } from '@/types';

const defaultExpenses: MonthlyExpense = {
  housing: 80000,
  utilities: 15000,
  food: 60000,
  transportation: 15000,
  communication: 10000,
  insurance: 20000,
  education: 0,
  entertainment: 30000,
  clothing: 10000,
  medical: 5000,
  other: 20000,
};

const expenseFields: { key: keyof MonthlyExpense; label: string; icon: typeof Home; color: string }[] = [
  { key: 'housing', label: '住居費', icon: Home, color: 'bg-blue-500' },
  { key: 'utilities', label: '水道光熱費', icon: Zap, color: 'bg-yellow-500' },
  { key: 'food', label: '食費', icon: Utensils, color: 'bg-green-500' },
  { key: 'transportation', label: '交通費', icon: Car, color: 'bg-purple-500' },
  { key: 'communication', label: '通信費', icon: Phone, color: 'bg-pink-500' },
  { key: 'insurance', label: '保険料', icon: Shield, color: 'bg-cyan-500' },
  { key: 'education', label: '教育費', icon: GraduationCap, color: 'bg-orange-500' },
  { key: 'entertainment', label: '娯楽費', icon: PartyPopper, color: 'bg-indigo-500' },
  { key: 'clothing', label: '被服費', icon: Shirt, color: 'bg-rose-500' },
  { key: 'medical', label: '医療費', icon: Heart, color: 'bg-red-500' },
  { key: 'other', label: 'その他', icon: MoreHorizontal, color: 'bg-gray-500' },
];

export function ExpensesForm() {
  const { monthlyExpenses, setMonthlyExpenses, profile } = useLifePlan();
  const [localExpenses, setLocalExpenses] = useState<MonthlyExpense>(monthlyExpenses || defaultExpenses);

  useEffect(() => {
    if (monthlyExpenses) setLocalExpenses(monthlyExpenses);
  }, [monthlyExpenses]);

  const handleChange = (field: keyof MonthlyExpense, value: number) => {
    setLocalExpenses({ ...localExpenses, [field]: value });
  };

  const totalMonthly = Object.values(localExpenses).reduce((sum, val) => sum + val, 0);
  const totalAnnual = totalMonthly * 12;
  
  // 収入に対する支出比率
  const monthlyIncome = profile ? profile.annual_income / 12 : 0;
  const expenseRatio = monthlyIncome > 0 ? (totalMonthly / monthlyIncome) * 100 : 0;

  const handleSave = () => {
    setMonthlyExpenses(localExpenses);
  };

  return (
    <div id="expenses" className="space-y-6">
      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">月間支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalMonthly)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">年間支出</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAnnual)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">収入に対する支出比率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{expenseRatio.toFixed(1)}%</div>
              <Progress 
                value={Math.min(expenseRatio, 100)} 
                className={expenseRatio > 80 ? 'bg-red-100' : expenseRatio > 60 ? 'bg-yellow-100' : 'bg-green-100'}
              />
              <p className="text-xs text-muted-foreground">
                {expenseRatio > 80 ? '⚠️ 支出が収入の80%を超えています' : 
                 expenseRatio > 60 ? '📊 適正範囲内です' : 
                 '✅ 余裕のある家計です'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支出内訳 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            月間支出の内訳
          </CardTitle>
          <CardDescription>
            毎月の支出項目を入力してください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenseFields.map(({ key, label, icon: Icon, color }) => {
              const value = localExpenses[key];
              const percentage = totalMonthly > 0 ? (value / totalMonthly) * 100 : 0;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={key} className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${color}`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                      {label}
                    </Label>
                    <span className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="relative">
                    <Input
                      id={key}
                      type="number"
                      min={0}
                      step={1000}
                      value={localExpenses[key]}
                      onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                      className="pr-8"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      円
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 支出の割合グラフ */}
      <Card>
        <CardHeader>
          <CardTitle>支出の割合</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {expenseFields
              .filter(({ key }) => localExpenses[key] > 0)
              .sort((a, b) => localExpenses[b.key] - localExpenses[a.key])
              .map(({ key, label, color }) => {
                const value = localExpenses[key];
                const percentage = totalMonthly > 0 ? (value / totalMonthly) * 100 : 0;
                
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <span className="font-medium">{formatCurrency(value)}</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${color} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          支出を保存
        </Button>
      </div>
    </div>
  );
}
